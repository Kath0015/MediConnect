import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Compact notification item component
 * - Small size, minimal padding
 * - Red badge for unread notifications
 * - Positioned for left sidebar or compact list
 */
const NotificationItem = ({ notification, onMarkRead, onDismiss, icon: Icon, colorClass }) => {
  const { id, title, message, date, time, read } = notification;

  return (
    <div
      className={`relative bg-white rounded-lg border p-3 transition-all hover:shadow-md flex gap-3 text-xs ${
        !read ? 'border-red-200 bg-red-50/30' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Red badge for unread */}
      {!read && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}

      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h4 className={`font-semibold text-slate-900 truncate ${!read ? 'text-red-900' : ''}`}>
            {title}
          </h4>
        </div>
        <p className="text-slate-600 line-clamp-1 mb-1">{message}</p>
        <p className="text-slate-400 text-xs">
          {date} {time ? `• ${time}` : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 flex-shrink-0">
        {!read && (
          <button
            onClick={() => onMarkRead(id)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
            title="Mark as read"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onDismiss(id)}
          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-colors"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
