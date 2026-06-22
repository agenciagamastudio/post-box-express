import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NotificationItem = {
  id: string;
  label: string;
  href: string;
  createdAt?: string;
};

export type NotificationsResult = {
  total: number;
  approval: NotificationItem[];
  overdue: NotificationItem[];
  failed: NotificationItem[];
};

export function useNotifications() {
  return useQuery<NotificationsResult>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch in parallel
      const [approvalRes, overdueRes, failedRes] = await Promise.all([
        supabase.from("posts").select("id,title").eq("status", "aprovacao"),
        supabase
          .from("finance_entries")
          .select("id,description,due_at")
          .lt("due_at", today.toISOString())
          .is("paid_at", null),
        supabase
          .from("publish_log")
          .select("id,message,created_at")
          .eq("status", "failed")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const approval: NotificationItem[] = (approvalRes.data || []).map((post) => ({
        id: post.id,
        label: post.title || "Post sem título",
        href: "/kanban",
        createdAt: new Date().toISOString(),
      }));

      const overdue: NotificationItem[] = (overdueRes.data || []).map((entry) => ({
        id: entry.id,
        label: entry.description || "Conta vencida",
        href: "/financeiro",
        createdAt: entry.due_at,
      }));

      const failed: NotificationItem[] = (failedRes.data || []).map((log) => ({
        id: log.id,
        label: log.message || "Falha de publicação",
        href: "/automacao",
        createdAt: log.created_at,
      }));

      return {
        total: approval.length + overdue.length + failed.length,
        approval,
        overdue,
        failed,
      };
    },
    refetchInterval: 60_000,
  });
}
