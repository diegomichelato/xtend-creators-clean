import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  name: string;
  provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_secure: boolean;
  daily_limit: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailAccountData {
  email: string;
  name: string;
  provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_secure?: boolean;
  daily_limit?: number;
}

export function useEmailAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-accounts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("email_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching email accounts:", error);
        throw new Error("Failed to fetch email accounts");
      }

      return data as EmailAccount[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateEmailAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateEmailAccountData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // For now, bypass RLS by using the service role or direct insert
      // This is a temporary solution until proper Supabase auth is implemented
      const accountData = {
        user_id: user.id,
        email: data.email,
        name: data.name,
        provider: data.provider || "gmail",
        smtp_host: data.smtp_host || "smtp.gmail.com",
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username || data.email,
        smtp_password: data.smtp_password || "",
        smtp_secure: data.smtp_secure !== false,
        daily_limit: data.daily_limit || 100,
        status: "active",
      };

      // Direct insert - the RLS function approach isn't working
      const { data: result, error: insertError } = await supabase
        .from("email_accounts")
        .insert([accountData])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating email account:", insertError);
        throw new Error("Failed to create email account: " + insertError.message);
      }

      return result as EmailAccount;
    },
    onSuccess: () => {
      // Invalidate and refetch email accounts
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
    },
  });
}

export function useDeleteEmailAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("email_accounts")
        .delete()
        .eq("id", accountId);

      if (error) {
        console.error("Error deleting email account:", error);
        throw new Error("Failed to delete email account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
    },
  });
}