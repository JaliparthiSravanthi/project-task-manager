import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchTasks, createTask, updateTask, deleteTask } from "../store/slices/tasksSlice";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Check,
  X,
  PlusCircle,
  FolderOpen
} from "lucide-react";
import { Project, Task } from "../types";

interface ProjectBoardProps {
  project: Project;
}

export default function ProjectBoard({ project }: ProjectBoardProps) {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  // States
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "dueDate">("date");

  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Fetch tasks for current project
  useEffect(() => {
    dispatch(fetchTasks(project.id));
  }, [project.id, dispatch]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    dispatch(createTask({
      projectId: project.id,
      title: taskTitle.trim(),
      dueDate: dueDate || undefined
    }));

    setTaskTitle("");
    setDueDate("");
  };

  const handleToggleTask = (task: Task) => {
    dispatch(updateTask({
      projectId: project.id,
      id: task.id,
      completed: !task.completed
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTask({
      projectId: project.id,
      id: taskId
    }));
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate || "");
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
  };

  const handleSaveEditTask = (taskId: string) => {
    if (!editTitle.trim()) return;
    dispatch(updateTask({
      projectId: project.id,
      id: taskId,
      title: editTitle.trim(),
      dueDate: editDueDate || undefined
    }));
    setEditingTaskId(null);
  };

  // Filter and sort computation
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterStatus === "completed") return matchesSearch && task.completed;
      if (filterStatus === "active") return matchesSearch && !task.completed;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      // "date" (createdAt default)
      return b.createdAt.localeCompare(a.createdAt);
    });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Rate Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-5 rounded-2xl flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider block">COMPLETION RATE</span>
            <span className="text-2xl font-display font-bold text-zinc-950 dark:text-zinc-50 mt-1 block">
              {completionRate}%
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
          <div className="relative h-14 w-14 flex items-center justify-center">
            {/* Circular progress bar SVG representation */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-indigo-600 dark:stroke-indigo-500"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - completionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Total Tasks Active Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-5 rounded-2xl flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider block">ACTIVE TASKS</span>
            <span className="text-2xl font-display font-bold text-zinc-950 dark:text-zinc-50 mt-1 block">
              {pendingTasks}
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">Tasks remaining to execute</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FolderOpen className="h-5 w-5" />
          </div>
        </div>

        {/* Finished Tasks Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-5 rounded-2xl flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider block">COMPLETED</span>
            <span className="text-2xl font-display font-bold text-zinc-950 dark:text-zinc-50 mt-1 block">
              {completedTasks}
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">Successfully resolved tasks</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Task Creation Form inline */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-2xl p-5 shadow-xs transition-colors">
        <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center space-x-2">
          <PlusCircle className="h-4 w-4 text-indigo-600" />
          <span>Quick Create Task</span>
        </h3>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              id="new-task-title"
              type="text"
              required
              placeholder="What needs to be done?..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650 focus:border-transparent text-slate-850 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all font-sans"
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-450 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                id="new-task-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650 focus:border-transparent text-slate-800 dark:text-zinc-200 transition-all cursor-text font-sans"
              />
            </div>
            <button
              id="create-task-submit"
              type="submit"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-sm rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Task Filters & Sorting Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            id="search-tasks-input"
            type="text"
            placeholder="Search project tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650 text-slate-800 dark:text-zinc-150 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Filters and sorting layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status buttons */}
          <div className="flex items-center space-x-1 bg-white/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl">
            {(["all", "active", "completed"] as const).map((status) => (
              <button
                key={status}
                id={`filter-task-${status}`}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                  filterStatus === status
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sorting Trigger */}
          <div className="flex items-center space-x-2 bg-white/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              id="sort-tasks-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-600 dark:text-zinc-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="date" className="dark:bg-zinc-900">Newest</option>
              <option value="title" className="dark:bg-zinc-900">A-Z Title</option>
              <option value="dueDate" className="dark:bg-zinc-900">Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Grid Container */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-2xl"
            >
              <AlertCircle className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No matching tasks found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-550 mt-1">Get started by pinning a task above.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const isEditing = editingTaskId === task.id;
              const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`group flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border rounded-xl transition-all ${
                    task.completed
                      ? "border-teal-100/50 bg-teal-50/10 dark:border-teal-950/20"
                      : "border-slate-200 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-4">
                    {/* Circle Check Radio Box */}
                    <button
                      id={`toggle-task-btn-${task.id}`}
                      onClick={() => handleToggleTask(task)}
                      className="p-1 rounded-full text-slate-400 hover:text-indigo-650 dark:text-zinc-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5.5 w-5.5 text-green-500 dark:text-green-400" />
                      ) : (
                        <Circle className="h-5.5 w-5.5" />
                      )}
                    </button>

                    {/* Task Title Content Area */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <input
                            id={`edit-task-input-title-${task.id}`}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            ref={(input) => input?.focus()}
                            className="bg-slate-50 dark:bg-zinc-800 px-3 py-1 text-xs rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-650 flex-1 border border-slate-200"
                          />
                          <input
                            id={`edit-task-input-dueDate-${task.id}`}
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-800 px-3 py-1 text-xs rounded-lg text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-650 border border-slate-200"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                          <span
                            onClick={() => startEditTask(task)}
                            className={`text-sm font-medium transition-all truncate block cursor-pointer hover:underline ${
                              task.completed
                                ? "text-zinc-400 dark:text-zinc-500 line-through"
                                : "text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* Task due date badge */}
                          {task.dueDate && (
                            <span
                              className={`inline-flex items-center space-x-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full mt-1 sm:mt-0 max-w-fit ${
                                task.completed
                                  ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                                  : isOverdue
                                  ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                  : "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              <span>{task.dueDate}</span>
                              {isOverdue && !task.completed && (
                                <span className="font-sans font-semibold text-[10px] pl-1">Overdue</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button
                          id={`save-edit-task-${task.id}`}
                          onClick={() => handleSaveEditTask(task.id)}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/25 cursor-pointer transition-colors"
                          title="Save task"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          id={`cancel-edit-task-${task.id}`}
                          onClick={cancelEditTask}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          id={`edit-task-btn-${task.id}`}
                          onClick={() => startEditTask(task)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`delete-task-btn-${task.id}`}
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-950/25 cursor-pointer transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
