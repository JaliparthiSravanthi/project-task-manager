import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "../store";
import { requestOtp, verifyOtp, clearError } from "../store/slices/authSlice";
import { Mail, CheckCircle, ShieldCheck, ArrowRight, Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const { loading, error, otpRequestedEmail, simulatedOtp } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear local/global errors on mount or state shift
  useEffect(() => {
    dispatch(clearError());
    setLocalError(null);
  }, [otpRequestedEmail, dispatch]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return;
    }

    dispatch(requestOtp(email));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Make sure we have 6 digits code
    if (!otpCode || otpCode.trim().length !== 6) {
      setLocalError("Please enter the 6-digit verification code");
      return;
    }

    if (otpRequestedEmail) {
      dispatch(verifyOtp({ email: otpRequestedEmail, code: otpCode.trim() }));
    }
  };

  const autofillOtp = () => {
    if (simulatedOtp) {
      setOtpCode(simulatedOtp);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Brand / Logo Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 mb-4"
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl font-display font-bold tracking-tight text-slate-800 dark:text-zinc-100"
          >
            Let's get verified
          </motion.h2>
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-xs text-slate-500 dark:text-zinc-400 mt-2"
          >
            {otpRequestedEmail
              ? `Verification OTP sent to ${otpRequestedEmail}`
              : "Access your workspace dashboard instantly with a secure, passwordless authentication flow."}
          </motion.p>
        </div>

        {/* Auth Forms */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-slate-200 dark:border-zinc-800 shadow-md shadow-slate-100/50 dark:shadow-none"
        >
          <AnimatePresence mode="wait">
            {!otpRequestedEmail ? (
              /* --- STATE 1: REQUEST OTP --- */
              <motion.form
                key="request-otp-form"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-505 tracking-wider uppercase mb-2">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="auth-email-input"
                      type="email"
                      value={email}
                      required
                      placeholder="you@email.com"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-805 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800 dark:text-zinc-100 disabled:opacity-50 transition-all font-sans"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">
                    A test user account will automatically be initiated on verification.
                  </p>
                </div>

                {/* Display Error Feedback */}
                {(localError || error) && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-xs text-red-655 text-red-600 dark:text-red-400 rounded-xl">
                    {localError || error}
                  </div>
                )}

                <button
                  id="auth-request-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* --- STATE 2: VERIFY OTP --- */
              <motion.form
                key="verify-otp-form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-505 tracking-wider uppercase">
                      6-DIGIT VERIFICATION CODE
                    </label>
                    <button
                      type="button"
                      onClick={() => dispatch(requestOtp(otpRequestedEmail))}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Resend</span>
                    </button>
                  </div>
                  <input
                    id="auth-otp-input"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="E.g. 123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-801 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800 dark:text-zinc-100 placeholder:tracking-normal transition-all"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-550 mt-2 text-center">
                    Check the simulated developer console box displayed below to read the OTP.
                  </p>
                </div>

                {/* Display Error Feedback */}
                {(localError || error) && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-xs text-red-655 text-red-600 dark:text-red-400 rounded-xl">
                    {localError || error}
                  </div>
                )}

                <button
                  id="auth-verify-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-805 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Validate & Access</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- SIMULATED SMS/EMAIL OTP BROADCASTER (DEV CONSOLE) --- */}
        <AnimatePresence>
          {otpRequestedEmail && simulatedOtp && (
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-6 p-5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"
            >
              <div className="flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-mono font-bold text-slate-500 dark:text-indigo-400 uppercase tracking-wider">
                    Developer OTP Box Simulator
                  </h4>
                  <p className="text-xs text-slate-655 text-slate-705 dark:text-zinc-300 mt-1">
                    An email with an activation key has been simulated for:{" "}
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {otpRequestedEmail}
                    </span>
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-850 border border-slate-200/60 dark:border-zinc-800/60 p-2 rounded-xl mt-3">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                      Your Pass Code:
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-indigo-400 select-all tracking-wider px-2 py-0.5 rounded bg-slate-50 dark:bg-zinc-800">
                      {simulatedOtp}
                    </span>
                  </div>
                  <button
                    id="autofill-otp-btn"
                    type="button"
                    onClick={autofillOtp}
                    className="w-full mt-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    ⚡ Auto-Fill Pass Code
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
