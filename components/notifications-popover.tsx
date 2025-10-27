"use client";

import { Bell, Trash2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationWithDetails } from "../src/types/notification";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface NotificationsPopoverProps {
  userId: string;
}

export function NotificationsPopover({ userId }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          sender:profiles!notifications_sender_id_fkey (
            id,
            name,
            profile_photo
          ),
          collab:collab_requests!collab_id (
            id,
            title
          )
        `,
        )
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      const transformedData: NotificationWithDetails[] = (data || []).map(
        (notif: any) => ({
          ...notif,
          sender: {
            id: notif.sender?.id || "",
            name: notif.sender?.name?.[0]?.name || "Unknown User",
            profile_photo:
              notif.sender?.profile_photo?.[0]?.profile_photo || null,
          },
          collab: {
            id: notif.collab?.id || "",
            title: notif.collab?.title || "Unknown Collab",
          },
        }),
      );

      setNotifications(transformedData);
      setUnreadCount(transformedData.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error in fetchNotifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          toast("New notification", {
            description: "You have a new notification",
          });
          fetchNotifications();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .in("id", unreadIds);

    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
        read_at: new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => {
      const notif = notifications.find((n) => n.id === notificationId);
      return notif && !notif.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const handleNotificationClick = async (
    notification: NotificationWithDetails,
  ) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    router.push(`/requests/posts`);
    setIsOpen(false);
  };

  const getNotificationMessage = (notification: NotificationWithDetails) => {
    switch (notification.type) {
      case "join_request":
        return notification.message
          ? `wants to join "${notification.collab.title}": ${notification.message}`
          : `wants to join "${notification.collab.title}"`;
      case "request_accepted":
        return `accepted your request to join "${notification.collab.title}"`;
      case "request_rejected":
        return notification.message
          ? `rejected your request to join "${notification.collab.title}": ${notification.message}`
          : `rejected your request to join "${notification.collab.title}"`;
      case "member_removed":
        return notification.message
          ? `removed you from "${notification.collab.title}": ${notification.message}`
          : `removed you from "${notification.collab.title}"`;
      default:
        return "sent you a notification";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer relative group ${
                    !notification.read ? "bg-accent/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={notification.sender.profile_photo || undefined}
                      />
                      <AvatarFallback>
                        {notification.sender.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {notification.sender.name}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {getNotificationMessage(notification)}
                          </span>
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
