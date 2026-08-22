import React, { useState } from 'react';
import { ScrollText, Search, Filter, Calendar, Clock, User, Shield, Eye, ChevronDown, Download } from 'lucide-react';
import { toast } from 'sonner';

const mockLogs = [
  { id: 1, action: 'Appointment Booked', detail: 'Booked appointment #APT-2026-001 with Dr. Santos', date: '2026-08-15', time: '10:23 AM', ip: '192.168.1.10', status: 'success' },
  { id: 2, action: 'Profile Updated', detail: 'Updated personal information (phone number)', date: '2026-08-14', time: '02:45 PM', ip: '192.168.1.10', status: 'success' },
  { id: 3, action: 'Login', detail: 'Logged in from Chrome / Windows 11', date: '2026-08-14', time: '02:40 PM', ip: '192.168.1.10', status: 'success' },
  { id: 4, action: 'Document Uploaded', detail: 'Uploaded Lab Result – CBC August 2026', date: '2026-08-12', time: '09:11 AM', ip: '192.168.1.10', status: 'success' },
  { id: 5, action: 'Appointment Cancelled', detail: 'Cancelled appointment #APT-2026-099', date: '2026-08-10', time: '04:05 PM', ip: '192.168.1.10', status: 'warning' },
  { id: 6, action: 'Login Attempt Failed', detail: 'Invalid password entered', date: '2026-08-09', time: '08:02 AM', ip: '103.22.55.80', status: 'error' },
  { id: 7, action: 'Password Changed', detail: 'Password successfully updated', date: '2026-08-09', time: '08:10 AM', ip: '192.168.1.10', status: 'success' },
  { id: 8, action: 'Certificate Requested', detail: 'Requested Medical Certificate for employment', date: '2026-08-05', time: '11:30 AM', ip: '192.168.1.10', status: 'success' },
];

const statusConfig = {
  success: { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  warning: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  error: { dot: 'bg-rose-400', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
};

const AuditLogs = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockLogs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || l.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Action,Details,Date,Time,IP Address,Status\n';
    const rows = filtered
      .map((l) => `"${l.id}","${l.action}","${l.detail}","${l.date}","${l.time}","${l.ip}","${l.status}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuditLogs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log history exported to CSV');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#009DD1]" />
            Audit Logs
          </h1>
          <p className="text-slate-500 mt-1 text-sm">A complete record of all activity on your account.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-sm bg-white text-slate-700 border border-slate-200 hover:border-[#009DD1] hover:text-[#009DD1] rounded-xl px-4 py-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-[#009DD1]" />
            <span className="font-medium">Export CSV</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm bg-[#009DD1]/5 text-[#01377D] border border-[#009DD1]/20 rounded-xl px-4 py-2">
            <Shield className="w-4 h-4 text-[#009DD1]" />
            <span className="font-medium">Protected Activity Log</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'success', 'warning', 'error'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-[#01377D] text-white border-[#01377D] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#009DD1]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span className="col-span-1"></span>
          <span className="col-span-3">Action</span>
          <span className="col-span-5">Details</span>
          <span className="col-span-2">Date & Time</span>
          <span className="col-span-1">Status</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No logs found</p>
            </div>
          ) : (
            filtered.map((log) => {
              const sc = statusConfig[log.status];
              return (
                <div key={log.id} className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-4 gap-2 hover:bg-slate-50/50 transition-colors">
                  <div className="sm:col-span-1 flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                  </div>
                  <div className="sm:col-span-3 font-medium text-slate-800 text-sm">{log.action}</div>
                  <div className="sm:col-span-5 text-sm text-slate-500">{log.detail}</div>
                  <div className="sm:col-span-2 text-xs text-slate-400">
                    <div>{log.date}</div>
                    <div>{log.time}</div>
                  </div>
                  <div className="sm:col-span-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${sc.badge}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center">Showing {filtered.length} of {mockLogs.length} entries</p>
    </div>
  );
};

export default AuditLogs;

