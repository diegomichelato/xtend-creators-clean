import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// Generate a consistent UUID for the demo user
function generateDemoUserId(): string {
  return "47440a8a-e5ae-4f38-8c92-7fccf9387017"; // Fixed UUID for demo
}

// Simple authentication utility that requires actual login
export function isAuthenticated(): boolean {
  try {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    const parsed = JSON.parse(user);
    // Only consider authenticated if user has proper login data
    return !!(parsed && parsed.id && parsed.username);
  } catch {
    return false;
  }
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      // Only return user if they have proper authentication data
      if (parsed && parsed.id && parsed.username) {
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function saveUser(userData: any) {
  localStorage.setItem('user', JSON.stringify(userData));
  // Trigger a custom event to notify components of auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged'));
}

// React hook for authentication
export function useAuth() {
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}