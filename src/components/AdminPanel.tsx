"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Users, Activity, TrendingUp, Clock,
  ArrowLeft, Search, ShoppingBag, CreditCard, Crown
} from "lucide-react";
import { getAdminStats, getUsers, addPaidRequests, User } from "@/utils/db";

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    todayRequests: 0,
    activeToday: 0,
    usersList: [] as (User & { remainingToday: number })[],
    recentLogs: [] as any[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setStats(getAdminStats());
  };

  const handleAddRequests = (userId: string) => {
    addPaidRequests(userId, 10);
    loadStats();
    setSelectedUser(null);
  };

  const filteredUsers = stats.usersList.filter(
    (u) =>
      !u.isAdmin &&
      (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-coffee-950">
      {/* Header */}
      <div className="bg-coffee-900 border-b border-coffee-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-coffee-800 rounded-lg transition-colors text-coffee-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Crown className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-xs text-coffee-400">Coffee Search - Visão geral do sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-coffee-400">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleString("pt-BR")}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-coffee-900 border border-coffee-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-400 uppercase tracking-wider">Usuários</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-coffee-400" />
              </div>
            </div>
          </div>

          <div className="bg-coffee-900 border border-coffee-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-400 uppercase tracking-wider">Total Requests</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalRequests}</p>
              </div>
              <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-coffee-400" />
              </div>
            </div>
          </div>

          <div className="bg-coffee-900 border border-coffee-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-400 uppercase tracking-wider">Hoje</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.todayRequests}</p>
              </div>
              <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-coffee-900 border border-coffee-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-400 uppercase tracking-wider">Ativos Hoje</p>
                <p className="text-2xl font-bold text-coffee-300 mt-1">{stats.activeToday}</p>
              </div>
              <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-coffee-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-coffee-900 border border-coffee-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-coffee-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-coffee-400" />
              Usuários
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-coffee-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário..."
                className="bg-coffee-800 border border-coffee-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-coffee-500 focus:outline-none focus:border-coffee-400 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-coffee-800/50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Usuário</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Email</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Total Requests</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Hoje</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Restantes</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Extras</th>
                  <th className="px-5 py-3 text-xs font-medium text-coffee-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-coffee-800 hover:bg-coffee-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-coffee-700 rounded-full flex items-center justify-center text-sm font-bold text-coffee-300">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-coffee-300">{user.email}</td>
                    <td className="px-5 py-3 text-sm text-coffee-300">{user.totalRequests}</td>
                    <td className="px-5 py-3 text-sm text-coffee-300">{user.requestsToday}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        user.remainingToday > 2 ? "text-green-400 bg-green-900/30" :
                        user.remainingToday > 0 ? "text-yellow-400 bg-yellow-900/30" :
                        "text-red-400 bg-red-900/30"
                      }`}>
                        {user.remainingToday}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-coffee-300">{user.paidRequests}</td>
                    <td className="px-5 py-3">
                      {selectedUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddRequests(user.id)}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            Confirmar +10
                          </button>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="text-coffee-400 hover:text-white text-xs px-2"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(user.id)}
                          className="flex items-center gap-1 bg-coffee-700 hover:bg-coffee-600 text-coffee-200 text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          +10 Requests (R$5)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-coffee-500 text-sm">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-coffee-900 border border-coffee-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-coffee-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-coffee-400" />
              Atividade Recente
            </h2>
          </div>
          <div className="divide-y divide-coffee-800">
            {stats.recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between hover:bg-coffee-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-sm text-white">
                      <span className="font-medium">{log.username}</span> buscou{" "}
                      <span className="text-coffee-400">"{log.productName}"</span>
                    </p>
                    <p className="text-xs text-coffee-500">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  log.success ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                }`}>
                  {log.success ? "Sucesso" : "Falha"}
                </span>
              </div>
            ))}
            {stats.recentLogs.length === 0 && (
              <div className="px-5 py-8 text-center text-coffee-500 text-sm">
                Nenhuma atividade registrada ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
