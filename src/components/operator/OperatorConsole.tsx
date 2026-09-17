import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Users,
  Award,
  AlertTriangle,
  LifeBuoy,
  CreditCard,
  Globe2,
  Activity,
  FileText,
  Sliders,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Lock,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { Organisation, User, IntegrityCase, SupportCase, BusinessStatus } from '../../types';

export const OperatorConsole: React.FC = () => {
  const {
    currentUser,
    organisations,
    programmes,
    users,
    relationships,
    transactions,
    completedRewards,
    integrityCases,
    supportCases,
    commercialRecords,
    auditLogs,
    markets,
    resolveIntegrityCase,
    resolveSupportCase,
    toggleOrgStatus
  } = useApp();

  const [activeNav, setActiveNav] = useState<
    | 'overview'
    | 'organisations'
    | 'participants'
    | 'loyalty_ops'
    | 'integrity'
    | 'support'
    | 'commercial'
    | 'markets'
    | 'health'
    | 'audit'
  >('overview');

  // Sub-detail view state
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedIntegrityCase, setSelectedIntegrityCase] = useState<IntegrityCase | null>(null);
  const [selectedSupportCase, setSelectedSupportCase] = useState<SupportCase | null>(null);
  const [integrityNotes, setIntegrityNotes] = useState('');
  const [supportNotes, setSupportNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Key platform metrics
  const totalCompletedCircles = organisations.reduce((sum, o) => sum + o.completedBillableCircles, 0);
  const totalAvailableRewards = completedRewards.filter(r => r.status === 'available').length;
  const totalRedeemedRewards = completedRewards.filter(r => r.status === 'redeemed').length;
  const openIntegrityCases = integrityCases.filter(c => c.status === 'open' || c.status === 'under_review');
  const openSupportCases = supportCases.filter(c => c.status === 'open' || c.status === 'investigating');
  const participantsCount = users.filter(u => u.role === 'participant').length;

  const selectedOrg = organisations.find(o => o.id === selectedOrgId);

  return (
    <div className="space-y-6">
      {/* Platform Operator Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              11thONUS Operator
            </span>
            <span className="text-xs text-slate-400">
              Logged in: <strong className="text-white">{currentUser.name}</strong> ({currentUser.operatorRole || 'Platform Operations'})
            </span>
          </div>
          <h1 className="text-xl font-bold font-display mt-1">
            Platform Overview & Governance
          </h1>
          <p className="text-xs text-slate-400">
            Live operational oversight across participating businesses, customer loyalty cycles, and platform integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Status: Healthy (100%)</span>
          </div>
        </div>
      </div>

      {/* Operator Navigation Pill Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform Overview', icon: Activity },
          { id: 'organisations', label: 'Businesses', icon: Building2, badge: organisations.length },
          { id: 'participants', label: 'Participants', icon: Users },
          { id: 'loyalty_ops', label: 'Loyalty Cycles', icon: Award },
          { id: 'integrity', label: 'Activity & Integrity', icon: AlertTriangle, alertBadge: openIntegrityCases.length },
          { id: 'support', label: 'Support & Exceptions', icon: LifeBuoy, alertBadge: openSupportCases.length },
          { id: 'commercial', label: 'Billing & Usage', icon: CreditCard },
          { id: 'markets', label: 'Markets & Currencies', icon: Globe2 },
          { id: 'health', label: 'System Health', icon: Activity },
          { id: 'audit', label: 'Audit Trail', icon: FileText }
        ].map(nav => {
          const Icon = nav.icon;
          const isActive = activeNav === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => {
                setActiveNav(nav.id as any);
                setSelectedOrgId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{nav.label}</span>
              {nav.alertBadge !== undefined && nav.alertBadge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {nav.alertBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SECTION 1: PLATFORM OVERVIEW ================= */}
      {activeNav === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Active Businesses</span>
              <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                {organisations.filter(o => o.status === 'active').length}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Across Burundi & Rwanda</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Completed 10+1 Circles</span>
              <div className="text-2xl font-display font-extrabold text-amber-700 mt-1">
                {totalCompletedCircles}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium font-mono">
                ${totalCompletedCircles * 1}.00 USD Gross Consumption
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Rewards Redeemed</span>
              <div className="text-2xl font-display font-extrabold text-emerald-700 mt-1">
                {totalRedeemedRewards}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {totalAvailableRewards} currently active in wallets
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Exceptions & Integrity</span>
              <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                {openIntegrityCases.length}
              </div>
              <span className={`text-[11px] font-medium ${openIntegrityCases.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {openIntegrityCases.length > 0 ? 'Requires investigation' : 'Zero flags'}
              </span>
            </div>
          </div>

          {/* Operational Queues Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Platform Integrity & Flags */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Trust & Integrity Queue ({openIntegrityCases.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveNav('integrity')}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    Manage all →
                  </button>
                </div>

                <div className="space-y-2">
                  {openIntegrityCases.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {item.caseNumber} • {item.orgName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 uppercase">
                          {item.flagType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-700">{item.reason}</p>
                      <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                        <span>Assigned: {item.assignedOperator}</span>
                        <button
                          onClick={() => {
                            setSelectedIntegrityCase(item);
                            setActiveNav('integrity');
                          }}
                          className="font-bold text-amber-800 hover:underline"
                        >
                          Review Case →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time Platform Transaction Feed */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Cross-Platform Activity Stream
                  </h2>
                  <span className="text-[11px] text-slate-400">Live synchronized ledger</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">
                          {organisations.find(o => o.id === tx.orgId)?.name}
                        </span>
                        <span className="text-slate-400"> • </span>
                        <span className="text-slate-600">
                          {tx.customerName} ({tx.quantity} unit)
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'approved' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Businesses Requiring Attention & Commercial Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Businesses Requiring Operator Oversight
                  </h2>
                </div>

                <div className="space-y-2">
                  {organisations.map(org => (
                    <div
                      key={org.id}
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        setActiveNav('organisations');
                      }}
                      className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{org.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {org.city}, {org.country} • {org.completedBillableCircles} completed circles
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          org.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : org.status === 'onboarding'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {org.status}
                        </span>
                        {org.lowCreditAlert && (
                          <span className="block text-[10px] text-red-600 font-bold mt-0.5">
                            Low Credit Balance
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: ORGANISATION DIRECTORY & 360° VIEW ================= */}
      {activeNav === 'organisations' && (
        <div className="space-y-6">
          {selectedOrg ? (
            /* 360 Degree View of Specific Business (Section 42) */
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-display font-extrabold flex items-center justify-center text-lg">
                    {selectedOrg.logoText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{selectedOrg.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedOrg.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedOrg.category} • {selectedOrg.city}, {selectedOrg.country} • Joined {selectedOrg.createdAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrgId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  ← Back to Directory
                </button>
              </div>

              {/* 360 Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    Commercial Snapshot
                  </span>
                  <div>Trial Remaining: <strong>{selectedOrg.trialCirclesRemaining}</strong></div>
                  <div>Completed Billable Circles: <strong>{selectedOrg.completedBillableCircles}</strong></div>
                  <div>Credit Balance: <strong>${selectedOrg.creditBalanceUSD.toFixed(2)} USD</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    Team & Staff
                  </span>
                  <div>Staff count: <strong>{users.filter(u => u.orgId === selectedOrg.id).length}</strong></div>
                  <div>Primary contact: <strong>{selectedOrg.primaryContact}</strong></div>
                  <div>Email: <strong>{selectedOrg.email}</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    Operator Actions
                  </span>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      onClick={() => toggleOrgStatus(selectedOrg.id, selectedOrg.status === 'active' ? 'restricted' : 'active', 'Operator compliance review')}
                      className="px-2.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-center"
                    >
                      {selectedOrg.status === 'active' ? 'Restrict Organisation' : 'Activate Organisation'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Directory List */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Platform Organisations ({organisations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Businesses registered to operate independent 11thONUS loyalty programmes.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {organisations.map(org => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-lg transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        {org.logoText}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{org.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {org.category} • {org.city}, {org.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{org.completedBillableCircles}</span>
                        <span className="text-[11px] text-slate-400 block">Circles</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        org.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {org.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 3: TRUST & INTEGRITY (Section 47) ================= */}
      {activeNav === 'integrity' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Trust & Integrity Operations
            </h2>
            <p className="text-xs text-slate-500">
              Algorithmic pattern detection for unusual velocities, repeat reversals, and policy exceptions. Language remains objective: "Flagged for review" until investigated.
            </p>
          </div>

          <div className="space-y-3">
            {integrityCases.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border text-xs space-y-3 ${
                  item.status === 'resolved'
                    ? 'bg-slate-50/60 border-slate-200'
                    : 'bg-amber-50/60 border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{item.caseNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                        {item.flagType.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500">Org: <strong>{item.orgName}</strong></span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-1">{item.reason}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Evidence: {item.evidence}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {item.resolutionNotes && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                    <strong>Resolution Findings: </strong> {item.resolutionNotes}
                  </div>
                )}

                {item.status !== 'resolved' && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add investigation notes & resolution..."
                      value={integrityNotes}
                      onChange={e => setIntegrityNotes(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs"
                    />
                    <button
                      onClick={() => {
                        resolveIntegrityCase(item.id, integrityNotes || 'Verified legitimate activity with business management.');
                        setIntegrityNotes('');
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Resolve Case
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: SUPPORT QUEUE (Section 48) ================= */}
      {activeNav === 'support' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Support Operations Queue
            </h2>
            <p className="text-xs text-slate-500">
              Customer inquiries, purchase disputes, access requests, and business setup assistance.
            </p>
          </div>

          <div className="space-y-3">
            {supportCases.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{item.caseNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500">Requester: <strong>{item.requesterName}</strong></span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{item.title}</h3>
                    <p className="text-slate-600 mt-0.5">{item.description}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {item.status !== 'resolved' && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter response / action note..."
                      value={supportNotes}
                      onChange={e => setSupportNotes(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs"
                    />
                    <button
                      onClick={() => {
                        resolveSupportCase(item.id, supportNotes || 'Provided clarity on programme rules.');
                        setSupportNotes('');
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                    >
                      Close Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 5: PLATFORM HEALTH (Section 53) ================= */}
      {activeNav === 'health' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Operational Platform Health
            </h2>
            <p className="text-xs text-slate-500">
              Evaluates: "Is the 11thONUS product operating correctly?" — not raw CPU metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 block">Transaction Processing Pipeline</span>
              <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Operational • 12ms latency
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 block">Approval Queue Dispatch</span>
              <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Operational • Zero backlog
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 block">11th Reward Generation Engine</span>
              <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Operational • Deterministic 10+1
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 6: AUDIT & ACCOUNTABILITY (Section 54) ================= */}
      {activeNav === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Platform Audit & Accountability Log
            </h2>
            <p className="text-xs text-slate-500">
              Immutable ledger of high-impact actions, commercial adjustments, and permissions. Records cannot be altered or deleted.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-600">
                      Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700">{log.reason}</p>
                {log.previousState && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Change: {log.previousState} → {log.newState}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 7: COUNTRIES & MARKETS (Section 50) ================= */}
      {activeNav === 'markets' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Country & Market Configurations
            </h2>
            <p className="text-xs text-slate-500">
              Regional currencies, market rollouts, and localized language preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {markets.map(mkt => (
              <div key={mkt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{mkt.country}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    mkt.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {mkt.status.toUpperCase()}
                  </span>
                </div>
                <div>Currency: <strong>{mkt.currency}</strong> ({mkt.code})</div>
                <div>Default language: <strong>{mkt.defaultLanguage.toUpperCase()}</strong></div>
                <div>Active participating businesses: <strong>{mkt.activeBusinessesCount}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
