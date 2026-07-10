"use client";

import { useState } from "react";
import { X, Coffee, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { login, register } from "@/utils/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, username: string, isAdmin: boolean) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      let result;
      if (mode === "login") {
        result = login(username, password);
      } else {
        result = register(username, password, email);
      }

      if (result.success && result.token && result.user) {
        onAuthSuccess(result.token, result.user.username, result.user.isAdmin);
        onClose();
        setUsername("");
        setPassword("");
        setEmail("");
      } else {
        setError(result.error || "Erro desconhecido");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md mx-4 bg-coffee-900 border border-coffee-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-coffee-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6 text-coffee-400" />
            <h2 className="text-xl font-bold text-white">
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </h2>
          </div>
          <button onClick={onClose} className="text-coffee-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-coffee-700">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === "login"
                ? "text-coffee-400 border-b-2 border-coffee-400 bg-coffee-800/50"
                : "text-coffee-500 hover:text-coffee-300"
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === "register"
                ? "text-coffee-400 border-b-2 border-coffee-400 bg-coffee-800/50"
                : "text-coffee-500 hover:text-coffee-300"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-coffee-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-coffee-800 border border-coffee-600 rounded-lg px-4 py-2.5 text-white placeholder-coffee-500 focus:outline-none focus:border-coffee-400 focus:ring-1 focus:ring-coffee-400 transition-all"
              placeholder="Seu username"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm text-coffee-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-coffee-800 border border-coffee-600 rounded-lg px-4 py-2.5 text-white placeholder-coffee-500 focus:outline-none focus:border-coffee-400 focus:ring-1 focus:ring-coffee-400 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-coffee-300 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-coffee-800 border border-coffee-600 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-coffee-500 focus:outline-none focus:border-coffee-400 focus:ring-1 focus:ring-coffee-400 transition-all"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coffee-500 hover:bg-coffee-400 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Criar Conta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
