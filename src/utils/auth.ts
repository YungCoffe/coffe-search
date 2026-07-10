"use client";

import bcryptjs from "bcryptjs";
import { findUserByUsername, createUser, User, updateUser } from "./db";

const JWT_SECRET = "coffee-search-secret-key-2026-84233031";

// Simple JWT-like token (base64 encoded JSON)
function createToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
  };
  return btoa(JSON.stringify(payload));
}

function verifyToken(token: string): { id: string; username: string; isAdmin: boolean } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, username: payload.username, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcryptjs.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcryptjs.compareSync(password, hash);
}

export function login(username: string, password: string): { success: boolean; token?: string; user?: User; error?: string } {
  const user = findUserByUsername(username);
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Senha incorreta" };
  }
  const token = createToken(user);
  return { success: true, token, user };
}

export function register(username: string, password: string, email: string): { success: boolean; token?: string; user?: User; error?: string } {
  if (findUserByUsername(username)) {
    return { success: false, error: "Usuário já existe" };
  }
  if (username.length < 3) {
    return { success: false, error: "Username deve ter pelo menos 3 caracteres" };
  }
  if (password.length < 6) {
    return { success: false, error: "Senha deve ter pelo menos 6 caracteres" };
  }
  const passwordHash = hashPassword(password);
  const user = createUser(username, passwordHash, email);
  const token = createToken(user);
  return { success: true, token, user };
}

export function getCurrentUser(): { id: string; username: string; isAdmin: boolean } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("coffee_token");
  if (!token) return null;
  return verifyToken(token);
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("coffee_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("coffee_token", token);
}
