import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { fetchCurrentUser } from "./store/slices/authSlice";
import Header from "./components/Header";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { Loader2 } from "lucide-react";

function AppContent() {
  const dispatch = useAppDispatch();
  const { user, token, loading } = useAppSelector((state) => state.auth);

  // Theme states
  const [darkMode, setDarkMode] = useState(() => {
    const local = localStorage.getItem("workspace-theme");
    if (local) {
      return local === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Check local session cookie or token on first boot
    if (localStorage.getItem("token")) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Handle document system theme class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("workspace-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("workspace-theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  if (loading && !user && token) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-zinc-950" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase">Synchronizing Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
      <Header darkMode={darkMode} onToggleTheme={toggleTheme} />
      {user ? <Dashboard /> : <AuthScreen />}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
