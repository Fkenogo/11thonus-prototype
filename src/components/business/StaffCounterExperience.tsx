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
  User,
  History,
  X,
  Camera
} from 'lucide-react';
import { LoyaltyCircle } from '../common/LoyaltyCircle';

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
    registerWalkInCustomer
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('user-amina-participant'); // Default Amina for instant demo
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('prog-bella-premium');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<{
    type: 'purchase' | 'redemption' | 'pending';
    message: string;
    details?: string;
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
        setLastActionResult({
          type: 'redemption',
          message: `Reward Redeemed Successfully!`,
          details: `11th ${selectedProgramme.qualifyingItemName} provided on ${currentOrg.name}. Cycle #${currentCycle + 1} has begun!`
        });
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

      {/* Main Counter Interaction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Customer Identification & Selector */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Identify Customer
            </label>

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
                  <button
                    onClick={() => {
                      setNewCustomerName(searchQuery);
                      setShowQuickAddModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Walk-in Customer</span>
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
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
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

              {/* IF REWARD AVAILABLE: Prominent 1-Click Redemption */}
              {hasRewardAvailable && !allowPurchaseOverride ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-200 animate-pulse" />
                      <span className="font-bold text-sm uppercase tracking-wide">
                        11th ON US Available!
                      </span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-semibold">
                      {customerRelationship?.rewardCode || 'ONUS-READY'}
                    </span>
                  </div>

                  <p className="text-xs text-amber-100">
                    {selectedCustomer.name} has completed 10 qualifying visits. This {selectedProgramme.qualifyingItemName} is on {currentOrg.name}.
                  </p>

                  <button
                    onClick={handleRedeem}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-amber-900 text-sm font-bold rounded-lg shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Redeem 11th Reward Now</span>
                  </button>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
                    <span className="text-amber-200">Customer paying for another visit today?</span>
                    <button
                      onClick={() => setAllowPurchaseOverride(true)}
                      className="underline font-semibold text-white hover:text-amber-100"
                    >
                      Record purchase instead
                    </button>
                  </div>
                </div>
              ) : (
                /* NORMAL ACTION: Record Qualifying Purchase */
                <div className="space-y-4 pt-2">
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
                Align customer's 11thONUS QR code in frame
              </p>
            </div>

            {/* Quick Simulate Scan Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Simulate Scan Identified Member:
              </span>
              <button
                onClick={() => {
                  setSelectedCustomerId('user-amina-participant');
                  setShowQrScannerModal(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold text-left flex items-center justify-between border border-amber-200"
              >
                <span>Amina Niyonsaba (ONUS-8821-AMINA)</span>
                <span className="text-[10px] text-amber-700 font-bold">8 of 10</span>
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
