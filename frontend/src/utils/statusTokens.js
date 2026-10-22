export const statusBadgeTokens = {
  pending: 'bg-amber-100 text-amber-800',
  waiting: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  complete: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-emerald-100 text-emerald-800',
  on_leave: 'bg-slate-100 text-slate-800',
  inactive: 'bg-slate-100 text-slate-800',
  cancelled: 'bg-rose-100 text-rose-800',
  rejected: 'bg-rose-100 text-rose-800',
  unpaid: 'bg-rose-100 text-rose-800',
};

export const getStatusBadgeTokens = (status) =>
  statusBadgeTokens[String(status || '').toLowerCase().replace(/\s+/g, '_')] ||
  'bg-slate-100 text-slate-800';
