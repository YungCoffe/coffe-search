"use client";

// ============================================
// COFFEE SEARCH - BANCO DE DADOS LOCAL
// Persistência via localStorage (simula BD real)
// ============================================

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  requestsToday: number;
  lastRequestDate: string; // YYYY-MM-DD
  totalRequests: number;
  isAdmin: boolean;
  paidRequests: number; // requests extras comprados
  createdAt: string;
}

export interface RequestLog {
  id: string;
  userId: string;
  username: string;
  productName: string;
  timestamp: string;
  success: boolean;
}

const DB_KEYS = {
  users: "coffee_users",
  requests: "coffee_requests",
  initialized: "coffee_db_init",
};

// Admin hash pré-calculado para "84233031"
const ADMIN_PASSWORD_HASH = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

// Inicializa o banco com o admin
function initDB(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(DB_KEYS.initialized)) return;

  const adminUser: User = {
    id: "admin-coffee-001",
    username: "Coffe",
    passwordHash: ADMIN_PASSWORD_HASH,
    email: "admin@coffee-search.com",
    requestsToday: 0,
    lastRequestDate: new Date().toISOString().split("T")[0],
    totalRequests: 0,
    isAdmin: true,
    paidRequests: 999999,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(DB_KEYS.users, JSON.stringify([adminUser]));
  localStorage.setItem(DB_KEYS.requests, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.initialized, "true");
}

// Get all users
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  initDB();
  const data = localStorage.getItem(DB_KEYS.users);
  return data ? JSON.parse(data) : [];
}

// Save users
function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEYS.users, JSON.stringify(users));
}

// Get all request logs
export function getRequestLogs(): RequestLog[] {
  if (typeof window === "undefined") return [];
  initDB();
  const data = localStorage.getItem(DB_KEYS.requests);
  return data ? JSON.parse(data) : [];
}

function saveRequestLogs(logs: RequestLog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEYS.requests, JSON.stringify(logs));
}

// Find user by username
export function findUserByUsername(username: string): User | null {
  const users = getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

// Find user by ID
export function findUserById(id: string): User | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

// Create new user
export function createUser(username: string, passwordHash: string, email: string): User {
  const users = getUsers();
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    username,
    passwordHash,
    email,
    requestsToday: 0,
    lastRequestDate: new Date().toISOString().split("T")[0],
    totalRequests: 0,
    isAdmin: false,
    paidRequests: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Update user
export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
}

// Check and reset daily requests
export function checkAndResetDailyRequests(user: User): User {
  const today = new Date().toISOString().split("T")[0];
  if (user.lastRequestDate !== today) {
    user.requestsToday = 0;
    user.lastRequestDate = today;
    updateUser(user);
  }
  return user;
}

// Can user make request?
export function canMakeRequest(user: User): { allowed: boolean; remaining: number } {
  const checkedUser = checkAndResetDailyRequests(user);
  const dailyLimit = 5;
  const totalAvailable = dailyLimit + checkedUser.paidRequests;
  const used = checkedUser.requestsToday;
  const remaining = Math.max(0, totalAvailable - used);
  return { allowed: remaining > 0, remaining };
}

// Increment request count
export function incrementRequest(userId: string, productName: string, success: boolean): void {
  const user = findUserById(userId);
  if (!user) return;

  user.requestsToday += 1;
  user.totalRequests += 1;
  updateUser(user);

  const logs = getRequestLogs();
  logs.push({
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username: user.username,
    productName,
    timestamp: new Date().toISOString(),
    success,
  });
  saveRequestLogs(logs);
}

// Add paid requests
export function addPaidRequests(userId: string, amount: number): void {
  const user = findUserById(userId);
  if (!user) return;
  user.paidRequests += amount;
  updateUser(user);
}

// Get stats for admin
export function getAdminStats() {
  const users = getUsers();
  const logs = getRequestLogs();
  const today = new Date().toISOString().split("T")[0];

  return {
    totalUsers: users.filter((u) => !u.isAdmin).length,
    totalRequests: logs.length,
    todayRequests: logs.filter((l) => l.timestamp.startsWith(today)).length,
    activeToday: new Set(
      logs.filter((l) => l.timestamp.startsWith(today)).map((l) => l.userId)
    ).size,
    usersList: users.map((u) => ({
      ...u,
      remainingToday: (5 + u.paidRequests) - u.requestsToday,
    })),
    recentLogs: logs.slice(-50).reverse(),
  };
}
