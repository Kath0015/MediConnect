import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const PatientRoleBanner = ({
  title = 'Patient Portal',
  subtitle = 'Manage appointments, records, and laboratory history in one place.',
  primaryAction,
  secondaryAction,
  floatingAction,
}) => {
  const { isPatient } = useAuth();
  const FloatingIcon = floatingAction?.icon;

  // Safety guard: this banner is exclusive to patient sessions.
  if (!isPatient) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#97E7F5] bg-gradient-to-r from-[#0f3779] via-[#0d7bc0] to-[#11a07f] p-5 text-white shadow-[0_8px_26px_rgba(13,123,192,0.22)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-28 w-72 -rotate-6 rounded-full bg-white/10 blur-2xl" />
      {floatingAction?.to && FloatingIcon && (
        <Link
          to={floatingAction.to}
          aria-label={floatingAction.label}
          className="absolute right-4 top-4 z-20 flex flex-col items-center gap-1 text-white pointer-events-auto"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-white/20 shadow-sm transition-all duration-300 hover:bg-white/30 sm:h-14 sm:w-14">
            <FloatingIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="max-w-[92px] text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-[10px]">
            {floatingAction.label}
          </span>
        </Link>
      )}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 pr-20 sm:pr-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide">
            <Activity className="h-3.5 w-3.5" />
            Patient Access
          </div>
          <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
          <p className="max-w-2xl text-sm text-blue-100/95">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {secondaryAction?.to && (
            <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/15">
              <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
            </Button>
          )}
          {primaryAction?.to && (
            <Button asChild className="bg-[#0ea5e9] text-white shadow-[0_6px_18px_rgba(14,165,233,0.45)] hover:bg-[#0284c7] hover:text-white">
              <Link to={primaryAction.to} className="inline-flex items-center gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRoleBanner;
