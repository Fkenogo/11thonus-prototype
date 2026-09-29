import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Search,
  CheckCircle2,
  Gift,
  Plus,
  Minus,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  User,
  History,
  X,
  Camera,
  FlaskConical
} from 'lucide-react';
import { LoyaltyCircle } from '../common/LoyaltyCircle';
import { REDEMPTION_COPY } from '../../data/redemptionCopy';

type RedemptionScenarioId =
  | 'authorised'
  | 'staff-blocked'
  | 'manager-revoked'
  | 'participant-ready'
  | 'after-redemption'
  | 'already-redeemed';

const REDEMPTION_SCENARIOS: { id: RedemptionScenarioId; label: string }[] = [
  { id: 'authorised', label: '1 · Authorised confirm' },
  { id: 'staff-blocked', label: '2 · Staff not authorised' },
  { id: 'manager-revoked', label: '3 · Manager revoked' },
  { id: 'participant-ready', label: '4 · Participant ready' },
  { id: 'after-redemption', label: '5 · After redemption' },
  { id: 'already-redeemed', label: '6 · Already redeemed' }
];

export const StaffCounterExperience: React.FC = () => {
  const {
    currentUser,
    currentOrg,
    programmes,
    users,
    relationships,
    transactions,
    completedRewards,
    recordQualifyingPurchase,
    redeemReward,
    registerWalkInCustomer,
    hasRedemptionAuthority,
    applyRedemptionScenario
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('user-amina-participant'); // Default Amina for instant demo
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('prog-bella-premium');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeScenario, setActiveScenario] = useState<RedemptionScenarioId | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    type: 'purchase' | 'redemption' | 'pending' | 'blocked' | 'already';
    message: string;
    details?: string;
  } | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<{
    customerName: string;
    firstName: string;
    rewardTitle: string;
    confirmerName: string;
    nextCycle: number;
  } | null>(null);

  // Filter programmes for current org
  const activeProgrammes = programmes.filter(
    p => p.orgId === currentOrg.id && (p.status === 'active' || p.status === 'draft')
  );

  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [allowPurchaseOverride, setAllowPurchaseOverride] = useState(false);

  // Available participants
  const participants = users.filter(u => u.role === 'participant');
  const filteredParticipants = participants.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.onusId && p.onusId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCustomer = users.find(u => u.id === selectedCustomerId);
  const selectedProgramme = programmes.find(p => p.id === selectedProgrammeId) || activeProgrammes[0];

  // Relationship of this customer with this programme at this business
  const customerRelationship = relationships.find(
    r => r.customerId === selectedCustomerId && r.programmeId === selectedProgramme?.id
  );

  // Check if reward is available
  const hasRewardAvailable = customerRelationship?.rewardAvailable ?? false;
  const currentApprovedSteps = customerRelationship?.approvedSteps ?? 0;
  const currentPendingSteps = customerRelationship?.pendingSteps ?? 0;
  const currentCycle = customerRelationship?.currentCycle ?? 1;

  // Permission-based authority (never title-based): the screen always
  // reflects the viewer's *current* grant, including mid-session revocation.
  const authority = hasRedemptionAuthority(currentUser.id);
  const copy = REDEMPTION_COPY.en;

  const firstName = selectedCustomer?.name.split(' ')[0] ?? 'Customer';
  const rewardTitle = selectedProgramme
    ? `11th ${selectedProgramme.qualifyingItemName}`
    : '11th reward';

  // Latest redeemed reward for this customer + programme (continuity + double-action guard).
  const latestRedeemed = completedRewards
    .filter(r => r.customerId === selectedCustomerId && r.programmeId === selectedProgramme?.id && r.status === 'redeemed')
    .sort((a, b) => (b.redeemedAt ?? '').localeCompare(a.redeemedAt ?? ''))[0];
  // Fresh-cycle continuity strip: the new 0/10 cycle stays actionable; the
  // strip records that the previous reward was already redeemed (and by whom).
  const showRedeemedStrip =
    !hasRewardAvailable && !redemptionSuccess && (customerRelationship?.totalRedeemedRewards ?? 0) > 0 && currentApprovedSteps === 0;

  // Recent transactions at this counter
  const todayTransactions = transactions
    .filter(t => t.orgId === currentOrg.id)
    .slice(0, 5);

  const handleRecord = () => {
    if (!selectedProgramme || !selectedCustomer) return;
    setIsSubmitting(true);
    setLastActionResult(null);

    setTimeout(() => {
      const result = recordQualifyingPurchase({
        programmeId: selectedProgramme.id,
        customerId: selectedCustomer.id,
        quantity,
        notes: notes || undefined
      });

      if (result.rewardUnlocked) {
        setLastActionResult({
          type: 'purchase',
          message: `Circle Completed! 11th ${selectedProgramme.qualifyingItemName} is on ${currentOrg.name}!`,
          details: `${selectedCustomer.name} has completed 10 qualifying visits.`
        });
      } else if (result.requiresApproval) {
        setLastActionResult({
          type: 'pending',
          message: `Submitted for Manager Approval (${quantity} units)`,
          details: 'Quantity exceeds immediate staff threshold. Waiting in Approval Centre.'
        });
      } else {
        setLastActionResult({
          type: 'purchase',
          message: `Recorded ${quantity} qualifying purchase(s)!`,
          details: `${selectedCustomer.name} now has ${currentApprovedSteps + quantity} of 10.`
        });
      }

      setQuantity(1);
      setNotes('');
      setIsSubmitting(false);
    }, 250);
  };

  const handleRedeem = () => {
    if (!selectedProgramme || !selectedCustomer) return;
    setIsSubmitting(true);
    setLastActionResult(null);

    setTimeout(() => {
      const res = redeemReward({
        programmeId: selectedProgramme.id,
        customerId: selectedCustomer.id
      });

      if (res.success) {
        setRedemptionSuccess({
          customerName: selectedCustomer.name,
          firstName: selectedCustomer.name.split(' ')[0],
          rewardTitle: `11th ${selectedProgramme.qualifyingItemName}`,
          confirmerName: currentUser.name,
          nextCycle: currentCycle + 1
        });
        setLastActionResult(null);
        setShowConfirmSheet(false);
      } else if (res.reason === 'already_redeemed') {
        setLastActionResult({
          type: 'already',
          message: copy.alreadyRedeemed,
          details: latestRedeemed?.redeemedByStaffName
            ? `Confirmed by ${latestRedeemed.redeemedByStaffName}. No second redemption was created.`
            : 'No second redemption was created.'
        });
        setShowConfirmSheet(false);
      } else if (res.reason === 'revoked' || res.reason === 'suspended') {
        setLastActionResult({
          type: 'blocked',
          message: res.reason === 'suspended'
            ? 'This account is suspended and cannot confirm rewards.'
            : copy.authorityRevoked,
          details: 'The screen reflects your current authority — a stale screen cannot redeem.'
        });
        setShowConfirmSheet(false);
      } else if (res.reason === 'unauthorised') {
        setLastActionResult({
          type: 'blocked',
          message: copy.needsAuthorisedMember,
          details: 'Reward status stays visible so you can serve the customer while you fetch help.'
        });
        setShowConfirmSheet(false);
      } else {
        setLastActionResult({
          type: 'blocked',
          message: res.message,
          details: undefined
        });
        setShowConfirmSheet(false);
      }

      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Frontline Counter Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Frontline Counter Terminal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Station: {currentOrg.name} Front Desk
            </span>
          </div>
          <h1 className="text-xl font-display font-bold text-slate-900 mt-1">
            Fast Service & Customer Recognition
          </h1>
          <p className="text-xs text-slate-500">
            Frontline staff: <span className="font-semibold text-slate-700">{currentUser.name}</span> • Scan or search to record purchases in seconds.
          </p>
        </div>

        {/* Big QR Scan Trigger */}
        <button
          onClick={() => setShowQrScannerModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition active:scale-98"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Scan Customer QR</span>
        </button>
      </div>

      {/* Prototype-only redemption scenario selector (review tooling, not product UI) */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 px-3 py-2 shadow-xs">
        <button
          onClick={() => setShowScenarios(v => !v)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 min-h-[36px]"
        >
          <span className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
            <span>Review scenarios (prototype only){activeScenario ? ` · ${REDEMPTION_SCENARIOS.find(s => s.id === activeScenario)?.label}` : ''}</span>
          </span>
          <span className="text-slate-400">{showScenarios ? '▾' : '▸'}</span>
        </button>
        {showScenarios && (
          <div className="flex flex-wrap gap-1.5 pb-1.5">
            {REDEMPTION_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveScenario(s.id);
                  setRedemptionSuccess(null);
                  setLastActionResult(null);
                  setShowConfirmSheet(false);
                  applyRedemptionScenario(s.id);
                }}
                className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-[11px] font-semibold border transition ${
                  activeScenario === s.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Counter Interaction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Customer Identification & Selector */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Identify Customer
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Scan the customer's 11thONUS code or search — identity lookup only.
            </p>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone or ONUS ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* Quick participant list pills */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredParticipants.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs text-slate-500">
                    No customer matches "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    New here? Registration is secondary — only for genuine walk-ins.
                  </p>
                  <button
                    onClick={() => {
                      setNewCustomerName(searchQuery);
                      setShowQuickAddModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register walk-in (secondary)</span>
                  </button>
                </div>
              ) : (
                filteredParticipants.map(participant => {
                  const isSelected = participant.id === selectedCustomerId;
                  const rel = relationships.find(
                    r => r.customerId === participant.id && r.orgId === currentOrg.id
                  );
                  const hasRew = rel?.rewardAvailable;
                  return (
                    <button
                      key={participant.id}
                      onClick={() => {
                        setSelectedCustomerId(participant.id);
                        setLastActionResult(null);
                        setRedemptionSuccess(null);
                        setShowConfirmSheet(false);
                        setAllowPurchaseOverride(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition border flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {participant.initials}
                        </div>
                        <div>
                          <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                            <span>{participant.name}</span>
                            {hasRew && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-200 text-amber-950 uppercase">
                                11th Ready
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            {participant.phone} • {participant.onusId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rel && (
                          <span className="text-[11px] font-bold text-slate-600">
                            {hasRew ? '🎁' : `${rel.approvedSteps}/10`}
                          </span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Programme Selector for this business */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Select Programme
            </label>

            <div className="space-y-1.5">
              {activeProgrammes.map(prog => {
                const isSelected = prog.id === selectedProgramme?.id;
                return (
                  <button
                    key={prog.id}
                    onClick={() => {
                      setSelectedProgrammeId(prog.id);
                      setLastActionResult(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{prog.name}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? 'text-amber-100' : 'text-slate-400'
                        }`}
                      >
                        {prog.sellingPrice.toLocaleString()} {prog.currency} • 10 to 11th On Us
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Customer Circle, Purchase Stepper & Reward Action */}
        <div className="md:col-span-7 space-y-4">
          {selectedCustomer && selectedProgramme ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              {/* Customer Profile Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                    {selectedCustomer.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-900">
                        {selectedCustomer.name}
                      </h2>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                        {selectedCustomer.onusId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Member at {currentOrg.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500">Cycle</span>
                  <div className="text-base font-extrabold text-slate-900 leading-none">
                    #{currentCycle}
                  </div>
                </div>
              </div>

              {/* Action Result / Feedback Banner */}
              {lastActionResult && (
                <div
                  className={`mt-4 p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                    lastActionResult.type === 'redemption'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : lastActionResult.type === 'pending'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : lastActionResult.type === 'blocked' || lastActionResult.type === 'already'
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  {lastActionResult.type === 'blocked' || lastActionResult.type === 'already' ? (
                    <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">{lastActionResult.message}</span>
                    {lastActionResult.details && (
                      <span className="text-slate-600 mt-0.5 block">
                        {lastActionResult.details}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Loyalty Circle Progression */}
              <div className="my-5 flex flex-col items-center justify-center p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <LoyaltyCircle
                  approvedSteps={currentApprovedSteps}
                  pendingSteps={currentPendingSteps}
                  rewardAvailable={hasRewardAvailable}
                  size="md"
                  cycleNumber={currentCycle}
                  qualifyingItemName={selectedProgramme.qualifyingItemName}
                  businessName={currentOrg.name}
                />
              </div>

              {/* STEP C — REWARD READY: dominant human state, identity-resolved */}
              {redemptionSuccess ? (
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{copy.successTitle}</h3>
                  <p className="text-sm text-emerald-50">
                    {redemptionSuccess.firstName}'s {redemptionSuccess.rewardTitle} was provided — confirmed by {redemptionSuccess.confirmerName}.
                  </p>
                  <div className="p-3 rounded-lg bg-white/15 border border-white/20 text-xs font-semibold">
                    {redemptionSuccess.firstName} can start earning toward the next reward now.
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold bg-black/15 rounded-lg py-2">
                    <span>New earning cycle started</span>
                    <span className="px-2 py-0.5 rounded bg-white/25 font-mono">0 / 10</span>
                  </div>
                  <button
                    onClick={() => {
                      setRedemptionSuccess(null);
                      setSelectedCustomerId(selectedCustomer.id);
                    }}
                    className="w-full py-3 min-h-[48px] bg-white hover:bg-emerald-50 text-emerald-900 text-sm font-bold rounded-lg shadow-sm transition active:scale-[0.98]"
                  >
                    Serve next customer
                  </button>
                </div>
              ) : hasRewardAvailable && !allowPurchaseOverride ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-200 animate-pulse" />
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Reward ready
                    </span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug">
                    {firstName}'s {rewardTitle} is ready.
                  </h3>
                  <p className="text-xs text-amber-100">
                    {selectedCustomer.name} completed 10 qualifying visits. The {selectedProgramme.qualifyingItemName} being provided is on {currentOrg.name}.
                  </p>

                  {authority.authorised ? (
                    <button
                      onClick={() => setShowConfirmSheet(true)}
                      disabled={isSubmitting}
                      className="w-full py-3.5 min-h-[52px] bg-white hover:bg-slate-50 text-amber-900 text-base font-bold rounded-lg shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      <span>{copy.confirmAction}</span>
                    </button>
                  ) : authority.status === 'revoked' || authority.status === 'suspended' ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-3.5 min-h-[52px] bg-white/40 text-white text-base font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <ShieldAlert className="w-5 h-5" />
                        <span>{copy.confirmAction}</span>
                      </button>
                      <p className="text-xs font-semibold bg-black/20 rounded-lg p-2.5">
                        {authority.status === 'suspended'
                          ? 'This account is suspended and cannot confirm rewards.'
                          : copy.authorityRevoked}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-3.5 min-h-[52px] bg-white/40 text-white text-base font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <ShieldAlert className="w-5 h-5" />
                        <span>{copy.confirmAction}</span>
                      </button>
                      <p className="text-xs font-semibold bg-black/20 rounded-lg p-2.5">
                        {copy.needsAuthorisedMember}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
                    <span className="text-amber-200">Customer paying for another visit today?</span>
                    <button
                      onClick={() => setAllowPurchaseOverride(true)}
                      className="underline font-semibold text-white hover:text-amber-100 min-h-[32px] px-1"
                    >
                      Record purchase instead
                    </button>
                  </div>
                </div>
              ) : (
                /* NORMAL ACTION: Record Qualifying Purchase */
                <div className="space-y-4 pt-2">
                  {showRedeemedStrip && (
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>
                        <span className="font-bold">{copy.alreadyRedeemed}</span>{' '}
                        {latestRedeemed?.redeemedByStaffName ? `Confirmed by ${latestRedeemed.redeemedByStaffName}. ` : ''}
                        New earning cycle in progress — record visits normally.
                      </span>
                    </div>
                  )}
                  {hasRewardAvailable && allowPurchaseOverride && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between">
                      <span className="font-medium">
                        Reward is ready, recording purchase as requested.
                      </span>
                      <button
                        onClick={() => setAllowPurchaseOverride(false)}
                        className="text-[11px] font-bold underline text-amber-800"
                      >
                        Back to Redeem
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Quantity of Qualifying Purchases
                    </label>

                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-8 text-center text-sm font-extrabold text-slate-900">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(
                              selectedProgramme.rules.maxUnitsPerTx || 3,
                              quantity + 1
                            )
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-700" />
                      </button>
                    </div>
                  </div>

                  {quantity > (selectedProgramme.rules.requireApprovalAbove || 2) && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Note: Recording {quantity} units exceeds immediate staff limit ({selectedProgramme.rules.requireApprovalAbove}). It will be held for manager approval before applying permanently.
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleRecord}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-amber-600/20 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>
                      Record {quantity} {selectedProgramme.qualifyingItemName}
                      {quantity > 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] text-slate-400">
                      Step will count towards {selectedProgramme.name} • Recognition in seconds
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Select a customer to view their loyalty circle.
            </div>
          )}
        </div>
      </div>

      {/* Today's Counter Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Today's Counter Activity ({todayTransactions.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Real-time local timeline</span>
        </div>

        <div className="divide-y divide-slate-100">
          {todayTransactions.map(tx => (
            <div
              key={tx.id}
              className="py-2.5 flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'reward_redemption'
                      ? 'bg-emerald-100 text-emerald-700'
                      : tx.status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tx.type === 'reward_redemption' ? (
                    <Gift className="w-3.5 h-3.5" />
                  ) : tx.status === 'pending_approval' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-900 truncate">
                    {tx.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {tx.type === 'reward_redemption'
                      ? 'Redeemed 11th Reward'
                      : `${tx.quantity} unit(s) recorded`}{' '}
                    • By {tx.staffName}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    tx.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {tx.status === 'approved' ? 'Approved' : 'Pending Approval'}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(tx.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP D — Explicit confirmation sheet (no customer PIN/OTP/approval) */}
      {showConfirmSheet && selectedCustomer && selectedProgramme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{copy.confirmSheetTitle}</h3>
              <p className="text-xs text-slate-500">
                Confirm the Business has provided the reward. No customer tap is needed.
              </p>
            </div>

            <dl className="text-xs divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              <div className="flex justify-between px-3 py-2 bg-slate-50/60">
                <dt className="text-slate-500">Customer</dt>
                <dd className="font-bold text-slate-900">{selectedCustomer.name}</dd>
              </div>
              <div className="flex justify-between px-3 py-2">
                <dt className="text-slate-500">Reward</dt>
                <dd className="font-bold text-slate-900 text-right">{rewardTitle} · {currentOrg.name}</dd>
              </div>
              <div className="flex justify-between px-3 py-2 bg-slate-50/60">
                <dt className="text-slate-500">Confirmed by</dt>
                <dd className="font-bold text-slate-900">{currentUser.name} (you)</dd>
              </div>
            </dl>

            <div className="space-y-2">
              <button
                onClick={handleRedeem}
                disabled={isSubmitting}
                className="w-full py-3.5 min-h-[52px] bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-base font-bold rounded-xl shadow-sm transition active:scale-[0.98]"
              >
                {isSubmitting ? 'Confirming…' : copy.confirmAction}
              </button>
              <button
                onClick={() => setShowConfirmSheet(false)}
                disabled={isSubmitting}
                className="w-full py-3 min-h-[48px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated QR Code Camera Scanner Modal */}
      {showQrScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Scan 11thONUS Member QR
                </h3>
              </div>
              <button
                onClick={() => setShowQrScannerModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="w-48 h-48 border-2 border-amber-400/80 rounded-xl relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-amber-400 absolute animate-bounce" />
                <QrCode className="w-24 h-24 text-white/30" />
              </div>
              <p className="text-white/80 text-xs mt-3">
                Align the customer's 11thONUS code — identity lookup only. Reward availability is resolved by the platform, not the code.
              </p>
            </div>

            {/* Quick Simulate Scan Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Simulate identity lookup:
              </span>
              <button
                onClick={() => {
                  setSelectedCustomerId('user-amina-participant');
                  setRedemptionSuccess(null);
                  setLastActionResult(null);
                  setShowQrScannerModal(false);
                }}
                className="w-full py-2 px-3 min-h-[44px] rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold text-left flex items-center justify-between border border-amber-200"
              >
                <span>Amina Niyonsaba (ONUS-8821-AMINA)</span>
                <span className="text-[10px] text-amber-700 font-bold">
                  {relationships.find(r => r.customerId === 'user-amina-participant' && r.orgId === currentOrg.id)?.rewardAvailable
                    ? 'Reward ready'
                    : `${relationships.find(r => r.customerId === 'user-amina-participant' && r.orgId === currentOrg.id)?.approvedSteps ?? '–'} of 10`}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedCustomerId('user-jeanluc-participant');
                  setShowQrScannerModal(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold text-left flex items-center justify-between border border-slate-200"
              >
                <span>Jean-Luc Tuyisenge (ONUS-5542-JEANL)</span>
                <span className="text-[10px] text-slate-500">6 of 10</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Walk-In Customer Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Register Walk-in Customer
                </h3>
              </div>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Register this customer to instantly start their 10-visit loyalty circle for {selectedProgramme?.name || 'this programme'}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marie Claire"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +257 79 123 456"
                  value={newCustomerPhone}
                  onChange={e => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newCustomerName.trim()}
                onClick={() => {
                  if (!selectedProgramme) return;
                  const newId = registerWalkInCustomer({
                    name: newCustomerName.trim(),
                    phone: newCustomerPhone.trim() || '+257 70 000 000',
                    programmeId: selectedProgramme.id
                  });
                  setSelectedCustomerId(newId);
                  setShowQuickAddModal(false);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                Create & Select Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
