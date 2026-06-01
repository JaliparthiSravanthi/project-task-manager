import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db.json");

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface OTP {
  email: string;
  code: string;
  expiresAt: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface DBConfig {
  users: User[];
  projects: Project[];
  tasks: Task[];
  otps: OTP[];
}

const initialDb: DBConfig = {
  users: [],
  projects: [],
  tasks: [],
  otps: [],
};

export function getDb(): DBConfig {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database read error:", err);
    return initialDb;
  }
}

export function writeDb(data: DBConfig) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database write error:", err);
  }
}
