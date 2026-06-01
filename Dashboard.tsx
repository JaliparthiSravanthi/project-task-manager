import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchProjects, createProject, updateProject, deleteProject, setActiveProjectId } from "../store/slices/projectsSlice";
import { motion, AnimatePresence } from "motion/react";
import ProjectBoard from "./ProjectBoard";
import {
  Folder,
  Plus,
  Trash2,
  Edit,
  FolderMinus,
  Sparkles,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Clock,
  Info
} from "lucide-react";
import { Project } from "../types";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { projects, loading, error, activeProjectId } = useAppSelector((state) => state.projects);

  // Search through projects
  const [projectSearch, setProjectSearch] = useState("");

  // New Project form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit Project structure
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Delete project validation flag
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch initial user projects on mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dispatch(createProject({ title: newTitle.trim(), description: newDesc.trim() }));
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const startEditProject = (p: Project) => {
    setEditProject(p);
    setEditTitle(p.title);
    setEditDesc(p.description);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject || !editTitle.trim()) return;

    dispatch(updateProject({
      id: editProject.id,
      title: editTitle.trim(),
      description: editDesc.trim(),
    }));
    setEditProject(null);
  };

  const handleDeleteProject = (id: string) => {
    dispatch(deleteProject(id));
    setConfirmDeleteId(null);
  };

  // Filter projects based on input
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* --- SIDEBAR: PROJECTS DIRECTORY --- */}
      <aside className="w-full md:w-80 border-r border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/30 p-5 flex flex-col justify-between shrink-0 transition-all duration-300">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
              Projects Directory ({projects.length})
            </h2>
            <button
              id="projects-add-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 cursor-pointer transition-all"
              title="Add Project"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Create Project Inline Collapsible Box */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleCreateProject}
                className="bg-zinc-50 dark:bg-zinc-850/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3 overflow-hidden"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Project Title</label>
                  <input
                    id="new-project-title"
                    type="text"
                    required
                    maxLength={40}
                    placeholder="E.g. Website Redesign"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 text-zinc-900 dark:text-zinc-100 placeholder:text-slate-400 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Description (Optional)</label>
                  <textarea
                    id="new-project-desc"
                    placeholder="Brief description of project goals"
                    value={newDesc}
                    maxLength={150}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 text-zinc-900 dark:text-zinc-100 placeholder:text-slate-400 font-sans resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    id="new-project-cancel"
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-350 text-[11px] font-semibold rounded-md cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="new-project-save"
                    type="submit"
                    className="px-2.5 py-1.5 bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-md cursor-pointer transition-colors"
                  >
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Search projects */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              id="sidebar-project-search"
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-750 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 text-zinc-900 dark:text-zinc-150 placeholder:text-slate-400 transition-all font-sans"
            />
          </div>

          {/* List of projects */}
          <div className="space-y-1 max-h-[40vh] md:max-h-none overflow-y-auto pr-1">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">
                {projectSearch ? "No projects found" : "Directory is empty"}
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isActive = p.id === activeProjectId;
                return (
                  <div
                    key={p.id}
                    className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50/75 text-indigo-750 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-800/80 font-bold"
                        : "text-slate-600 dark:text-zinc-300 bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-zinc-800/30 hover:border-slate-200/40"
                    }`}
                    onClick={() => dispatch(setActiveProjectId(p.id))}
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                      <Folder className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                      <span className="text-xs truncate font-medium">{p.title}</span>
                    </div>
                    {/* Action buttons (always visible on desktop hover, default on touch) */}
                    <div className="flex items-center space-x-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      <button
                        id={`edit-project-btn-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditProject(p);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? "text-zinc-300 hover:bg-zinc-800 hover:text-white dark:text-zinc-700 dark:hover:bg-zinc-200 dark:hover:text-zinc-950"
                            : "text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700"
                        }`}
                        title="Edit project specs"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        id={`delete-project-btn-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(p.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? "text-zinc-400 hover:bg-zinc-800 hover:text-red-400 dark:text-zinc-600 dark:hover:bg-zinc-200 dark:hover:text-red-500"
                            : "text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                        }`}
                        title="Delete project"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="mt-8 border-t border-slate-200 dark:border-zinc-800 pt-5 hidden md:block">
          <div className="p-3.5 rounded-xl bg-indigo-50/25 dark:bg-indigo-950/10 border border-indigo-200/30 flex items-start space-x-2.5">
            <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-800 dark:text-zinc-300/80 leading-normal">
              <p className="font-bold">Interactive Specs Panel</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Toggle projects directory, manage complete checklist sequences, check status cards and live completion diagnostics.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN FOCUS AREA: PROJECT WORKSPACE BOARD --- */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeProject ? (
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Board Header Title & Info display */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-850 gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-slate-950">
                      <Layers className="h-4 w-4" />
                    </span>
                    <h2 className="text-2xl font-display font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                      {activeProject.title}
                    </h2>
                  </div>
                  {activeProject.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-normal">
                      {activeProject.description}
                    </p>
                  )}
                </div>

                <div className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center space-x-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Created {new Date(activeProject.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Associated Tasks board inside active project */}
              <ProjectBoard project={activeProject} />
            </motion.div>
          ) : (
            /* --- EMPTY DIRECTORY STATE FALLBACK --- */
            <motion.div
              key="empty-dashboard-status"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="min-h-[450px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-850"
            >
              <FolderMinus className="h-12 w-12 text-slate-300 dark:text-zinc-650 mb-3" />
              <h3 className="text-md font-display font-bold text-slate-800 dark:text-zinc-200">
                Workspace is inactive
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mt-1.5">
                Choose an existing project directory from the side menu or configure a new workspace node to initialize checklist trackers.
              </p>
              <button
                id="empty-state-add-btn"
                onClick={() => setShowAddForm(true)}
                className="mt-4 py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-800 cursor-pointer transition-all"
              >
                Assemble Fresh Workspace
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- EDIT SPECS MODAL DIALOG --- */}
      <AnimatePresence>
        {editProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-202 border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-display font-bold text-slate-800 dark:text-zinc-50 flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-indigo-600" />
                  <span>Update Workspace Settings</span>
                </h3>
                <button
                  id="close-edit-modal"
                  onClick={() => setEditProject(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    SPECIFICATION TITLE
                  </label>
                  <input
                    id="edit-project-title-input"
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    DESCRIPTION (Max 150)
                  </label>
                  <textarea
                    id="edit-project-desc-input"
                    value={editDesc}
                    maxLength={150}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 font-sans resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-2.5 pt-4">
                  <button
                    id="cancel-update-project"
                    type="button"
                    onClick={() => setEditProject(null)}
                    className="px-4 py-2 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-update-project"
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CASCADING DELETE CONFIRMATION DIALOG --- */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            >
              <h3 className="text-md font-display font-bold text-red-655 text-red-600 dark:text-red-400">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Deleting this project directory will recursively erase all task boards, checklist records, and histories completed inside it. This action is irreversible.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  id="cancel-delete-modal"
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-350 text-xs font-medium rounded-lg cursor-pointer hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-action"
                  onClick={() => handleDeleteProject(confirmDeleteId)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg cursor-pointer"
                >
                  Delete Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
