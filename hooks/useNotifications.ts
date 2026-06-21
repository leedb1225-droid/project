'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  user_email: string;
  message_id: string;
  sender_nickname: string;
  coupon_type: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

export function useNotifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(0);
  const [hasNewNotif, setHasNewNotif] = useState(false);

  const userEmail = session?.user?.email;

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data: Notification[] = await res.json();

      setNotifications((prev) => {
        const prevUnread = prev.filter(n => !n.is_read).length;
        const newUnread = data.filter(n => !n.is_read).length;
        // Trigger ring animation if unread count increased
        if (newUnread > prevUnread && prevCountRef.current > 0) {
          setHasNewNotif(true);
          setTimeout(() => setHasNewNotif(false), 2000);
        }
        prevCountRef.current = newUnread;
        return data;
      });
    } catch (err) {
      // Silent fail — polling should not throw UI errors
    }
  }, [userEmail]);

  // Initial fetch + start polling when logged in
  useEffect(() => {
    if (status === 'loading') return;

    if (!userEmail) {
      setNotifications([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userEmail, status, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      });
    } catch (err) {
      console.error('[useNotifications] Mark read error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error('[useNotifications] Mark all read error:', err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    hasNewNotif,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
