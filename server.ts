import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { getDb, writeDb, User, OTP, Project, Task } from "./src/server/db";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "taskmaster_jwt_secret_key_2026_xYz987";

// Define strong auth extension
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Logging utility middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Unique ID Generator
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // AUTH MIDDLEWARE
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ error: "Invalid or expired access token" });
        return;
      }
      req.user = decoded as { id: string; email: string };
      next();
    });
  };

  // --- REST API ENDPOINTS ---

  // Auth: Request OTP
  app.post("/api/auth/request-otp", (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required" });
      return;
    }

    const db = getDb();
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits OTP code
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Clear old OTPs for this email and save the new one
    db.otps = db.otps.filter(o => o.email !== email);
    db.otps.push({ email, code, expiresAt });
    writeDb(db);

    console.log(`[OTP Simulated Email] Sent OTP ${code} to ${email}`);

    // Return the OTP in the payload so developers / reviewers don't have to trace terminal logs!
    res.json({
      success: true,
      message: "An OTP has been simulated and sent to your email address.",
      simulatedOtp: code
    });
  });

  // Auth: Verify OTP (and login / signup)
  app.post("/api/auth/verify-otp", (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: "Email and OTP code are required" });
      return;
    }

    const db = getDb();
    const otpMatch = db.otps.find(o => o.email === email && o.code === code);

    if (!otpMatch) {
      res.status(400).json({ error: "Invalid verification code provided" });
      return;
    }

    if (Date.now() > otpMatch.expiresAt) {
      // Clean up expired OTP
      db.otps = db.otps.filter(o => o.email !== email);
      writeDb(db);
      res.status(400).json({ error: "The verification code has expired" });
      return;
    }

    // Clean up used OTP
    db.otps = db.otps.filter(o => o.email !== email);

    // Fetch existing user or Create a new user
    let user = db.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: generateId(),
        email,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    }
    
    writeDb(db);

    // Sign JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user
    });
  });

  // Auth: Me
  app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const db = getDb();
    const user = db.users.find(u => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }
    res.json({ success: true, user });
  });

  // Projects: Get List
  app.get("/api/projects", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const db = getDb();
    const userProjects = db.projects.filter(p => p.userId === userId);
    res.json({ success: true, projects: userProjects });
  });

  // Projects: Create
  app.post("/api/projects", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: "Project title is required" });
      return;
    }

    const db = getDb();
    const newProject: Project = {
      id: generateId(),
      userId,
      title,
      description: description || "",
      createdAt: new Date().toISOString()
    };

    db.projects.push(newProject);
    writeDb(db);

    res.status(201).json({ success: true, project: newProject });
  });

  // Projects: Update
  app.put("/api/projects/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ error: "Project title is required" });
      return;
    }

    const db = getDb();
    const projectIndex = db.projects.findIndex(p => p.id === id && p.userId === userId);

    if (projectIndex === -1) {
      res.status(404).json({ error: "Project not found or unauthorized access" });
      return;
    }

    db.projects[projectIndex] = {
      ...db.projects[projectIndex],
      title,
      description: description ?? db.projects[projectIndex].description
    };

    writeDb(db);

    res.json({ success: true, project: db.projects[projectIndex] });
  });

  // Projects: Delete
  app.delete("/api/projects/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const db = getDb();
    const projectIndex = db.projects.findIndex(p => p.id === id && p.userId === userId);

    if (projectIndex === -1) {
      res.status(404).json({ error: "Project not found or unauthorized access" });
      return;
    }

    // Delete Project
    db.projects.splice(projectIndex, 1);

    // Cascading Delete: Delete associated Tasks
    db.tasks = db.tasks.filter(t => t.projectId !== id);
    writeDb(db);

    res.json({ success: true, message: "Project and its tasks successfully deleted" });
  });

  // Tasks: Get List
  app.get("/api/projects/:projectId/tasks", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { projectId } = req.params;

    const db = getDb();
    // Validate project ownership
    const project = db.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) {
      res.status(404).json({ error: "Project access denied or project not found" });
      return;
    }

    const projectTasks = db.tasks.filter(t => t.projectId === projectId);
    res.json({ success: true, tasks: projectTasks });
  });

  // Tasks: Create
  app.post("/api/projects/:projectId/tasks", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { projectId } = req.params;
    const { title, dueDate } = req.body;

    if (!title) {
      res.status(400).json({ error: "Task title is required" });
      return;
    }

    const db = getDb();
    // Validate project ownership
    const project = db.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) {
      res.status(404).json({ error: "Project access denied or project not found" });
      return;
    }

    const newTask: Task = {
      id: generateId(),
      projectId,
      userId: userId!,
      title,
      completed: false,
      dueDate,
      createdAt: new Date().toISOString()
    };

    db.tasks.push(newTask);
    writeDb(db);

    res.status(201).json({ success: true, task: newTask });
  });

  // Tasks: Update
  app.put("/api/projects/:projectId/tasks/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { projectId, id } = req.params;
    const { title, completed, dueDate } = req.body;

    const db = getDb();
    // Validate project ownership
    const project = db.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) {
      res.status(404).json({ error: "Project access denied or project not found" });
      return;
    }

    const taskIndex = db.tasks.findIndex(t => t.id === id && t.projectId === projectId);
    if (taskIndex === -1) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    db.tasks[taskIndex] = {
      ...db.tasks[taskIndex],
      title: title ?? db.tasks[taskIndex].title,
      completed: completed ?? db.tasks[taskIndex].completed,
      dueDate: dueDate !== undefined ? dueDate : db.tasks[taskIndex].dueDate
    };

    writeDb(db);

    res.json({ success: true, task: db.tasks[taskIndex] });
  });

  // Tasks: Delete
  app.delete("/api/projects/:projectId/tasks/:id", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { projectId, id } = req.params;

    const db = getDb();
    // Validate project ownership
    const project = db.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) {
      res.status(404).json({ error: "Project access denied or project not found" });
      return;
    }

    const taskIndex = db.tasks.findIndex(t => t.id === id && t.projectId === projectId);
    if (taskIndex === -1) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    db.tasks.splice(taskIndex, 1);
    writeDb(db);

    res.json({ success: true, message: "Task deleted successfully" });
  });


  // --- VITE WEB AND STATIC ASSETS MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support SPA router callback
    app.get("*all", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully booted and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to start custom full-stack backend:", err);
});
