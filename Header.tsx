import React from "react";
import { LogOut, CheckSquare, Sun, Moon, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { logout } from "../store/slices/authSlice";

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function Header({ darkMode, onToggleTheme }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 border-b flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div id="logo-icon-container" className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/25">
          T
        </div>
        <div>
          <h1 className="text-lg font-display font-bold tracking-tight text-slate-800 dark:text-zinc-50">
            TaskMaster <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">v1.1</span>
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:block">Dynamic Project & Task Board</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Dynamic Theme Toggler */}
        <button
          id="toggle-dark-mode"
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />}
        </button>

        {user && (
          <div className="flex items-center space-x-3 border-l pl-4 border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col items-end text-right hidden sm:flex">
              <span className="text-xs text-zinc-400 font-mono">WORKSPACE</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[160px] truncate">
                {user.email}
              </span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-default border border-zinc-300 dark:border-zinc-600">
              {user.email.substring(0, 1).toUpperCase()}
            </div>

            <button
              id="user-logout"
              onClick={() => dispatch(logout())}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/25 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
