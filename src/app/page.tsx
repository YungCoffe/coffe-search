"use client";

import { useState, useEffect } from "react";
import {
  Coffee, LogOut, Shield, CreditCard, MessageSquare,
  BarChart3, Zap, Lock
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import SearchChat from "@/components/SearchChat";
import AdminPanel from "@/components/AdminPanel";
import PaymentModal from "@/components/PaymentModal";
import { getCurrentUser, logout, setToken } from "@/utils/auth";
import { findUserById, canMakeRequest } from "@/utils/db";

type View = "chat" | "admin";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; isAdmin: boolean } | null>(null);
  const [view, setView] = useState<View>("chat");
  const [remaining, setRemaining] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      updateRemaining(current.id);
    } else {
      setIsAuthOpen(true);
    }
  }, []);

  const updateRemaining = (userId: string) => {
    const dbUser = findUserById(userId);
    if (dbUser) {
      const { remaining } = canMakeRequest(dbUser);
      setRemaining(remaining);
    }
  };

  const handleAuthSuccess = (token: string, username: string, isAdmin: boolean) => {
    setToken(token);
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      updateRemaining(current.id);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView("chat");
    setIsAuthOpen(true);
  };

  const handleRequestUsed = () => {
    if (user) {
      updateRemaining(user.id);
    }
  };

  const handlePaymentSuccess = () => {
    if (user) {
      updateRemaining(user.id);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-coffee-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Coffee className="w-12 h-12 text-coffee-500 animate-pulse" />
          <p className="text-coffee-400 text-sm">Carregando Coffee Search...</p>
        </div>
      </div>
    );
  }

  // Admin Panel View
  if (view === "admin" && user?.isAdmin) {
    return <AdminPanel onBack={() => setView("chat")} />;
  }

  return (
    <div className="min-h-screen bg-coffee-950 flex flex-col">
      {/* Navbar */}
      <nav className="bg-coffee-900 border-b border-coffee-700 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-coffee-600 rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Coffee Search</h1>
              <p className="text-[10px] text-coffee-400 leading-tight">Comparador Inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && !user.isAdmin && (
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-coffee-800 hover:bg-coffee-700 border border-coffee-600 text-coffee-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="font-medium">{remaining}</span>
                <span className="text-coffee-500">restantes</span>
              </button>
            )}

            {user?.isAdmin && (
              <button
                onClick={() => setView("admin")}
                className="flex items-center gap-1.5 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-700/50 text-yellow-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}

            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-coffee-800 border border-coffee-700 rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 bg-coffee-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-coffee-300 font-medium">{user.username}</span>
                  {user.isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-coffee-800 rounded-lg transition-colors text-coffee-400 hover:text-red-400"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {user ? (
          <SearchChat
            userId={user.id}
            username={user.username}
            isAdmin={user.isAdmin}
            onRequestUsed={handleRequestUsed}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Coffee className="w-16 h-16 text-coffee-600 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Bem-vindo ao Coffee Search</h2>
              <p className="text-coffee-400 max-w-md mx-auto">
                Faça login para começar a comparar preços com inteligência artificial.
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-coffee-500 hover:bg-coffee-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Entrar / Cadastrar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-coffee-800 bg-coffee-900/50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-coffee-500">
            <Coffee className="w-3.5 h-3.5" />
            <span>Coffee Search © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-coffee-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Powered by Gemini AI
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Dados seguros
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          if (user) setIsAuthOpen(false);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      {user && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          userId={user.id}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
