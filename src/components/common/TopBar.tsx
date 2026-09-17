import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  UserCheck,
  Smartphone,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Globe,
  Monitor,
  CheckCircle2,
  ChevronDown,
  Layers,
  Info
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopBarProps {
  onOpenDemoGuide: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenDemoGuide }) => {
  const {
    activeRole,
    currentUser,
    currentOrg,
    switchRole,
    language,
    setLanguage,
    deviceView,
    setDeviceView,
    resetDemoData,
    approvalItems,
    completedRewards
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const pendingApprovalsCount = approvalItems.filter(a => a.status === 'pending').length;
  const availableRewardsCount = completedRewards.filter(r => r.status === 'available').length;

  const roles: {
    role: UserRole;
    userId: string;
    label: string;
    badge: string;
    sublabel: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'business_owner',
      userId: 'user-grace-owner',
      label: 'Grace N. (Owner)',
      badge: 'Business Owner',
      sublabel: 'Bella Salon • Full Controls & Commercials',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      role: 'business_manager',
      userId: 'user-patrick-manager',
      label: 'Patrick M. (Manager)',
      badge: 'Business Manager',
      sublabel: 'Daily Operations, Approvals & Team',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      role: 'frontline_staff',
      userId: 'user-diane-staff',
      label: 'Diane K. (Counter Staff)',
      badge: 'Frontline Staff',
      sublabel: 'Rapid Scan, Record Visits & Redeem',
      icon: Smartphone,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      role: 'participant',
      userId: 'user-amina-participant',
      label: 'Amina N. (Customer)',
      badge: 'Participant',
      sublabel: 'Customer Mobile • 8/10 at Bella Salon',
      icon: Smartphone,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      role: 'platform_operator',
      userId: 'user-marcus-operator',
      label: 'Marcus T. (Operator)',
      badge: '11thONUS Operator',
      sublabel: 'Platform Command, Health & Integrity',
      icon: ShieldCheck,
      color: 'bg-slate-900 text-white border-slate-700'
    }
  ];

  const currentRoleConfig = roles.find(r => r.role === activeRole) || roles[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Context */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-display font-extrabold flex items-center justify-center text-sm shadow-sm shadow-amber-600/30">
              11
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-slate-900 text-base tracking-tight leading-none">
                  11th<span className="text-amber-600">ONUS</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  Experience Ref
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Buy 10. The 11th is On Us.
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Quick Guided Demo Tour Trigger */}
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>Guided Tour (23 Steps)</span>
          </button>
        </div>

        {/* Center: Interactive Role Switcher */}
        <div className="relative w-full md:w-auto flex items-center justify-center">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 w-full md:w-auto justify-between md:justify-start overflow-x-auto">
            {roles.map(item => {
              const isActive = activeRole === item.role;
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role, item.userId)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                  title={item.sublabel}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{item.badge}</span>
                  <span className="sm:hidden">{item.badge.split(' ')[0]}</span>

                  {/* Badges for pending items */}
                  {item.role === 'business_manager' && pendingApprovalsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {item.role === 'participant' && availableRewardsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Environment utilities (Device frame, Language, Reset) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Mobile frame simulator toggle for mobile-first roles */}
          {(activeRole === 'participant' || activeRole === 'frontline_staff') && (
            <button
              onClick={() => setDeviceView(deviceView === 'desktop' ? 'mobile_frame' : 'desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition ${
                deviceView === 'mobile_frame'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle mobile device simulator"
            >
              {deviceView === 'mobile_frame' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Phone Frame</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline">Responsive Desktop</span>
                </>
              )}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="Switch Language: English / Français"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Reset to benchmark state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Role Context Notification Bar */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800">Operating as: {currentUser.name}</span>
          <span className="text-slate-400">•</span>
          <span className="truncate text-slate-600">{currentRoleConfig.sublabel}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <span>Active Country: Burundi & Rwanda</span>
          <span>•</span>
          <span>Shared Ecosystem State</span>
        </div>
      </div>
    </header>
  );
};
