import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface GmailAuthStatus {
  isAuthorized: boolean;
  activeTokens: number;
  requiresReauth: string[];
}

export function useGmailAuth(enforceAuth: boolean = false) {
  const [, setLocation] = useLocation();
  
  const { data: authStatus, isLoading, error } = useQuery<GmailAuthStatus>({
    queryKey: ["/api/gmail/auth-status"],
    retry: false,
  });

  // Redirect to holding page if auth is required but not available
  useEffect(() => {
    if (enforceAuth && !isLoading && authStatus && !authStatus.isAuthorized) {
      setLocation("/gmail-holding");
    }
  }, [enforceAuth, isLoading, authStatus, setLocation]);

  return {
    isAuthorized: authStatus?.isAuthorized ?? false,
    activeTokens: authStatus?.activeTokens ?? 0,
    requiresReauth: authStatus?.requiresReauth ?? [],
    isLoading,
    error,
    // Helper to check if user can perform email operations
    canSendEmails: authStatus?.isAuthorized && authStatus?.activeTokens > 0,
    // Helper to redirect to Gmail settings
    redirectToAuth: () => setLocation("/gmail-settings")
  };
}

// Hook specifically for pages that require Gmail authorization
export function useRequireGmailAuth() {
  return useGmailAuth(true);
}