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
import { UserRole, ProgrammeStatus, ParticipantRelationship } from '../../types';
import { MobileNavigation } from './MobileNavigation';

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
    recordQualifyingPurchase,
    redeemReward,
    inviteStaffMember,
    toggleStaffStatus,
    topUpCommercialBalance,
    createOrganisation,
    switchOrganisation,
    switchRole
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

  // New Programme Wizard State (Section 5 & 11)
  const [wizardStep, setWizardStep] = useState(1);
  const [newProgName, setNewProgName] = useState('');
  const [newProgCategory, setNewProgCategory] = useState('Salon Care');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgItemName, setNewProgItemName] = useState('');
  const [newProgPrice, setNewProgPrice] = useState(25000);
  const [newProgAllowMulti, setNewProgAllowMulti] = useState(false);
  const [newProgMaxUnits, setNewProgMaxUnits] = useState(3);
  const [newProgApprovalAbove, setNewProgApprovalAbove] = useState(2);
  const [newProgStatus, setNewProgStatus] = useState<ProgrammeStatus>('active');
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);

  // Onboarding Wizard State (Section 4: Business -> First Programme -> Team -> Ready)
  const [onboardStep, setOnboardStep] = useState<number>(1);
  const [onboardOrgName, setOnboardOrgName] = useState('Bella Salon');
  const [onboardCategory, setOnboardCategory] = useState('Salon & Personal Care');
  const [onboardCity, setOnboardCity] = useState('Bujumbura');
  const [onboardCountry, setOnboardCountry] = useState('Burundi');
  const [onboardCurrency, setOnboardCurrency] = useState('BIF');
  const [onboardProgName, setOnboardProgName] = useState('Deluxe Haircut');
  const [onboardProgItem, setOnboardProgItem] = useState('Haircut');
  const [onboardProgPrice, setOnboardProgPrice] = useState(25000);
  const [onboardStaffName, setOnboardStaffName] = useState('Diane K.');
  const [onboardStaffEmail, setOnboardStaffEmail] = useState('diane@bellasalon.bi');
  const [onboardStaffPhone, setOnboardStaffPhone] = useState('+257 79 12 34 56');
  const [onboardCreatedOrgName, setOnboardCreatedOrgName] = useState('');

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

  // Customer search and filtering
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerFilterTab, setCustomerFilterTab] = useState<'all' | 'ready' | 'approaching'>('all');
  const [approvalFilterTab, setApprovalFilterTab] = useState<'pending' | 'resolved'>('pending');

  // Customer quick action modal state
  const [actionCustomerRel, setActionCustomerRel] = useState<ParticipantRelationship | null>(null);
  const [actionUnits, setActionUnits] = useState(1);
  const [actionNotes, setActionNotes] = useState('');

  const handleRecordActionSubmit = () => {
    if (!actionCustomerRel) return;
    if (actionCustomerRel.rewardAvailable) {
      redeemReward({
        programmeId: actionCustomerRel.programmeId,
        customerId: actionCustomerRel.customerId
      });
      setActionCustomerRel(null);
      return;
    }

    recordQualifyingPurchase({
      programmeId: actionCustomerRel.programmeId,
      customerId: actionCustomerRel.customerId,
      quantity: actionUnits,
      notes: actionNotes || 'Recorded via mobile management card'
    });
    setActionCustomerRel(null);
    setActionUnits(1);
    setActionNotes('');
  };

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

  const handleCompleteOnboarding = () => {
    createOrganisation({
      name: onboardOrgName || 'Bella Salon',
      category: onboardCategory,
      primaryContact: currentUser.name || 'Business Owner',
      email: currentUser.email || 'owner@bellasalon.bi',
      phone: '+257 79 00 00 00',
      address: 'Central Boulevard',
      city: onboardCity,
      country: onboardCountry,
      currency: onboardCurrency,
      logoText: (onboardOrgName || 'BS').substring(0, 2).toUpperCase()
    });

    createProgramme({
      name: onboardProgName || 'Deluxe Haircut',
      category: onboardCategory,
      description: `Buy 10 ${onboardProgItem || 'Haircut'}, get the 11th on us`,
      qualifyingItemName: onboardProgItem || 'Haircut',
      sellingPrice: Number(onboardProgPrice) || 25000,
      currency: onboardCurrency,
      status: 'active',
      rules: {
        allowMultipleUnits: false,
        maxUnitsPerTx: 1,
        requireApprovalAbove: 2,
        customerConfirmation: false,
        allowBackdated: false
      },
      requiredSteps: 10,
      rewardDescription: `11th ${onboardProgItem || 'Haircut'} is on ${onboardOrgName || 'Bella Salon'}`
    });

    if (onboardStaffName && onboardStaffEmail) {
      inviteStaffMember({
        name: onboardStaffName,
        email: onboardStaffEmail,
        phone: onboardStaffPhone || '+257 79 12 34 56',
        role: 'frontline_staff',
        title: 'Counter Specialist'
      });
    }

    setOnboardCreatedOrgName(onboardOrgName);
    setOnboardStep(4);
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
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Business Sub-Header Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white font-display font-black text-base flex items-center justify-center shadow-xs shrink-0">
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

        {/* Desktop Tab Navigation Pill Strip (Replaced by MobileNavigation on small devices) */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
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
          {/* ================= MOBILE-FIRST DASHBOARD STACK (md:hidden) ================= */}
          <div className="md:hidden space-y-5">
            {/* 1. HIGH-PRIORITY 'ATTENTION NEEDED' QUEUE */}
            <section id="mobile-attention-queue" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">Attention Needed</h2>
                    <p className="text-[11px] text-slate-500">Urgent approvals & reward-ready tasks</p>
                  </div>
                </div>
                {(pendingApprovals.length > 0 || rewardsAvailableAtOrg.length > 0) && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {pendingApprovals.length + rewardsAvailableAtOrg.length} urgent
                  </span>
                )}
              </div>

              {/* Pending Approvals Stack */}
              {pendingApprovals.length > 0 && (
                <div className="space-y-3">
                  {pendingApprovals.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/60 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center">
                            {item.customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">
                              {item.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.programmeName}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 uppercase tracking-tight">
                          Decision
                        </span>
                      </div>

                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Requested: {item.quantity} Units</span>
                          <span className="text-slate-500 text-[11px]">By {item.staffName}</span>
                        </div>
                        <p className="text-[11px] text-amber-900 font-medium">
                          {item.reason}
                        </p>
                      </div>

                      {/* Primary Thumb Targets */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={() => approvePendingItem(item.id)}
                          className="h-12 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-[0.98]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApprovalForReject(item.id);
                            setRejectionReason('Exceeds single session limit');
                          }}
                          className="h-12 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rewards Ready to Redeem */}
              {rewardsAvailableAtOrg.length > 0 && (
                <div className="space-y-2.5">
                  {rewardsAvailableAtOrg.map(rel => {
                    const customer = users.find(u => u.id === rel.customerId);
                    const prog = programmes.find(p => p.id === rel.programmeId);
                    if (!customer || !prog) return null;

                    return (
                      <div
                        key={rel.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-300/80 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <Gift className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{customer.name}</span>
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                11th Ready
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {prog.name} • 10 visits completed!
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActionCustomerRel(rel)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs active:scale-[0.98] transition"
                        >
                          Redeem
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Customers Near 11th On Us (8 or 9 steps) */}
              {customersCloseToReward.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Approaching Reward ({customersCloseToReward.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">8–9 of 10</span>
                  </div>
                  <div className="space-y-1.5">
                    {customersCloseToReward.slice(0, 3).map(rel => {
                      const customer = users.find(u => u.id === rel.customerId);
                      if (!customer) return null;
                      return (
                        <div
                          key={rel.id}
                          className="flex items-center justify-between text-xs py-1 border-t border-slate-100 first:border-0"
                        >
                          <span className="font-medium text-slate-800">{customer.name}</span>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {rel.approvedSteps}/10 visits
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Clear State */}
              {pendingApprovals.length === 0 && rewardsAvailableAtOrg.length === 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">All Clear in Queue</div>
                  <p className="text-[11px] text-slate-500">
                    No pending multi-unit approvals or unresolved customer exceptions.
                  </p>
                </div>
              )}
            </section>

            {/* 2. 'TODAY'S ACTIVITY' SNIPPETS */}
            <section id="mobile-today-activity" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Today's Activity</h2>
                  <p className="text-[11px] text-slate-500">
                    {todayTransactions.length > 0
                      ? `${todayTransactions.length} customer visits recorded today`
                      : 'Live transaction feed and counter velocity'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                >
                  <span>Reports</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {(todayTransactions.length > 0 ? todayTransactions : orgTransactions).slice(0, 5).map(tx => {
                  const customer = users.find(u => u.id === tx.customerId);
                  const prog = programmes.find(p => p.id === tx.programmeId);
                  const isRedemption = tx.type === 'reward_redemption';

                  return (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between gap-3 text-xs ${
                        isRedemption
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRedemption
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isRedemption ? <Gift className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{customer?.name || 'Customer'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {prog?.name || 'Service'} • {isRedemption ? '11th ONUS Reward' : `${tx.quantity} visit`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {tx.staffName.split(' ')[0]}
                        </span>
                        <button
                          onClick={() => reverseTransaction(tx.id, 'Cashier correction on mobile')}
                          title="Reverse entry if error"
                          className="p-1 rounded-lg text-slate-300 hover:text-slate-600 active:text-red-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. 'QUICK ACTIONS' AS LARGE-TOUCH BUTTONS */}
            <section id="mobile-quick-actions" className="space-y-3 pt-1">
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">Quick Actions</h2>
                <p className="text-[11px] text-slate-500">Primary operational tools sized for mobile thumbs</p>
              </div>

              <div className="space-y-2.5">
                {/* 1. Record Customer Visit */}
                <button
                  onClick={() => switchRole('frontline_staff')}
                  className="w-full min-h-[54px] p-4 rounded-2xl bg-amber-600 active:bg-amber-700 text-white font-bold text-sm flex items-center justify-between shadow-sm active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold leading-tight">Record Customer Visit</div>
                      <div className="text-[11px] text-amber-100 font-normal">Open frontline counter terminal</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-200" />
                </button>

                {/* 2. Create Loyalty Programme */}
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setActiveTab('new_programme_wizard');
                  }}
                  className="w-full min-h-[54px] p-4 rounded-2xl bg-slate-900 active:bg-slate-800 text-white font-bold text-sm flex items-center justify-between shadow-sm active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold leading-tight">Create Loyalty Programme</div>
                      <div className="text-[11px] text-slate-400 font-normal">Guided 10+1 wizard setup</div>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-slate-300" />
                </button>

                {/* 3. Invite Staff Member */}
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full min-h-[54px] p-4 rounded-2xl bg-white border-2 border-slate-200 active:border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-between shadow-xs active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold leading-tight">Invite Team Member</div>
                      <div className="text-[11px] text-slate-500 font-normal">Add cashiers, managers, or stylists</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* 4. Setup Guide / Location (Owner only) */}
                {isOwner && (
                  <button
                    onClick={() => {
                      setOnboardStep(1);
                      setActiveTab('onboarding_wizard');
                    }}
                    className="w-full min-h-[54px] p-4 rounded-2xl bg-white border-2 border-amber-200 active:border-amber-300 text-amber-950 font-bold text-sm flex items-center justify-between shadow-xs active:scale-[0.98] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-amber-700" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold leading-tight">Business Setup Guide</div>
                        <div className="text-[11px] text-amber-800 font-normal">Onboarding, locations & store config</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-600" />
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* ================= MULTI-COLUMN DESKTOP DASHBOARD (hidden md:block) ================= */}
          <div className="hidden md:block space-y-6">
            {/* Quick Actions Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Quick Actions:</span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => {
                  setWizardStep(1);
                  setActiveTab('new_programme_wizard');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Programme</span>
              </button>
              {isOwner && (
                <button
                  onClick={() => {
                    setOnboardStep(1);
                    setActiveTab('onboarding_wizard');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Setup Guide / New Business</span>
                </button>
              )}
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Invite Staff</span>
              </button>
              <button
                onClick={() => switchRole('frontline_staff')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Open Counter View</span>
              </button>
            </div>
          </div>

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
      </div>
      )}

      {/* ================= TAB 2: CUSTOMERS ================= */}
      {activeTab === 'customers' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Customers Header & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Customer Relationships ({orgRelationships.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Customers registered with {currentOrg.name}. Isolated to this business.
                </p>
              </div>
              <button
                onClick={() => switchRole('frontline_staff')}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Counter Terminal</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={e => setCustomerSearchQuery(e.target.value)}
                placeholder="Search customers by name, phone or ONUS ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-hidden transition"
              />
              {customerSearchQuery && (
                <button
                  onClick={() => setCustomerSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Customers', count: orgRelationships.length },
                { id: 'ready', label: '11th Ready', count: rewardsAvailableAtOrg.length, highlight: true },
                { id: 'approaching', label: 'Near Reward (8-9)', count: customersCloseToReward.length }
              ].map(f => {
                const isSelected = customerFilterTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setCustomerFilterTab(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                      isSelected
                        ? f.highlight
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Profile Cards Grid */}
          {(() => {
            const filteredRels = orgRelationships.filter(rel => {
              const customer = users.find(u => u.id === rel.customerId);
              const prog = programmes.find(p => p.id === rel.programmeId);
              if (!customer || !prog) return false;

              // Filter tab
              if (customerFilterTab === 'ready' && !rel.rewardAvailable) return false;
              if (customerFilterTab === 'approaching' && (rel.approvedSteps < 8 || rel.rewardAvailable)) return false;

              // Search query
              if (customerSearchQuery.trim()) {
                const q = customerSearchQuery.toLowerCase();
                const matchName = customer.name.toLowerCase().includes(q);
                const matchPhone = customer.phone.toLowerCase().includes(q);
                const matchOnus = customer.onusId ? customer.onusId.toLowerCase().includes(q) : false;
                const matchProg = prog.name.toLowerCase().includes(q);
                return matchName || matchPhone || matchOnus || matchProg;
              }
              return true;
            });

            if (filteredRels.length === 0) {
              return (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2 shadow-xs">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No matching customers</div>
                  <p className="text-xs text-slate-400">
                    Try adjusting your search query or filter selection.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredRels.map(rel => {
                  const customer = users.find(u => u.id === rel.customerId);
                  const prog = programmes.find(p => p.id === rel.programmeId);
                  if (!customer || !prog) return null;

                  return (
                    <div
                      key={rel.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs space-y-3.5 ${
                        rel.rewardAvailable
                          ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300 ring-1 ring-amber-300/40'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Card Header: Profile Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 font-display font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {customer.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-slate-900 truncate">
                                {customer.name}
                              </h3>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                {customer.onusId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {customer.phone}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {rel.rewardAvailable ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-950 border border-amber-300 shrink-0 animate-pulse">
                            🎁 11th Ready!
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">
                            Cycle #{rel.currentCycle}
                          </span>
                        )}
                      </div>

                      {/* Programme Context & Visual Progress */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Active Programme
                          </span>
                          <span className="text-xs font-bold text-slate-900 block">
                            {prog.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {rel.rewardAvailable
                              ? '10 visits recorded • 11th On Us!'
                              : `${rel.approvedSteps} of 10 steps • ${10 - rel.approvedSteps} to go`}
                          </span>
                        </div>

                        <div className="shrink-0 scale-85 origin-right">
                          <LoyaltyCircle
                            approvedSteps={rel.approvedSteps}
                            pendingSteps={rel.pendingSteps}
                            rewardAvailable={rel.rewardAvailable}
                            size="sm"
                            showLabels={false}
                            cycleNumber={rel.currentCycle}
                          />
                        </div>
                      </div>

                      {/* Primary 'Record Action' Touch Target */}
                      <div className="pt-0.5">
                        {rel.rewardAvailable ? (
                          <button
                            onClick={() => setActionCustomerRel(rel)}
                            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
                          >
                            <Gift className="w-4 h-4" />
                            <span>Redeem 11th ONUS Reward</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionCustomerRel(rel)}
                            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4 text-amber-400" />
                            <span>Record Customer Visit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <span className="hidden sm:inline text-slate-500 text-[11px]">
                    Max units: {prog.rules.maxUnitsPerTx} • Approval threshold: {prog.rules.requireApprovalAbove}+
                  </span>
                  <span className="sm:hidden text-slate-400 text-[11px] font-medium">
                    10+1 Standard
                  </span>

                  <div className="flex items-center gap-2">
                    {prog.status === 'active' ? (
                      <button
                        onClick={() => updateProgrammeStatus(prog.id, 'paused')}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition active:scale-[0.98]"
                      >
                        Pause Programme
                      </button>
                    ) : prog.status === 'paused' || prog.status === 'draft' ? (
                      <button
                        onClick={() => updateProgrammeStatus(prog.id, 'active')}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs transition active:scale-[0.98] shadow-xs"
                      >
                        Activate Programme
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
        <div className="space-y-4 sm:space-y-5">
          {/* Approvals Header & Filter Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Operations Approval Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Multi-unit visits, exceptions, and audit decisions for {currentOrg.name}.
                </p>
              </div>

              {/* Status Toggle Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => setApprovalFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    approvalFilterTab === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Pending</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      approvalFilterTab === 'pending' ? 'bg-white text-amber-900' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pendingApprovals.length}
                  </span>
                </button>

                <button
                  onClick={() => setApprovalFilterTab('resolved')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    approvalFilterTab === 'resolved'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Resolved Log</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      approvalFilterTab === 'resolved' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {orgApprovals.filter(a => a.status !== 'pending').length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pending Approvals: Mobile-Native Card-Stack Layout */}
          {approvalFilterTab === 'pending' && (
            <>
              {pendingApprovals.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">All Approvals Resolved</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No transactions currently waiting for manager or owner sign-off.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {pendingApprovals.map(item => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 bg-white shadow-xs space-y-4"
                    >
                      {/* Customer & Programme Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-950 font-display font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {item.customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                                {item.customerName}
                              </h3>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                {item.customerId}
                              </span>
                            </div>
                            <div className="text-xs text-amber-900 font-semibold mt-0.5">
                              {item.programmeName}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-950 border border-amber-300 shrink-0">
                          Requires Decision
                        </span>
                      </div>

                      {/* Transaction Highlight Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Requested Units
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Staff Member
                          </span>
                          <span className="font-bold text-slate-800 truncate block">
                            {item.staffName}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Reason Callout */}
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
                            Reason for Review
                          </div>
                          <p className="font-medium mt-0.5 leading-snug">
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      {/* Primary Easy-to-Reach Thumb Targets */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={() => approvePendingItem(item.id)}
                          className="min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Apply</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApprovalForReject(item.id);
                            setRejectionReason('Declined multi-unit visit limit');
                          }}
                          className="min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Entry</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Resolved Log */}
          {approvalFilterTab === 'resolved' && (
            <div className="space-y-3">
              {orgApprovals.filter(a => a.status !== 'pending').length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2 shadow-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">No resolved items yet</div>
                  <p className="text-xs text-slate-400">Decisions you make will appear here for auditing.</p>
                </div>
              ) : (
                orgApprovals
                  .filter(a => a.status !== 'pending')
                  .map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.customerName} • {item.quantity} Units
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.programmeName} • Staff: {item.staffName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
              )}
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

      {/* ================= NEW PROGRAMME GUIDED WIZARD (Section 5 & 11) ================= */}
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
              {wizardStep === 1 && '1. What are you rewarding?'}
              {wizardStep === 2 && '2. What does the customer receive after 10?'}
              {wizardStep === 3 && '3. Operating rules'}
              {wizardStep === 4 && '4. Plain-Language Review & Launch'}
            </h2>
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Programme / Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Haircut, Signature Flat White, Oil Change"
                  value={newProgName}
                  onChange={e => setNewProgName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
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
                  <option>Fitness & Wellness</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Qualifying Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Haircut, Cappuccino, Car Wash"
                  value={newProgItemName}
                  onChange={e => setNewProgItemName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
                <span className="text-[11px] text-slate-400">The specific item or service recorded at the counter.</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Normal Selling Price ({currentOrg.currency}) *</label>
                <input
                  type="number"
                  value={newProgPrice}
                  onChange={e => setNewProgPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <button
                onClick={() => setWizardStep(2)}
                disabled={!newProgName || !newProgItemName}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition mt-2 shadow-xs"
              >
                Next: What customer receives →
              </button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  The Core 11thONUS Proposition
                </span>
                <div className="text-xl font-bold text-amber-950 font-display">
                  Buy 10. The 11th is On Us.
                </div>
                <p className="text-amber-900 text-xs max-w-md mx-auto leading-relaxed">
                  Customers complete 10 qualifying purchases of <strong>{newProgItemName || 'Item'}</strong>.
                  Their next <strong>{newProgItemName || 'Item'}</strong> is 100% on <strong>{currentOrg.name}</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block">How it works for your customer:</span>
                <p>• Steps 1–9 fill the visual loyalty circle on their phone or counter receipt.</p>
                <p>• Step 10 completes the circle, making their 11th visit completely on {currentOrg.name}.</p>
                <p>• Clean, predictable, and honest — no confusing points or fluctuating exchange rates.</p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Next: Operating Rules →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              {/* Primary Operating Rule */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Standard Operating Baseline</span>
                <div className="font-semibold text-slate-900">
                  Standard 10-purchase circle. 1 qualifying visit recorded per transaction.
                </div>
                <p className="text-slate-500 text-[11px]">
                  Most businesses run smoothly with standard defaults without needing to configure complex rules.
                </p>
              </div>

              {/* Progressive Disclosure for Advanced Controls */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                  className="w-full p-3 bg-white text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>Need to adjust operating rules? (Advanced)</span>
                  <span className="text-amber-700 font-bold">{showAdvancedRules ? 'Hide ▲' : 'Show ▼'}</span>
                </button>

                {showAdvancedRules && (
                  <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                      <div>
                        <span className="font-bold text-slate-900 block">Allow Multiple Units in One Visit</span>
                        <span className="text-slate-500 text-[11px]">Can a customer pay for companions in the same transaction?</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={newProgAllowMulti}
                        onChange={e => setNewProgAllowMulti(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                    </div>

                    {newProgAllowMulti && (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Require Manager Approval Above (Units)</label>
                        <select
                          value={newProgApprovalAbove}
                          onChange={e => setNewProgApprovalAbove(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white"
                        >
                          <option value={1}>Above 1 unit</option>
                          <option value={2}>Above 2 units (Recommended)</option>
                          <option value={3}>Above 3 units</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Next: Review & Launch →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Human-Readable Summary</span>
                <p className="text-amber-950 text-sm font-semibold leading-relaxed">
                  "Customers complete 10 qualifying <strong>{newProgItemName || 'purchases'}</strong>. Their next <strong>{newProgItemName || 'purchase'}</strong> is on <strong>{currentOrg.name}</strong>."
                </p>
                <div className="text-[11px] text-amber-800 pt-1">
                  Selling price: {newProgPrice.toLocaleString()} {currentOrg.currency} • Circle capacity: 10 steps
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Activation State</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newProgStatus === 'active'}
                      onChange={() => setNewProgStatus('active')}
                      className="text-amber-600"
                    />
                    <span className="font-semibold text-emerald-700">Activate Immediately</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newProgStatus === 'draft'}
                      onChange={() => setNewProgStatus('draft')}
                      className="text-amber-600"
                    />
                    <span className="font-semibold text-slate-600">Save as Draft</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
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

      {/* ================= ONBOARDING WIZARD (Section 4) ================= */}
      {activeTab === 'onboarding_wizard' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Organisation Setup • Step {onboardStep} of 4
              </span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Exit Setup
              </button>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
              {onboardStep === 1 && '1. Tell us about your business'}
              {onboardStep === 2 && '2. Create your first loyalty programme'}
              {onboardStep === 3 && '3. Invite your frontline team'}
              {onboardStep === 4 && '4. Ready to start!'}
            </h2>
          </div>

          {/* Step 1: Business */}
          {onboardStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bella Salon, Lake View Cafe"
                  value={onboardOrgName}
                  onChange={e => setOnboardOrgName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Industry Category</label>
                <select
                  value={onboardCategory}
                  onChange={e => setOnboardCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option>Salon & Personal Care</option>
                  <option>Food & Specialty Coffee</option>
                  <option>Auto Detailing & Care</option>
                  <option>Dry Cleaning & Laundry</option>
                  <option>Wellness & Fitness</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Country</label>
                  <select
                    value={onboardCountry}
                    onChange={e => setOnboardCountry(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="Burundi">Burundi</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={onboardCity}
                    onChange={e => setOnboardCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Operating Currency</label>
                <input
                  type="text"
                  value={onboardCurrency}
                  onChange={e => setOnboardCurrency(e.target.value)}
                  placeholder="e.g. BIF, RWF, USD"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <button
                onClick={() => setOnboardStep(2)}
                disabled={!onboardOrgName}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition mt-2 shadow-xs"
              >
                Next: First Programme →
              </button>
            </div>
          )}

          {/* Step 2: First Programme */}
          {onboardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">The 11thONUS Rule</span>
                <div className="text-base font-bold text-amber-950">Buy 10. The 11th is On Us.</div>
                <p className="text-amber-800 text-xs">
                  Your customers complete 10 purchases, then earn their 11th visit free.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">What service or item are you rewarding? *</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Haircut, Signature Flat White"
                  value={onboardProgName}
                  onChange={e => setOnboardProgName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Item Name Recorded at Counter *</label>
                <input
                  type="text"
                  placeholder="e.g. Haircut, Cappuccino"
                  value={onboardProgItem}
                  onChange={e => setOnboardProgItem(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Standard Price ({onboardCurrency}) *</label>
                <input
                  type="number"
                  value={onboardProgPrice}
                  onChange={e => setOnboardProgPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setOnboardStep(1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setOnboardStep(3)}
                  disabled={!onboardProgName || !onboardProgItem}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Next: Team Setup →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {onboardStep === 3 && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Frontline staff need quick access to record customer visits at the counter. Invite your first counter specialist now, or skip to add later.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Team Member Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diane K."
                  value={onboardStaffName}
                  onChange={e => setOnboardStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. diane@bellasalon.bi"
                  value={onboardStaffEmail}
                  onChange={e => setOnboardStaffEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +257 79 12 34 56"
                  value={onboardStaffPhone}
                  onChange={e => setOnboardStaffPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setOnboardStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCompleteOnboarding}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Complete Setup →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Ready! */}
          {onboardStep === 4 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-slate-900">
                  {onboardCreatedOrgName || onboardOrgName} is ready to start recognising loyal customers.
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your business is set up with <strong>{onboardProgName}</strong> and ready to record qualifying visits.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Configuration Summary
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Business:</span>
                  <strong className="text-slate-900">{onboardCreatedOrgName || onboardOrgName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Programme:</span>
                  <strong className="text-slate-900">{onboardProgName} (10 + 1 On Us)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Normal Price:</span>
                  <strong className="text-slate-900">{onboardProgPrice.toLocaleString()} {onboardCurrency}</strong>
                </div>
                {onboardStaffName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invited Specialist:</span>
                    <strong className="text-slate-900">{onboardStaffName}</strong>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => switchRole('frontline_staff')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                >
                  Open Frontline Counter →
                </button>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setOnboardStep(1);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition"
                >
                  Open Command Centre
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

      {/* ================= MODAL: RECORD CUSTOMER VISIT / REDEEM REWARD ================= */}
      {actionCustomerRel && (() => {
        const customer = users.find(u => u.id === actionCustomerRel.customerId);
        const prog = programmes.find(p => p.id === actionCustomerRel.programmeId);
        if (!customer || !prog) return null;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                    actionCustomerRel.rewardAvailable ? 'bg-emerald-600' : 'bg-slate-900'
                  }`}>
                    {actionCustomerRel.rewardAvailable ? <Gift className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {actionCustomerRel.rewardAvailable ? 'Redeem 11th ONUS Reward' : 'Record Customer Visit'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {customer.name} ({customer.onusId})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActionCustomerRel(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Programme:</span>
                  <span className="font-bold text-slate-900">{prog.name}</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Current Progress:</span>
                  <span className="font-bold text-amber-700">
                    {actionCustomerRel.rewardAvailable
                      ? 'Reward Unlocked (10/10 Visits)'
                      : `${actionCustomerRel.approvedSteps} of 10 Steps`}
                  </span>
                </div>
              </div>

              {actionCustomerRel.rewardAvailable ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>11th Visit is 100% On Us</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Confirm that the customer is receiving their free reward now. Their loyalty circle will reset to Cycle #{actionCustomerRel.currentCycle + 1}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Units to Record
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setActionUnits(u)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                            actionUnits === u
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {u} {u === 1 ? 'Visit' : 'Visits'}
                        </button>
                      ))}
                    </div>
                    {actionUnits > 1 && (
                      <p className="text-[11px] text-amber-700 mt-1">
                        Note: Visits exceeding threshold require manager approval.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Transaction Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={actionNotes}
                      onChange={e => setActionNotes(e.target.value)}
                      placeholder="e.g. Counter visit, haircut, order..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex gap-2.5">
                <button
                  onClick={() => setActionCustomerRel(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordActionSubmit}
                  className={`flex-1 py-3 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-[0.98] ${
                    actionCustomerRel.rewardAvailable
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {actionCustomerRel.rewardAvailable ? 'Confirm Redemption' : 'Record Qualifying Visit'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <MobileNavigation
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId as any)}
        badges={{
          approvals: pendingApprovals.length,
          customers: orgRelationships.length,
          programmes: orgProgrammes.length
        }}
        isOwner={isOwner}
        onQuickCounter={() => switchRole('frontline_staff')}
        onOpenSetup={() => {
          setOnboardStep(1);
          setActiveTab('onboarding_wizard');
        }}
      />
    </div>
  );
};
