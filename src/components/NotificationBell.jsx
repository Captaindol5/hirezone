import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications, markNotificationRead } from '../services/hirezoneData';

const typeColors = {
  stage_advanced: 'bg-indigo-500',
  feedback_ready: 'bg-amber-500',
  hired: 'bg-emerald-500',
  application_update: 'bg-rose-500',
  ai_report_ready: 'bg-purple-500',
  general: 'bg-slate-400',
};

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToNotifications(currentUser.uid, setNotifications);
    return () => unsub();
  }, [currentUser?.uid]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read);

  const handleMarkRead = async (e, notifId) => {
    e.stopPropagation();
    await markNotificationRead(notifId);
  };

  const handleMarkAllRead = async () => {
    await Promise.all(unread.map(n => markNotificationRead(n.id)));
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-body)] transition hover:bg-[var(--border-color)]"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        {unread.length > 0 ? <BellRing size={18} className="text-amber-500 animate-[wiggle_1s_ease-in-out]" /> : <Bell size={18} />}
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-[var(--border-color)] bg-white shadow-2xl dark:bg-slate-900 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--text-headers)]">Notifications</p>
              <p className="text-xs text-[var(--text-muted)]">{unread.length} unread</p>
            </div>
            <div className="flex items-center gap-2">
              {unread.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-[var(--text-muted)]">
                <Bell size={28} className="opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 border-b border-[var(--border-color)] px-4 py-3 transition ${notif.read ? 'opacity-60' : 'bg-indigo-50/40 dark:bg-indigo-900/10'}`}
                >
                  <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${typeColors[notif.type] || typeColors.general}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-headers)] leading-snug">{notif.message}</p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatTime(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={(e) => handleMarkRead(e, notif.id)}
                      className="mt-1 flex-shrink-0 rounded-lg p-1 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
