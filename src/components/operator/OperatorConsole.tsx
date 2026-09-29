import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  AlertTriangle,
  LifeBuoy,
  CreditCard,
  Globe2,
  Activity,
  FileText,
  CheckCircle2,
  Search,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';
import { Organisation } from '../../types';

type NavId = 'operations' | 'businesses' | 'commercial' | 'support' | 'integrity' | 'platform' | 'audit';

const NAV: { id: NavId; label: string; icon: any }[] = [
  { id: 'operations', label: 'Operations', icon: LayoutDashboard },
  { id: 'businesses', label: 'Businesses', icon: Building2 },
  { id: 'commercial', label: 'Commercial', icon: CreditCard },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'integrity', label: 'Integrity', icon: AlertTriangle },
  { id: 'platform', label: 'Platform', icon: Globe2 },
  { id: 'audit', label: 'Audit', icon: FileText }
];

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${tone}`}>
      {children}
    </span>
  );
}

const statusTone = (s: string) =>
  s === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  : s === 'trial' ? 'bg-blue-50 text-blue-700 border border-blue-200'
  : s === 'onboarding' ? 'bg-slate-100 text-slate-700 border border-slate-200'
  : 'bg-amber-50 text-amber-800 border border-amber-200';

const standingTone = (s?: string) =>
  s === 'paid_active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  : s === 'trial' ? 'bg-blue-50 text-blue-700 border border-blue-200'
  : s === 'grace' ? 'bg-amber-50 text-amber-800 border border-amber-200'
  : s === 'restricted' || s === 'suspended' ? 'bg-red-50 text-red-700 border border-red-200'
  : 'bg-slate-100 text-slate-600 border border-slate-200';

export const OperatorConsole: React.FC = () => {
  const {
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
    grantTrial,
    adjustTrial,
    activatePaidService,
    addCommercialCredit,
    adjustCommercialCredit,
    restrictBusiness,
    restoreBusiness,
    updateIntegrityCase,
    updateSupportCase,
    applyOperatorScenario
  } = useApp();

  const [activeNav, setActiveNav] = useState<NavId>('operations');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [supportQuery, setSupportQuery] = useState('');
  const [auditQuery, setAuditQuery] = useState('');

  // Commercial form state (per selected org)
  const [trialUnits, setTrialUnits] = useState(5);
  const [trialReason, setTrialReason] = useState('');
  const [trialDelta, setTrialDelta] = useState(2);
  const [trialAdjReason, setTrialAdjReason] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [creditAmount, setCreditAmount] = useState(20);
  const [creditRef, setCreditRef] = useState('');
  const [creditDelta, setCreditDelta] = useState(-5);
  const [creditAdjReason, setCreditAdjReason] = useState('');
  const [restrictReason, setRestrictReason] = useState('');
  const [restoreReason, setRestoreReason] = useState('');

  const [caseNotes, setCaseNotes] = useState('');
  const [selectedSupportId, setSelectedSupportId] = useState<string | null>(null);
  const [selectedIntegrityId, setSelectedIntegrityId] = useState<string | null>(null);

  const openIntegrity = useMemo(
    () => integrityCases.filter(c => c.status === 'open' || c.status === 'under_review'),
    [integrityCases]
  );
  const openSupport = useMemo(
    () => supportCases.filter(c => c.status === 'open' || c.status === 'investigating'),
    [supportCases]
  );
  const urgentSupport = openSupport.filter(c => c.priority === 'high');

  const onboardingQueue = organisations.filter(
    o => o.status === 'onboarding' || o.onboardingState === 'incomplete' || o.onboardingState === 'ready'
  );
  // Experience Reference operational presentation threshold: with the
  // governed 3–5-unit trial direction (5-unit prototype example), "nearing
  // exhaustion" means 1 unit remaining. This threshold is a console
  // presentation choice, NOT a newly approved commercial policy.
  const trialLow = organisations.filter(o => o.trialCirclesRemaining === 1 && !o.paidActive);
  const trialExhausted = organisations.filter(o => o.trialCirclesRemaining === 0 && !o.paidActive);
  const awaitingActivation = organisations.filter(
    o => !o.paidActive && o.onboardingState !== 'incomplete' && (o.trialCirclesRemaining === 0 || o.creditBalanceUSD > 0)
  );
  const lowCredit = organisations.filter(o => o.creditBalanceUSD < 5 && o.trialCirclesRemaining === 0 && o.creditBalanceUSD > 0);
  const zeroCredit = organisations.filter(o => o.creditBalanceUSD <= 0);
  const restricted = organisations.filter(o => o.status === 'restricted' || o.status === 'suspended' || o.commercialStanding === 'restricted' || o.commercialStanding === 'suspended');
  const grace = organisations.filter(o => o.gracePeriodActive);

  const selectedOrg: Organisation | undefined = organisations.find(o => o.id === selectedOrgId);
  const selectedSupport = supportCases.find(c => c.id === selectedSupportId) ?? null;
  const selectedIntegrity = integrityCases.find(c => c.id === selectedIntegrityId) ?? null;

  const filteredOrgs = organisations.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSupport = supportCases.filter(c =>
    `${c.caseNumber} ${c.title} ${c.requesterName} ${c.linkedOrgName ?? ''}`.toLowerCase().includes(supportQuery.toLowerCase())
  );

  const commercialAudit = auditLogs.filter(l =>
    /TRIAL|CREDIT|PAID|BUSINESS_RESTORED|BUSINESS_RESTRICTED|ONBOARDING/.test(l.action)
  );

  const filteredAudit = auditLogs.filter(l =>
    `${l.action} ${l.actorName} ${l.targetId} ${l.reason}`.toLowerCase().includes(auditQuery.toLowerCase())
  );

  const openBusiness = (orgId: string) => {
    setSelectedOrgId(orgId);
    setActiveNav('businesses');
  };

  const renderCommercialPanel = (org: Organisation) => {
    const trialUsed = (org.trialAllowanceTotal ?? 5) - org.trialCirclesRemaining;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Commercial standing</span>
            <span className="mt-1 inline-block"><Badge tone={standingTone(org.commercialStanding)}>{(org.commercialStanding ?? 'trial').replace('_', ' ')}</Badge></span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Trial allowance / remaining</span>
            <strong className="text-slate-900">{org.trialAllowanceTotal ?? 5} / {org.trialCirclesRemaining}</strong>
            <span className="block text-[11px] text-slate-500">Used: {Math.max(0, trialUsed)} • $1 per completed circle</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Completed billable units</span>
            <strong className="text-slate-900">{org.completedBillableCircles}</strong>
            <span className="block text-[11px] text-slate-500">Consumption-first, no tiers</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Credit balance</span>
            <strong className={org.creditBalanceUSD <= 0 ? 'text-red-700' : 'text-slate-900'}>${org.creditBalanceUSD.toFixed(2)}</strong>
            <span className="block text-[11px] text-slate-500">
              {org.creditBalanceUSD <= 0 ? 'Zero: new starts blocked. Active circles finish; rewards stay redeemable.' : org.gracePeriodActive ? 'Grace active' : 'Available for consumption'}
            </span>
          </div>
        </div>

        {org.manualActivation && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Manually activated:</strong> {new Date(org.manualActivation.activatedAt).toLocaleString()} by {org.manualActivation.activatedBy} • Ref {org.manualActivation.reference}
            {org.manualActivation.note ? ` • ${org.manualActivation.note}` : ''}
          </div>
        )}
        {org.operatorNote && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">{org.operatorNote}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Start / grant trial</h4>
            <p className="text-[11px] text-slate-500">Governed trial units only (3–5-unit trial direction; 5-unit example shown). No subscription tiers.</p>
            <div className="flex gap-2">
              <input type="number" min={1} max={5} value={trialUnits} onChange={e => setTrialUnits(Number(e.target.value))} className="w-24 p-2 rounded-lg border border-slate-200 text-xs" />
              <input value={trialReason} onChange={e => setTrialReason(e.target.value)} placeholder="Reason / note (required in review)" className="flex-1 p-2 rounded-lg border border-slate-200 text-xs" />
            </div>
            <button onClick={() => { grantTrial(org.id, trialUnits, trialReason || `Trial granted (${trialUnits} units) for launch onboarding.`); setTrialReason(''); }} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">Grant trial</button>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Small trial extension / adjustment (±5)</h4>
              <p className="text-[11px] text-slate-500">Prototype entry bound only — not a governed trial rule.</p>
              <div className="flex gap-2">
                <input type="number" min={-5} max={5} value={trialDelta} onChange={e => setTrialDelta(Number(e.target.value))} className="w-24 p-2 rounded-lg border border-slate-200 text-xs" />
                <input value={trialAdjReason} onChange={e => setTrialAdjReason(e.target.value)} placeholder="Reason for adjustment" className="flex-1 p-2 rounded-lg border border-slate-200 text-xs" />
              </div>
              <button onClick={() => { adjustTrial(org.id, trialDelta, trialAdjReason || `Trial adjusted (${trialDelta}).`); setTrialAdjReason(''); }} className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">Apply trial adjustment</button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Activate paid service (manual)</h4>
            <p className="text-[11px] text-slate-500">Admin confirms externally that the Business continues under paid terms. No card or payment-provider processing.</p>
            <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Offline reference (e.g. RECEIPT-2026-118)" className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
            <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Operator note (optional)" className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
            <button onClick={() => { if (!payRef.trim()) return; activatePaidService(org.id, payRef.trim(), payNote.trim() || undefined); setPayRef(''); setPayNote(''); }} disabled={!payRef.trim()} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold">Activate paid service</button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Add approved credit</h4>
            <div className="flex gap-2">
              <input type="number" min={1} max={500} value={creditAmount} onChange={e => setCreditAmount(Number(e.target.value))} className="w-24 p-2 rounded-lg border border-slate-200 text-xs" />
              <input value={creditRef} onChange={e => setCreditRef(e.target.value)} placeholder="Approval ref (e.g. FIN-APR-042)" className="flex-1 p-2 rounded-lg border border-slate-200 text-xs" />
            </div>
            <button onClick={() => { if (!creditRef.trim()) return; addCommercialCredit(org.id, creditAmount, creditRef.trim()); setCreditRef(''); }} disabled={!creditRef.trim()} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold">Add credit</button>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Bounded manual adjustment (−50 / +100, reason required)</h4>
              <div className="flex gap-2">
                <input type="number" min={-50} max={100} value={creditDelta} onChange={e => setCreditDelta(Number(e.target.value))} className="w-24 p-2 rounded-lg border border-slate-200 text-xs" />
                <input value={creditAdjReason} onChange={e => setCreditAdjReason(e.target.value)} placeholder="Reason / reference" className="flex-1 p-2 rounded-lg border border-slate-200 text-xs" />
              </div>
              <button onClick={() => { if (!creditAdjReason.trim()) return; adjustCommercialCredit(org.id, creditDelta, creditAdjReason.trim()); setCreditAdjReason(''); }} disabled={!creditAdjReason.trim()} className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold">Apply credit adjustment</button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Restriction / restoration</h4>
            <p className="text-[11px] text-slate-500">Restriction blocks new Circle starts only. Already-active Circles may finish under grace; already-earned rewards remain redeemable and are never cancelled; loyalty history remains intact. Commercial standing never blocks reward redemption.</p>
            <input value={restrictReason} onChange={e => setRestrictReason(e.target.value)} placeholder="Restriction reason" className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
            <div className="flex gap-2">
              <button onClick={() => { if (!restrictReason.trim()) return; restrictBusiness(org.id, restrictReason.trim()); setRestrictReason(''); }} disabled={!restrictReason.trim()} className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold">Restrict</button>
            </div>
            <input value={restoreReason} onChange={e => setRestoreReason(e.target.value)} placeholder="Restoration reason" className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
            <button onClick={() => { if (!restoreReason.trim()) return; restoreBusiness(org.id, restoreReason.trim()); setRestoreReason(''); }} disabled={!restoreReason.trim()} className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold">Restore standing</button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <h4 className="text-xs font-bold text-slate-900 mb-2">Commercial usage & operator history</h4>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {commercialRecords.filter(r => r.orgId === org.id).map(r => (
              <div key={r.id} className="text-[11px] text-slate-700 flex justify-between gap-2">
                <span>Completed circle • ${r.unitAmountUSD.toFixed(2)} • {r.coverageType}</span>
                <span className="text-slate-400">{new Date(r.recordedAt).toLocaleDateString()}</span>
              </div>
            ))}
            {auditLogs.filter(l => l.targetId === org.id && /TRIAL|CREDIT|PAID|RESTRICT|RESTORED|ONBOARDING/.test(l.action)).map(l => (
              <div key={l.id} className="text-[11px] text-slate-700 border-t border-slate-200 pt-1.5">
                <strong>{l.action}</strong> — {l.reason}
                <span className="block text-slate-400">{l.actorName} • {new Date(l.timestamp).toLocaleString()}{l.previousState ? ` • ${l.previousState} → ${l.newState}` : ''}</span>
              </div>
            ))}
            {commercialRecords.filter(r => r.orgId === org.id).length === 0 && (
              <p className="text-[11px] text-slate-400">No completed-circle consumption yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBusiness360 = (org: Organisation) => {
    const orgProgrammes = programmes.filter(p => p.orgId === org.id);
    const orgStaff = users.filter(u => u.orgId === org.id);
    const orgRels = relationships.filter(r => r.orgId === org.id);
    const orgTx = transactions.filter(t => t.orgId === org.id).slice(0, 6);
    const orgRewardsAvail = completedRewards.filter(r => r.orgId === org.id && r.status === 'available').length;
    const orgRewardsRedeemed = completedRewards.filter(r => r.orgId === org.id && r.status === 'redeemed').length;
    const orgSupport = supportCases.filter(c => c.linkedOrgId === org.id);
    const orgIntegrity = integrityCases.filter(c => c.orgId === org.id);
    const orgAudit = auditLogs.filter(l => l.targetId === org.id).slice(0, 6);
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg">{org.logoText}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{org.name}</h2>
                <Badge tone={statusTone(org.status)}>Account: {org.status}</Badge>
                <Badge tone={standingTone(org.commercialStanding)}>Commercial: {(org.commercialStanding ?? 'trial').replace('_', ' ')}</Badge>
                <Badge tone="bg-slate-100 text-slate-700 border border-slate-200">Onboarding: {(org.onboardingState ?? 'ready').replace('_', ' ')}</Badge>
              </div>
              <p className="text-xs text-slate-500">{org.category} • {org.city}, {org.country} • Joined {org.createdAt}</p>
            </div>
          </div>
          <button onClick={() => setSelectedOrgId(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold">← Back to directory</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Identity & contact</span>
            <div>Primary contact: <strong>{org.primaryContact}</strong></div>
            <div>{org.email} • {org.phone}</div>
            <div>{org.address}</div>
            <div className="pt-1 flex gap-2 flex-wrap">
              {(org.onboardingState === 'incomplete' || org.onboardingState === 'ready') && org.trialCirclesRemaining === 0 && !org.paidActive && (
                <button onClick={() => grantTrial(org.id, 5, 'Launch trial granted (5-unit trial direction example).')} className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold">Grant trial (5 units)</button>
              )}
              {(org.onboardingState === 'trial_ready' || org.trialCirclesRemaining > 0) && !org.paidActive && (
                <button onClick={() => setActiveNav('commercial')} className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Activate paid service →</button>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Programme & loyalty activity</span>
            <div>Programmes: <strong>{orgProgrammes.length}</strong> ({orgProgrammes.map(p => p.name).join('; ') || 'none'})</div>
            <div>Participants in cycles: <strong>{orgRels.length}</strong></div>
            <div>Rewards available / redeemed: <strong>{orgRewardsAvail} / {orgRewardsRedeemed}</strong></div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Team</span>
            <div>Owner / team: <strong>{orgStaff.length} members</strong></div>
            <div className="text-[11px] text-slate-600">{orgStaff.map(s => `${s.name} (${s.title ?? s.role})`).join(' • ') || 'No team records'}</div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Commercial operations</h3>
          {renderCommercialPanel(org)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900">Support cases ({orgSupport.length})</h4>
            {orgSupport.map(c => (
              <div key={c.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong>{c.caseNumber}</strong> • {c.title} • <em>{c.status}</em>
              </div>
            ))}
            {orgSupport.length === 0 && <p className="text-slate-400">No support cases.</p>}
            <h4 className="font-bold text-slate-900 pt-2">Integrity flags ({orgIntegrity.length})</h4>
            {orgIntegrity.map(c => (
              <div key={c.id} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                <strong>{c.caseNumber}</strong> • {c.reason} • <em>{c.status}</em>
              </div>
            ))}
            {orgIntegrity.length === 0 && <p className="text-slate-400">No integrity flags.</p>}
          </div>
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900">Recent activity</h4>
            {orgTx.map(t => (
              <div key={t.id} className="flex justify-between text-[11px] text-slate-600">
                <span>{t.customerName} • {t.quantity} unit • {t.type}</span>
                <span>{t.status}</span>
              </div>
            ))}
            {orgTx.length === 0 && <p className="text-slate-400">No recent transactions.</p>}
            <h4 className="font-bold text-slate-900 pt-2">Recent operator actions</h4>
            {orgAudit.map(l => (
              <div key={l.id} className="text-[11px] text-slate-600"><strong>{l.action}</strong> — {l.reason}</div>
            ))}
            {orgAudit.length === 0 && <p className="text-slate-400">No operator actions yet.</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header — sole Platform Administrator */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">11thONUS Operator</span>
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Platform Administrator (sole launch administrator)
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1">Launch Operations & Commercial Management</h1>
          <p className="text-xs text-slate-400">Human operational control surface. Businesses own programmes, items and frontline operations — the Administrator handles platform, governed exceptions and manual commercial transitions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Status: Healthy</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
        {NAV.map(nav => {
          const Icon = nav.icon;
          const isActive = activeNav === nav.id;
          const badge =
            nav.id === 'integrity' ? openIntegrity.length
            : nav.id === 'support' ? openSupport.length
            : nav.id === 'businesses' ? organisations.length : 0;
          return (
            <button key={nav.id} onClick={() => setActiveNav(nav.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              <Icon className="w-3.5 h-3.5" /><span>{nav.label}</span>
              {badge > 0 && <span className="px-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{badge}</span>}
            </button>
          );
        })}
      </div>

      {activeNav === 'operations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4"><span className="text-xs text-slate-500 font-semibold">Businesses onboarding</span><div className="text-2xl font-extrabold">{onboardingQueue.length}</div><span className="text-[11px] text-slate-400">Need activation support</span></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><span className="text-xs text-slate-500 font-semibold">Commercial attention</span><div className="text-2xl font-extrabold text-amber-700">{trialLow.length + trialExhausted.length + zeroCredit.length + restricted.length}</div><span className="text-[11px] text-slate-400">Trial / credit / restricted</span></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><span className="text-xs text-slate-500 font-semibold">Open support</span><div className="text-2xl font-extrabold">{openSupport.length}</div><span className="text-[11px] text-slate-400">{urgentSupport.length} urgent</span></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4"><span className="text-xs text-slate-500 font-semibold">Open integrity</span><div className="text-2xl font-extrabold">{openIntegrity.length}</div><span className="text-[11px] text-slate-400">Flagged for review</span></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Business onboarding ({onboardingQueue.length})</h2>
              {onboardingQueue.map(o => (
                <div key={o.id} className="p-3 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                  <div><div className="font-bold">{o.name}</div><div className="text-slate-500">{o.onboardingState?.replace('_', ' ')} • trial {o.trialCirclesRemaining} • contact {o.primaryContact}</div></div>
                  <button onClick={() => openBusiness(o.id)} className="font-bold text-blue-700 hover:underline">Open 360° →</button>
                </div>
              ))}
              {onboardingQueue.length === 0 && <p className="text-xs text-slate-400">No businesses awaiting onboarding.</p>}
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pt-2">Commercial queues</h2>
              {[
                { label: 'Trial nearing exhaustion — 1 unit remaining', items: trialLow },
                { label: 'Trial exhausted / awaiting paid activation', items: trialExhausted },
                { label: 'Low credit (<$5, no trial)', items: lowCredit },
                { label: 'Zero credit (new starts blocked)', items: zeroCredit },
                { label: 'Commercially restricted', items: restricted },
                { label: 'Grace state (finish active circles)', items: grace }
              ].map(group => (
                <div key={group.label} className="text-xs">
                  <span className="font-semibold text-slate-700">{group.label} ({group.items.length})</span>
                  {group.items.map(o => (
                    <div key={o.id} className="mt-1 p-2 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between">
                      <span className="font-bold">{o.name} <span className="font-normal text-slate-500">• trial {o.trialCirclesRemaining} • ${o.creditBalanceUSD.toFixed(2)}</span></span>
                      <button onClick={() => openBusiness(o.id)} className="font-bold text-amber-800 hover:underline">Review →</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
                <div className="flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Support queue ({openSupport.length})</h2><button onClick={() => setActiveNav('support')} className="text-xs font-semibold text-blue-700 hover:underline">Manage all →</button></div>
                {openSupport.slice(0, 4).map(c => (
                  <div key={c.id} className="p-3 rounded-lg border border-slate-100 text-xs">
                    <div className="font-bold">{c.caseNumber} • {c.title}</div>
                    <div className="text-slate-500">{c.linkedOrgName ?? c.requesterName} • {c.priority} • {c.status}</div>
                  </div>
                ))}
                {openSupport.length === 0 && <p className="text-xs text-slate-400">No open support cases.</p>}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
                <div className="flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Integrity queue ({openIntegrity.length})</h2><button onClick={() => setActiveNav('integrity')} className="text-xs font-semibold text-amber-700 hover:underline">Manage all →</button></div>
                {openIntegrity.slice(0, 4).map(c => (
                  <div key={c.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-xs">
                    <div className="font-bold">{c.caseNumber} • {c.orgName}</div>
                    <div className="text-slate-600">{c.reason}</div>
                  </div>
                ))}
                {openIntegrity.length === 0 && <p className="text-xs text-slate-400">Zero flags.</p>}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Platform status</h2>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Transactions operational</div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Reward engine deterministic</div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold">{markets.filter(m => m.status === 'active').length} active markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeNav === 'businesses' && (
        <div className="space-y-4">
          {selectedOrg ? renderBusiness360(selectedOrg) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div><h2 className="text-base font-bold">Business directory ({filteredOrgs.length})</h2><p className="text-xs text-slate-500">Main operational workspace. Account status, commercial standing and onboarding are shown distinctly.</p></div>
                <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search business, city, contact…" className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs w-64" /></div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredOrgs.map(org => (
                  <div key={org.id} onClick={() => setSelectedOrgId(org.id)} className="py-3 px-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center">{org.logoText}</div>
                      <div><div className="font-bold">{org.name}</div><div className="text-[11px] text-slate-500">{org.category} • {org.city}, {org.country} • trial {org.trialCirclesRemaining} • ${org.creditBalanceUSD.toFixed(2)}</div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(org.status)}>{org.status}</Badge>
                      <Badge tone={standingTone(org.commercialStanding)}>{(org.commercialStanding ?? 'trial').replace('_', ' ')}</Badge>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeNav === 'commercial' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-bold">Commercial operations (launch — manual)</h2>
            <p className="text-xs text-slate-500">No payment automation. The Administrator manually performs trial, activation and credit transitions. Flat $1 unit • consumption-first • no tiers • trial units • grace finishes active circles • zero blocks new Circle starts • earned rewards stay redeemable and are never cancelled • history intact. Commercial standing never blocks reward redemption.</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {organisations.map(o => (
                <button key={o.id} onClick={() => setSelectedOrgId(o.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${selectedOrgId === o.id ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{o.name}</button>
              ))}
            </div>
          </div>
          {selectedOrg ? renderCommercialPanel(selectedOrg) : <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-500">Select a Business above to manage trial, paid activation, credit and restriction.</div>}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Commercial history ({commercialAudit.length})</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {commercialAudit.map(l => (
                <div key={l.id} className="text-xs text-slate-700 border-b border-slate-100 pb-1.5">
                  <strong>{l.action}</strong> • {auditLogs && ''}{organisations.find(o => o.id === l.targetId)?.name ?? l.targetId} — {l.reason}
                  <span className="block text-[11px] text-slate-400">{l.actorName} • {new Date(l.timestamp).toLocaleString()}{l.previousState ? ` • ${l.previousState} → ${l.newState}` : ''}</span>
                </div>
              ))}
              {commercialAudit.length === 0 && <p className="text-xs text-slate-400">No commercial actions yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeNav === 'support' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div><h2 className="text-base font-bold">Support & exceptions</h2><p className="text-xs text-slate-500">Search Business/customer, investigate, progress status, resolve. No arbitrary loyalty-history mutation from a case.</p></div>
            <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" /><input value={supportQuery} onChange={e => setSupportQuery(e.target.value)} placeholder="Search cases…" className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs w-64" /></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {filteredSupport.map(c => (
                <div key={c.id} onClick={() => setSelectedSupportId(c.id)} className={`p-4 rounded-xl border text-xs cursor-pointer ${selectedSupportId === c.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold">{c.caseNumber}</span>
                    <Badge tone="bg-slate-100 text-slate-700 border border-slate-200">{c.category.replace('_', ' ')}</Badge>
                    <Badge tone={c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}>{c.status}</Badge>
                    {c.priority === 'high' && <Badge tone="bg-red-50 text-red-700 border border-red-200">urgent</Badge>}
                  </div>
                  <h3 className="font-bold mt-1">{c.title}</h3>
                  <p className="text-slate-600">{c.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Requester: {c.requesterName} • Linked: {c.linkedOrgName ?? '—'}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-3 h-fit">
              {!selectedSupport ? <p className="text-slate-500">Select a case to investigate and resolve.</p> : (
                <>
                  <h3 className="font-bold text-sm">{selectedSupport.caseNumber} — {selectedSupport.title}</h3>
                  {selectedSupport.investigationNotes && <div className="p-2.5 bg-white rounded-lg border text-[11px]"><strong>Investigation trail:</strong> {selectedSupport.investigationNotes}</div>}
                  {selectedSupport.resolutionNotes && <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px]"><strong>Resolution:</strong> {selectedSupport.resolutionNotes}</div>}
                  {selectedSupport.linkedOrgId && <button onClick={() => openBusiness(selectedSupport.linkedOrgId!)} className="px-3 py-2 rounded-lg bg-slate-900 text-white font-bold">Open linked Business 360° →</button>}
                  <textarea value={caseNotes} onChange={e => setCaseNotes(e.target.value)} placeholder="Investigation note / resolution…" rows={3} className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { updateSupportCase(selectedSupport.id, 'investigating', caseNotes || 'Under investigation.'); setCaseNotes(''); }} className="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold">Mark investigating</button>
                    <button onClick={() => { updateSupportCase(selectedSupport.id, 'resolved', caseNotes || 'Resolved with requester.'); setCaseNotes(''); }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">Resolve case</button>
                  </div>
                  <p className="text-[11px] text-slate-500">Governed corrections (if any) stay in Business workflows — this console does not mutate loyalty history from a ticket.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeNav === 'integrity' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div><h2 className="text-base font-bold">Activity & integrity</h2><p className="text-xs text-slate-500">Review flagged patterns, record investigation, resolve/dismiss, or restrict where already supported. Objective language: “flagged for review”. No algorithmic scoring invented.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {integrityCases.map(c => (
                <div key={c.id} onClick={() => setSelectedIntegrityId(c.id)} className={`p-4 rounded-xl border text-xs cursor-pointer ${selectedIntegrityId === c.id ? 'border-amber-600 bg-amber-50/50' : c.status === 'resolved' || c.status === 'dismissed' ? 'bg-slate-50/60 border-slate-200' : 'bg-amber-50/40 border-amber-200'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold">{c.caseNumber}</span>
                    <Badge tone="bg-amber-200 text-amber-900">{c.flagType.replace('_', ' ')}</Badge>
                    <Badge tone={c.status === 'resolved' || c.status === 'dismissed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>{c.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="font-semibold mt-1">{c.reason}</p>
                  <p className="text-[11px] text-slate-600">Evidence: {c.evidence}</p>
                  <p className="text-[11px] text-slate-500">Org: {c.orgName}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-3 h-fit">
              {!selectedIntegrity ? <p className="text-slate-500">Select a case to review.</p> : (
                <>
                  <h3 className="font-bold text-sm">{selectedIntegrity.caseNumber} — {selectedIntegrity.orgName}</h3>
                  {selectedIntegrity.investigationNotes && <div className="p-2.5 bg-white rounded-lg border text-[11px]"><strong>Investigation:</strong> {selectedIntegrity.investigationNotes}</div>}
                  {selectedIntegrity.resolutionNotes && <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px]"><strong>Outcome:</strong> {selectedIntegrity.resolutionNotes}</div>}
                  <button onClick={() => openBusiness(selectedIntegrity.orgId)} className="px-3 py-2 rounded-lg bg-slate-900 text-white font-bold">Open Business 360° →</button>
                  <textarea value={caseNotes} onChange={e => setCaseNotes(e.target.value)} placeholder="Investigation note / outcome…" rows={3} className="w-full p-2 rounded-lg border border-slate-200 text-xs" />
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { updateIntegrityCase(selectedIntegrity.id, 'under_review', caseNotes || 'Under review.'); setCaseNotes(''); }} className="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold">Mark under review</button>
                    <button onClick={() => { updateIntegrityCase(selectedIntegrity.id, 'resolved', caseNotes || 'Verified legitimate activity with business management.'); setCaseNotes(''); }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">Resolve</button>
                    <button onClick={() => { updateIntegrityCase(selectedIntegrity.id, 'dismissed', caseNotes || 'Dismissed after review — no violation.'); setCaseNotes(''); }} className="px-3 py-2 rounded-lg border border-slate-300 font-bold">Dismiss</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeNav === 'platform' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div><h2 className="text-base font-bold">Platform readiness</h2><p className="text-xs text-slate-500">Markets, currencies and product-level health. No backend/provider internals exposed. English is the primary customer-facing language; French is optional/deferred — no French UI is implemented in this prototype.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {markets.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between"><span className="font-bold text-sm">{m.country}</span><Badge tone={m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}>{m.status}</Badge></div>
                <div>Currency: <strong>{m.currency}</strong> ({m.code})</div>
                <div>Configured default language: <strong>{m.defaultLanguage.toUpperCase()}</strong> <span className="text-slate-400">(market configuration — not implemented localisation)</span></div>
                <div>Active businesses: <strong>{m.activeBusinessesCount}</strong></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100"><span className="text-slate-500 block">Transaction pipeline</span><span className="text-emerald-700 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Operational</span></div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100"><span className="text-slate-500 block">Reward generation (10+1)</span><span className="text-emerald-700 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Deterministic</span></div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100"><span className="text-slate-500 block">Commercial rules in force</span><span className="font-semibold text-slate-800">$1 / circle • grace finishes circles • zero blocks starts</span></div>
          </div>
        </div>
      )}

      {activeNav === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div><h2 className="text-base font-bold">Audit trail</h2><p className="text-xs text-slate-500">Who changed what, when, and why. Internal event IDs are hidden.</p></div>
            <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" /><input value={auditQuery} onChange={e => setAuditQuery(e.target.value)} placeholder="Search action, actor, reason…" className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs w-64" /></div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredAudit.map(l => (
              <div key={l.id} className="py-3 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">{l.action}</span>
                    <span className="text-slate-600">Actor: <strong>{l.actorName}</strong> ({l.actorRole})</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(l.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-700">{l.reason}</p>
                {l.previousState && <div className="text-[11px] text-slate-500 font-mono">Change: {l.previousState} → {l.newState}</div>}
              </div>
            ))}
            {filteredAudit.length === 0 && <p className="text-xs text-slate-400">No audit records match.</p>}
          </div>
        </div>
      )}

      {/* Prototype review controls — kept separate from the real console */}
      <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-700" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Prototype review controls (not part of the Operator Console)</h2>
        </div>
        <p className="text-[11px] text-amber-900">Deterministic manual-commercial scenarios. Additional administrator roles and permissions are deferred.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'A' as const, label: 'A — New Business awaiting trial (Kivu)' },
            { id: 'B' as const, label: 'B — Trial nearing exhaustion (Joe’s)' },
            { id: 'C' as const, label: 'C — Offline payment → manual activation (Joe’s)' },
            { id: 'D' as const, label: 'D — Add commercial credit (Sparkle)' },
            { id: 'E' as const, label: 'E — Zero credit / restricted (Sparkle)' },
            { id: 'F' as const, label: 'F — Support case → Business 360°' }
          ].map(s => (
            <button key={s.id} onClick={() => { applyOperatorScenario(s.id); if (s.id === 'F') { setSelectedSupportId('sup-106'); setActiveNav('support'); } else { setActiveNav('commercial'); } }} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">{s.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
