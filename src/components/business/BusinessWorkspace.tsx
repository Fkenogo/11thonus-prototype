import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Award,
  CheckCircle2,
  Clock,
  UserPlus,
  BarChart3,
  CreditCard,
  Settings,
  AlertTriangle,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  Sparkles,
  DollarSign,
  Gift,
  Building2,
  Info,
  Calendar
} from 'lucide-react';
import { LoyaltyCircle } from '../common/LoyaltyCircle';
import { UserRole, ProgrammeStatus } from '../../types';

export const BusinessWorkspace: React.FC = () => {
  const {
    activeRole,
    currentUser,
    currentOrg,
    organisations,
    programmes,
    users,
    relationships,
    transactions,
    completedRewards,
    approvalItems,
    commercialRecords,
    auditLogs,
    createProgramme,
    updateProgrammeStatus,
    approvePendingItem,
    rejectPendingItem,
    reverseTransaction,
    inviteStaffMember,
    toggleStaffStatus,
    topUpCommercialBalance,
    createOrganisation,
    switchOrganisation
  } = useApp();

  const isOwner = activeRole === 'business_owner';
  const isManager = activeRole === 'business_manager';

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'customers'
    | 'programmes'
    | 'approvals'
    | 'team'
    | 'reports'
    | 'commercial'
    | 'settings'
    | 'new_programme_wizard'
    | 'onboarding_wizard'
  >('dashboard');

  // Modal / drawer states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApprovalForReject, setSelectedApprovalForReject] = useState<string | null>(null);

  // Invite Form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('frontline_staff');
  const [inviteTitle, setInviteTitle] = useState('Frontline Specialist');

  // New Programme Wizard State (Section 11)
  const [wizardStep, setWizardStep] = useState(1);
  const [newProgName, setNewProgName] = useState('');
  const [newProgCategory, setNewProgCategory] = useState('Salon Care');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgItemName, setNewProgItemName] = useState('');
  const [newProgPrice, setNewProgPrice] = useState(25000);
  const [newProgAllowMulti, setNewProgAllowMulti] = useState(true);
  const [newProgMaxUnits, setNewProgMaxUnits] = useState(3);
  const [newProgApprovalAbove, setNewProgApprovalAbove] = useState(2);
  const [newProgStatus, setNewProgStatus] = useState<ProgrammeStatus>('active');

  // Filtered data for this organisation
  const orgProgrammes = programmes.filter(p => p.orgId === currentOrg.id);
  const orgTransactions = transactions.filter(t => t.orgId === currentOrg.id);
  const orgStaff = users.filter(u => u.orgId === currentOrg.id);
  const orgApprovals = approvalItems.filter(a => a.orgId === currentOrg.id);
  const pendingApprovals = orgApprovals.filter(a => a.status === 'pending');
  const orgCommercialRecords = commercialRecords.filter(c => c.orgId === currentOrg.id);
  
  // Customers participating at this business
  const orgRelationships = relationships.filter(r => r.orgId === currentOrg.id);
  const customersCloseToReward = orgRelationships.filter(r => r.approvedSteps >= 8 && !r.rewardAvailable);
  const rewardsAvailableAtOrg = orgRelationships.filter(r => r.rewardAvailable);
  const todayTransactions = orgTransactions.filter(t => {
    const todayStr = new Date().toISOString().split('T')[0];
    return t.createdAt.startsWith(todayStr);
  });

  const handleCreateProgrammeSubmit = () => {
    createProgramme({
      name: newProgName || 'Signature Service',
      category: newProgCategory,
      description: newProgDesc || 'Buy 10, 11th On Us',
      qualifyingItemName: newProgItemName || 'Service',
      sellingPrice: Number(newProgPrice) || 10000,
      currency: currentOrg.currency,
      status: newProgStatus,
      rules: {
        allowMultipleUnits: newProgAllowMulti,
        maxUnitsPerTx: newProgMaxUnits,
        requireApprovalAbove: newProgApprovalAbove,
        customerConfirmation: false,
        allowBackdated: false
      },
      requiredSteps: 10,
      rewardDescription: `11th ${newProgItemName || 'Service'} is on ${currentOrg.name}`
    });
    setActiveTab('programmes');
    setWizardStep(1);
    setNewProgName('');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    inviteStaffMember({
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone || '+257 79 00 00 00',
      role: inviteRole,
      title: inviteTitle
    });
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
  };

  return (
    <div className="space-y-6">
      {/* Business Sub-Header Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white font-display font-black text-base flex items-center justify-center shadow-xs">
            {currentOrg.logoText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold text-slate-900 leading-tight">
                {currentOrg.name}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Business
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentOrg.city}, {currentOrg.country} • Currency: <span className="font-semibold text-slate-700">{currentOrg.currency}</span> • Role: <span className="font-semibold text-slate-800">{isOwner ? 'Owner (Grace)' : 'Manager (Patrick)'}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'dashboard', label: 'Command Centre', icon: LayoutDashboard },
            { id: 'customers', label: 'Customers', icon: Users, badge: orgRelationships.length },
            { id: 'programmes', label: 'Programmes', icon: Award, badge: orgProgrammes.length },
            { id: 'approvals', label: 'Approvals', icon: Clock, alertBadge: pendingApprovals.length },
            { id: 'team', label: 'Team', icon: UserPlus },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            ...(isOwner ? [{ id: 'commercial', label: 'Commercial & Usage', icon: CreditCard }] : []),
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.alertBadge !== undefined && tab.alertBadge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-amber-600' : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {tab.alertBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: COMMAND CENTRE ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Today's Activity</span>
              <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                {todayTransactions.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Qualifying customer visits today
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Approaching Reward (8-9/10)</span>
              <div className="text-2xl font-display font-extrabold text-amber-700 mt-1">
                {customersCloseToReward.length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                1 or 2 visits until 11th On Us
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Rewards Ready to Redeem</span>
              <div className="text-2xl font-display font-extrabold text-emerald-700 mt-1">
                {rewardsAvailableAtOrg.length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Completed circles awaiting visit
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Items Requiring Approval</span>
              <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                {pendingApprovals.length}
              </div>
              <span className={`text-[11px] font-medium ${pendingApprovals.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {pendingApprovals.length > 0 ? 'Action required in queue' : 'All clear'}
              </span>
            </div>
          </div>

          {/* Core Command Centre Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Outstanding Decisions & Live Customer Attention */}
            <div className="lg:col-span-7 space-y-6">
              {/* Approvals Alert Card if any */}
              {pendingApprovals.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                        Pending Operations Attention ({pendingApprovals.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="text-xs font-semibold text-amber-900 hover:underline"
                    >
                      Open Approval Centre →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pendingApprovals.map(appr => (
                      <div
                        key={appr.id}
                        className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {appr.customerName} • {appr.programmeName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {appr.reason} (Recorded by {appr.staffName})
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => approvePendingItem(appr.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApprovalForReject(appr.id);
                              setRejectionReason('Multi-unit entry exceeds authorized session policy');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Approaching Reward or with Reward Available */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Customers Approaching Recognition
                    </h2>
                    <p className="text-xs text-slate-500">
                      Recognize loyalty when they arrive at the counter
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    View all customers →
                  </button>
                </div>

                <div className="space-y-3">
                  {orgRelationships.slice(0, 4).map(rel => {
                    const customer = users.find(u => u.id === rel.customerId);
                    const prog = programmes.find(p => p.id === rel.programmeId);
                    if (!customer || !prog) return null;

                    return (
                      <div
                        key={rel.id}
                        className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {customer.initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {customer.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {prog.name} • Cycle #{rel.currentCycle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {rel.rewardAvailable ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Gift className="w-3 h-3 text-amber-700" />
                              <span>11th On Us Ready</span>
                            </span>
                          ) : (
                            <div className="text-right">
                              <span className="text-xs font-extrabold text-slate-900">
                                {rel.approvedSteps}/10
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {10 - rel.approvedSteps} to reward
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Activity Timeline
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Traceable Audit</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {orgTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          tx.type === 'reward_redemption'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.type === 'reversal'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.type === 'reward_redemption' ? '🎁' : tx.type === 'reversal' ? '↩' : '✓'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">{tx.customerName}</span>
                          <span className="text-slate-400"> • </span>
                          <span className="text-slate-600">
                            {tx.type === 'reward_redemption'
                              ? 'Redeemed 11th Reward'
                              : tx.type === 'reversal'
                              ? `Reversed (${tx.quantity} units)`
                              : `Recorded ${tx.quantity} visit`}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            Staff: {tx.staffName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        {/* Transaction reversal trigger for owner/manager */}
                        {tx.type === 'qualifying_purchase' && tx.status === 'approved' && (
                          <button
                            onClick={() => setShowReversalModal(tx.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="Correct or reverse mistake"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Centre & Commercial Position */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Frontline & Operations
                  </span>
                  <h3 className="text-base font-bold font-display mt-0.5">
                    Quick Operational Actions
                  </h3>
                  <p className="text-xs text-slate-300">
                    Switch to Staff view or launch new programmes instantly.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Trigger new programme wizard
                      setActiveTab('new_programme_wizard');
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Create New Loyalty Programme</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-200" />
                  </button>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center justify-between border border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-slate-300" />
                      <span>Invite Staff Member</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Active Programmes Snapshot */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Loyalty Offerings ({orgProgrammes.length})
                  </h2>
                  <button
                    onClick={() => setActiveTab('programmes')}
                    className="text-xs text-amber-700 font-semibold hover:underline"
                  >
                    Manage →
                  </button>
                </div>

                <div className="space-y-2">
                  {orgProgrammes.map(p => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.sellingPrice.toLocaleString()} {p.currency} • {p.completedRewardsCount} rewards issued
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Account Position (Section 26) */}
              {isOwner && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Commercial Model: 10+1 Circle Units
                      </span>
                      <h2 className="text-sm font-bold text-slate-900">
                        11thONUS Usage Position
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ~$1 / circle unit
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    11thONUS charges approximately <strong>USD 1 per completed 10+1 loyalty circle</strong>. Recognition is paid when customer loyalty is proven.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Trial Units Remaining</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {currentOrg.trialCirclesRemaining}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Credit Balance</span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        ${currentOrg.creditBalanceUSD.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('commercial')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                  >
                    View Commercial Details & Statements →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CUSTOMERS ================= */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Relationships ({orgRelationships.length})
              </h2>
              <p className="text-xs text-slate-500">
                Customers participating in {currentOrg.name} loyalty programmes. Activity at other businesses is isolated.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {orgRelationships.map(rel => {
              const customer = users.find(u => u.id === rel.customerId);
              const prog = programmes.find(p => p.id === rel.programmeId);
              if (!customer || !prog) return null;

              return (
                <div key={rel.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                      {customer.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{customer.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{customer.onusId}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Programme: <strong className="text-slate-700">{prog.name}</strong> • Phone: {customer.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Cycle #{rel.currentCycle} • Joined: {new Date(rel.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Visual miniature circle */}
                    <div className="scale-75 origin-right">
                      <LoyaltyCircle
                        approvedSteps={rel.approvedSteps}
                        pendingSteps={rel.pendingSteps}
                        rewardAvailable={rel.rewardAvailable}
                        size="sm"
                        showLabels={false}
                        cycleNumber={rel.currentCycle}
                      />
                    </div>

                    <div className="text-right min-w-[120px]">
                      {rel.rewardAvailable ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          11th On Us Ready
                        </span>
                      ) : (
                        <div>
                          <span className="text-sm font-extrabold text-slate-900">
                            {rel.approvedSteps} of 10
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {10 - rel.approvedSteps} steps to go
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PROGRAMMES ================= */}
      {activeTab === 'programmes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Loyalty Programmes at {currentOrg.name}
              </h2>
              <p className="text-xs text-slate-500">
                Every programme operates on: "Buy 10. The 11th is On Us."
              </p>
            </div>

            <button
              onClick={() => setActiveTab('new_programme_wizard')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Programme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgProgrammes.map(prog => (
              <div key={prog.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {prog.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{prog.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{prog.description}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    prog.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : prog.status === 'draft'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {prog.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-950">
                  <strong>Proposition: </strong> Buy 10 {prog.qualifyingItemName}s → 11th {prog.qualifyingItemName} is on {currentOrg.name}.
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Normal Price</span>
                    <span className="font-bold text-slate-900">
                      {prog.sellingPrice.toLocaleString()} {prog.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Participants</span>
                    <span className="font-bold text-slate-900">{prog.totalParticipants}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rewards Issued</span>
                    <span className="font-bold text-emerald-700">{prog.completedRewardsCount}</span>
                  </div>
                </div>

                {/* Status controls */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Max units: {prog.rules.maxUnitsPerTx} • Approval threshold: {prog.rules.requireApprovalAbove}+
                  </span>

                  <div className="flex items-center gap-2">
                    {prog.status === 'active' ? (
                      <button
                        onClick={() => updateProgrammeStatus(prog.id, 'paused')}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Pause
                      </button>
                    ) : prog.status === 'paused' || prog.status === 'draft' ? (
                      <button
                        onClick={() => updateProgrammeStatus(prog.id, 'active')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        Activate
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: APPROVAL CENTRE (Section 18, 19) ================= */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operations Approval Centre
              </h2>
              <p className="text-xs text-slate-500">
                Manage transaction exceptions, multi-unit visits, and audit records.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {pendingApprovals.length} pending
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">You're all caught up!</div>
              <p className="text-xs">No transactions currently waiting for manager or owner approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                          Requires Approval
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(item.requestedAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {item.customerName} • {item.programmeName}
                      </h3>
                      <p className="text-xs text-amber-900 mt-0.5 font-medium">
                        {item.reason}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Recorded by staff: <strong>{item.staffName}</strong> • Requested units: <strong>{item.quantity}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approvePendingItem(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Approve & Apply
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApprovalForReject(item.id);
                          setRejectionReason('Declined multi-unit request');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                      >
                        Reject with Reason
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: TEAM & STAFF (Section 13) ================= */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Staff & Access Management
              </h2>
              <p className="text-xs text-slate-500">
                Individual accounts with plain-language business permissions. No shared logins.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Staff</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {orgStaff.map(member => (
              <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {member.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        member.role === 'business_owner'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : member.role === 'business_manager'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {member.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {member.title || 'Staff'} • {member.email} • {member.phone}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {member.role === 'business_owner'
                        ? 'Permissions: Full administrative & commercial control'
                        : member.role === 'business_manager'
                        ? 'Permissions: Operational management, approve exceptions, view reports'
                        : 'Permissions: Scan customers, record purchases, redeem rewards'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    member.active ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                  }`}>
                    {member.active ? 'Active' : 'Suspended'}
                  </span>
                  {isOwner && member.role !== 'business_owner' && (
                    <button
                      onClick={() => toggleStaffStatus(member.id)}
                      className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px]"
                    >
                      {member.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: REPORTS (Section 25) ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Loyalty Performance & Repeat Visits
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Answers clear business questions rather than presenting clutter.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Repeat Retention Ratio</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">78.4%</div>
                <p className="text-[11px] text-emerald-600 mt-0.5">Customers with 3+ visits</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Total Circles Completed</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">
                  {currentOrg.completedBillableCircles}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Lifetime recognized 10-packs</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Rewards Redeemed</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {completedRewards.filter(r => r.orgId === currentOrg.id && r.status === 'redeemed').length}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">11th rewards given to customers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: COMMERCIAL & USAGE (Section 26 - Owner Only) ================= */}
      {activeTab === 'commercial' && isOwner && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Consumption Model
                  </span>
                  <span className="text-xs text-slate-500">No monthly subscription tiers</span>
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900 mt-1">
                  Commercial Account Position
                </h2>
                <p className="text-xs text-slate-600">
                  The base model is: 10 qualifying transactions complete a billable 10+1 loyalty unit / circle (~USD 1 per completed circle).
                </p>
              </div>

              <button
                onClick={() => topUpCommercialBalance(currentOrg.id, 25.0)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add $25 Commercial Balance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Trial Units Remaining</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {currentOrg.trialCirclesRemaining}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Free introductory circles</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Credit Balance (USD)</span>
                <span className="text-2xl font-extrabold text-emerald-700">
                  ${currentOrg.creditBalanceUSD.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Ready for next circles</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Completed Billable Circles</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {currentOrg.completedBillableCircles}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Total units processed</span>
              </div>
            </div>

            {/* Grace policy explanation */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <strong>Customer Grace Behaviour Guarantee: </strong>
                If a customer is already inside an active circle (e.g. 8/10), their progression and reward will never be blocked or degraded even if the business balance reaches low threshold.
              </div>
            </div>

            {/* Commercial billing events ledger */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Recent Completed Circle Settlements
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                {orgCommercialRecords.map(rec => (
                  <div key={rec.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Completed Circle #{rec.completedCircleId}</span>
                      <span className="text-slate-400"> • </span>
                      <span className="text-slate-500">{new Date(rec.recordedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {rec.coverageType === 'trial' ? 'Covered by Trial' : '$1.00 USD Deducted'}
                      </span>
                      <span className="text-emerald-700 font-bold">Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 8: SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Business Configuration & Policies
            </h2>
            <p className="text-xs text-slate-500">
              Control your business identity, default currency, and operational rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Business Name</label>
              <input
                type="text"
                disabled
                value={currentOrg.name}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary Contact</label>
              <input
                type="text"
                disabled
                value={currentOrg.primaryContact}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Country & City</label>
              <input
                type="text"
                disabled
                value={`${currentOrg.city}, ${currentOrg.country}`}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Default Currency</label>
              <input
                type="text"
                disabled
                value={currentOrg.currency}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <strong className="text-slate-900 block">Default Participation Guardrails:</strong>
            <p>• Multi-unit transactions exceeding 2 units automatically require manager approval.</p>
            <p>• Full audit traceability preserved on every transaction reversal.</p>
          </div>
        </div>
      )}

      {/* ================= NEW PROGRAMME GUIDED WIZARD (Section 11) ================= */}
      {activeTab === 'new_programme_wizard' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Step {wizardStep} of 4 • Guided Creator
              </span>
              <button
                onClick={() => setActiveTab('programmes')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
              {wizardStep === 1 && 'What are you rewarding?'}
              {wizardStep === 2 && 'Confirm Reward Proposition'}
              {wizardStep === 3 && 'Participation Guardrails'}
              {wizardStep === 4 && 'Human-Readable Review & Activation'}
            </h2>
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Programme / Offering Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Manicure, Signature Coffee, Oil Change"
                  value={newProgName}
                  onChange={e => setNewProgName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={newProgCategory}
                  onChange={e => setNewProgCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option>Salon & Spa Care</option>
                  <option>Hair Styling</option>
                  <option>Food & Specialty Beverage</option>
                  <option>Auto Detailing</option>
                  <option>Laundry & Dry Cleaning</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Qualifying Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manicure, Cappuccino, Car Wash"
                  value={newProgItemName}
                  onChange={e => setNewProgItemName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Normal Selling Price ({currentOrg.currency})</label>
                <input
                  type="number"
                  value={newProgPrice}
                  onChange={e => setNewProgPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <button
                onClick={() => setWizardStep(2)}
                disabled={!newProgName}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition mt-2"
              >
                Next: Configure Reward →
              </button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  The Core 11thONUS Proposition
                </span>
                <div className="text-lg font-bold text-amber-950 font-display">
                  Buy 10. The 11th is On Us.
                </div>
                <p className="text-amber-800 text-xs max-w-md mx-auto">
                  When a customer purchases 10 approved {newProgItemName || 'items'}, their next {newProgItemName || 'item'} is 100% on {currentOrg.name}.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                >
                  Next: Participation Rules →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">Allow Multiple Units</span>
                    <span className="text-slate-500 text-[11px]">Can a customer pay for a friend in the same visit?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newProgAllowMulti}
                    onChange={e => setNewProgAllowMulti(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Require Manager Approval Above (Units)</label>
                  <select
                    value={newProgApprovalAbove}
                    onChange={e => setNewProgApprovalAbove(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value={1}>Above 1 unit</option>
                    <option value={2}>Above 2 units (Recommended)</option>
                    <option value={3}>Above 3 units</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                >
                  Next: Review & Launch →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Plain Business Summary</span>
                <p className="text-slate-800 text-sm font-medium leading-relaxed">
                  "Customers earn one step every time they purchase a <strong>{newProgItemName || 'Service'}</strong> at {currentOrg.name}.
                  After 10 approved purchases, their next <strong>{newProgItemName || 'Service'}</strong> is on us."
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Initial State</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newProgStatus === 'active'}
                      onChange={() => setNewProgStatus('active')}
                    />
                    <span className="font-semibold text-emerald-700">Activate Immediately</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newProgStatus === 'draft'}
                      onChange={() => setNewProgStatus('draft')}
                    />
                    <span className="font-semibold text-slate-600">Save as Draft</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateProgrammeSubmit}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Launch Programme
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: INVITE STAFF ================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandrine Mukamana"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sandrine@bellasalon.bi"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+257 79 12 34 56"
                  value={invitePhone}
                  onChange={e => setInvitePhone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Role & Authority</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="frontline_staff">Frontline Staff (Can record purchases & redeem)</option>
                  <option value="business_manager">Business Manager (Operations, exceptions & reports)</option>
                  {isOwner && <option value="business_owner">Co-Owner (Full commercial & account powers)</option>}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSACTION REVERSAL / CORRECTION (Section 23) ================= */}
      {showReversalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Correct or Reverse Purchase</h3>
              <button
                onClick={() => setShowReversalModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transactions are never erased silently. A reversal transaction will be recorded in the audit history with your stated business reason.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Reason for Correction *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Frontline staff accidentally entered 2 units instead of 1."
                value={reversalReason}
                onChange={e => setReversalReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReversalModal(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  reverseTransaction(showReversalModal, reversalReason || 'Staff cashier typo correction');
                  setShowReversalModal(null);
                  setReversalReason('');
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT APPROVAL WITH REASON ================= */}
      {selectedApprovalForReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Decline Pending Entry</h3>
              <button
                onClick={() => setSelectedApprovalForReject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Reason for Rejection *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedApprovalForReject(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectPendingItem(selectedApprovalForReject, rejectionReason);
                  setSelectedApprovalForReject(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Reject Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
