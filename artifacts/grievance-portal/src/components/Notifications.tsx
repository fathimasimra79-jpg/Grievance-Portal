import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  useListNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead,
  getListNotificationsQueryKey
} from "@workspace/api-client-react";
import { getAuthHeaders, cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useListNotifications({
    request: getAuthHeaders(),
    query: {
      refetchInterval: 30000, // Poll every 30s
    }
  });

  const markRead = useMarkNotificationRead({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  const markAllRead = useMarkAllNotificationsRead({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-destructive rounded-full border-2 border-background animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <h3 className="font-semibold font-display">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="h-8 text-xs text-primary"
                >
                  <Check className="w-4 h-4 mr-1" /> Mark all read
                </Button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 transition-colors hover:bg-muted/50 flex items-start gap-3",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                        !n.isRead ? "bg-primary" : "bg-transparent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !n.isRead && "font-medium text-foreground")}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={() => markRead.mutate({ id: n.id })}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
