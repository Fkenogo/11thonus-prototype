import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  MoreHorizontal,
  Clock,
  UserPlus,
  BarChart3,
  CreditCard,
  Settings,
  Building2,
  X,
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  badges?: {
    customers?: number;
    programmes?: number;
    approvals?: number;
  };
  isOwner?: boolean;
  onQuickCounter?: () => void;
  onOpenSetup?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  badges = {},
  isOwner = true,
  onQuickCounter,
  onOpenSetup
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const pendingApprovalsCount = badges.approvals || 0;

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMoreOpen(false);
  };

  const primaryTabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: badges.customers
    },
    {
      id: 'programmes',
      label: 'Programmes',
      icon: Award,
      badge: badges.programmes
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      alertBadge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    }
  ];

  const secondaryTabs = [
    {
      id: 'approvals',
      label: 'Approvals & Decisions',
      description: 'Review multi-unit transactions and exceptions',
      icon: Clock,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined,
      isAlert: pendingApprovalsCount > 0
    },
    {
      id: 'team',
      label: 'Team & Frontline Staff',
      description: 'Manage staff accounts and counter permissions',
      icon: UserPlus
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      description: 'Velocity, redemption rates, and customer growth',
      icon: BarChart3
    },
    ...(isOwner
      ? [
          {
            id: 'commercial',
            label: 'Billing & Commercial Units',
            description: '10+1 circle usage and account balance',
            icon: CreditCard
          }
        ]
      : []),
    {
      id: 'settings',
      label: 'Business Settings',
      description: 'Store contact details, currency, and notifications',
      icon: Settings
    }
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-pb"
      >
        <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            const isMoreTab = tab.id === 'more';
            const isActive = isMoreTab ? isSecondaryActive : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => {
                  if (isMoreTab) {
                    setIsMoreOpen(true);
                  } else {
                    handleTabClick(tab.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-amber-700 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
                aria-label={tab.label}
              >
                {/* Active Pill Indicator */}
                {isActive && (
                  <span className="absolute top-1 w-6 h-0.5 rounded-full bg-amber-600" />
                )}

                <div className="relative mt-1">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.25] scale-105' : 'stroke-[1.75]'}`} />
                  
                  {/* Alert / Count Badge */}
                  {tab.alertBadge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                      {tab.alertBadge}
                    </span>
                  )}
                  {tab.badge !== undefined && !tab.alertBadge && (
                    <span className="absolute -top-1 -right-2 px-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] tracking-tight mt-1 leading-none truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 'More' Secondary Drawer / Sheet */}
      {isMoreOpen && (
        <div
          id="mobile-more-sheet"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border-t border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Drag Handle & Header */}
            <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Business Menu & Controls
                </h3>
                <p className="text-[11px] text-slate-500">
                  Operations, team access, and business configuration
                </p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Action Items */}
            <div className="p-4 overflow-y-auto space-y-2 divide-y divide-slate-100 text-xs">
              {/* Urgent Action Callout if Pending Approvals */}
              {pendingApprovalsCount > 0 && (
                <button
                  onClick={() => handleTabClick('approvals')}
                  className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left flex items-center justify-between text-amber-950 hover:bg-amber-500/20 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <span>Approvals Waiting</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                          {pendingApprovalsCount}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Tap to review and approve transactions
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </button>
              )}

              {/* Secondary Navigation Links */}
              <div className="pt-2 space-y-1">
                {secondaryTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition ${
                        isActive
                          ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                            <span>{tab.label}</span>
                            {tab.badge && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {tab.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  );
                })}
              </div>

              {/* Fast Operational Switches */}
              <div className="pt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                  Quick Actions
                </span>

                {onQuickCounter && (
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      onQuickCounter();
                    }}
                    className="w-full py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Switch to Frontline Counter View</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Tap to open</span>
                  </button>
                )}

                {isOwner && onOpenSetup && (
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenSetup();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Open Business Setup Guide</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Safe Dismiss Area */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
