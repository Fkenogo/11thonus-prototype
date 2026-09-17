import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Gift,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Bell,
  User,
  History,
  Store,
  Plus,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';
import { LoyaltyCircle } from '../common/LoyaltyCircle';

export const ParticipantExperience: React.FC = () => {
  const {
    currentUser,
    organisations,
    programmes,
    relationships,
    transactions,
    completedRewards,
    joinProgrammeAsParticipant
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'programmes' | 'activity' | 'profile'>('home');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Relationships of this participant across multiple businesses
  const myRelationships = relationships.filter(r => r.customerId === currentUser.id);

  // Separate reward available from regular progression
  const rewardAvailableRel = myRelationships.find(r => r.rewardAvailable);
  const closestToRewardRel = [...myRelationships]
    .filter(r => !r.rewardAvailable)
    .sort((a, b) => b.approvedSteps - a.approvedSteps)[0];

  // Transactions for this participant
  const myTransactions = transactions.filter(t => t.customerId === currentUser.id);

  // Notifications simulation
  const notifications = [
    ...(rewardAvailableRel ? [{
      id: 'notif-rew',
      title: '11th Reward Ready to Redeem!',
      desc: `Your reward is available at ${organisations.find(o => o.id === rewardAvailableRel.orgId)?.name}.`,
      time: 'Today',
      type: 'reward'
    }] : []),
    {
      id: 'notif-1',
      title: 'Visit recorded at Bella Salon',
      desc: 'Added 1 step to Premium Haircut & Styling.',
      time: 'Yesterday',
      type: 'step'
    }
  ];

  return (
    <div className="max-w-md mx-auto space-y-5 pb-16">
      {/* Mobile-Friendly App Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {currentUser.initials}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">11thONUS Member</div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {currentUser.name}
            </h1>
          </div>
        </div>

        {/* Permanent Primary Action: "Show My Code" */}
        <button
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition active:scale-95"
        >
          <QrCode className="w-3.5 h-3.5 text-amber-400" />
          <span>Show Code</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          {/* PRIORITY 1: REWARD AVAILABLE BANNER - EMOTIONAL PAYOFF (Section 8) */}
          {rewardAvailableRel && (
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/20 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-amber-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  Circle Completed!
                </span>
                <span className="text-xs font-mono font-bold bg-black/20 px-2.5 py-0.5 rounded">
                  {rewardAvailableRel.rewardCode || 'ONUS-FREE'}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold font-display leading-tight">
                  Your 11th {programmes.find(p => p.id === rewardAvailableRel.programmeId)?.qualifyingItemName || 'Visit'} is on {organisations.find(o => o.id === rewardAvailableRel.orgId)?.name}!
                </h2>
                <p className="text-xs text-amber-100 mt-1">
                  You completed 10 qualifying visits. Present your code at the counter to redeem your reward.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2 rounded-xl bg-white text-amber-950 font-bold text-xs shadow-sm hover:bg-slate-50 transition active:scale-98 flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Show Code to Redeem</span>
                </button>
                <span className="text-[11px] font-semibold text-amber-200">
                  Cycle #{rewardAvailableRel.currentCycle} Complete ✓
                </span>
              </div>
            </div>
          )}

          {/* PRIORITY 2: CLOSEST TO REWARD SHOWCASE */}
          {closestToRewardRel ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Closest Reward
                </span>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {10 - closestToRewardRel.approvedSteps} visits remaining
                </span>
              </div>

              {/* Loyalty Circle */}
              <div className="flex flex-col items-center py-2">
                <LoyaltyCircle
                  approvedSteps={closestToRewardRel.approvedSteps}
                  pendingSteps={closestToRewardRel.pendingSteps}
                  rewardAvailable={closestToRewardRel.rewardAvailable}
                  size="md"
                  cycleNumber={closestToRewardRel.currentCycle}
                  businessName={organisations.find(o => o.id === closestToRewardRel.orgId)?.name}
                  qualifyingItemName={programmes.find(p => p.id === closestToRewardRel.programmeId)?.qualifyingItemName}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    {organisations.find(o => o.id === closestToRewardRel.orgId)?.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {programmes.find(p => p.id === closestToRewardRel.programmeId)?.name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProgrammeId(closestToRewardRel.programmeId);
                    setActiveTab('programmes');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  View Details →
                </button>
              </div>
            </div>
          ) : !rewardAvailableRel ? (
            /* Helpful empty state when participant has no active circles */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Start Your First Loyalty Circle</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Show your 11thONUS code at participating businesses to start counting 10 visits towards your 11th on the house.
                </p>
              </div>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
              >
                Find Businesses
              </button>
            </div>
          ) : null}

          {/* PRIORITY 3: MY LOYALTY (Section 7 - Natural language) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                My Loyalty ({myRelationships.length})
              </h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Join Another</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {myRelationships.map(rel => {
                const org = organisations.find(o => o.id === rel.orgId);
                const prog = programmes.find(p => p.id === rel.programmeId);
                if (!org || !prog) return null;

                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedProgrammeId(prog.id);
                      setActiveTab('programmes');
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-800 font-display font-bold flex items-center justify-center text-xs shadow-2xs">
                        {org.logoText}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{org.name}</div>
                        <div className="text-[11px] text-slate-500">{prog.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rel.rewardAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          11th Ready
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-800">
                          {rel.approvedSteps} / 10
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRIORITY 4: RECENT ACTIVITY TIMELINE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Recognition Activity
            </h2>

            <div className="divide-y divide-slate-100">
              {myTransactions.slice(0, 4).map(tx => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {tx.type === 'reward_redemption'
                        ? '🎁 11th Reward Redeemed!'
                        : tx.status === 'pending_approval'
                        ? '⏳ Purchase Pending Approval'
                        : `✓ ${tx.quantity} visit recorded`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {organisations.find(o => o.id === tx.orgId)?.name} • {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    tx.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {tx.status === 'approved' ? 'Counted' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PROGRAMMES / DETAIL ================= */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              My Loyalty Circles
            </h2>
            <span className="text-xs text-slate-500">{myRelationships.length} programmes</span>
          </div>

          <div className="space-y-4">
            {myRelationships.map(rel => {
              const org = organisations.find(o => o.id === rel.orgId);
              const prog = programmes.find(p => p.id === rel.programmeId);
              if (!org || !prog) return null;

              return (
                <div key={rel.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {org.name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{prog.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cycle #{rel.currentCycle} • Normal price: {prog.sellingPrice.toLocaleString()} {prog.currency}
                      </p>
                    </div>

                    {rel.rewardAvailable && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Reward Unlocked
                      </span>
                    )}
                  </div>

                  {/* Loyalty Circle */}
                  <div className="flex justify-center py-2 bg-slate-50 rounded-xl">
                    <LoyaltyCircle
                      approvedSteps={rel.approvedSteps}
                      pendingSteps={rel.pendingSteps}
                      rewardAvailable={rel.rewardAvailable}
                      size="sm"
                      cycleNumber={rel.currentCycle}
                      businessName={org.name}
                      qualifyingItemName={prog.qualifyingItemName}
                    />
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-950">
                    <strong>Rule: </strong> Every qualifying {prog.qualifyingItemName} gives 1 step. 10 approved purchases earns your 11th on {org.name}.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ACTIVITY ================= */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Recognition Timeline
          </h2>

          <div className="divide-y divide-slate-100">
            {myTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    tx.type === 'reward_redemption'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tx.status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tx.type === 'reward_redemption' ? '🎁' : tx.status === 'pending_approval' ? '⏳' : '✓'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {tx.type === 'reward_redemption'
                        ? '11th Reward Redeemed'
                        : `${tx.quantity} Qualifying Purchase Recorded`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {organisations.find(o => o.id === tx.orgId)?.name} • Staff: {tx.staffName}
                    </div>
                    {tx.pendingReason && (
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        {tx.pendingReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    tx.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {tx.status === 'approved' ? 'Approved' : 'Pending Approval'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PROFILE & IDENTITY ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-sm">
              {currentUser.initials}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-2">{currentUser.name}</h2>
            <p className="text-xs font-mono text-slate-500">{currentUser.onusId}</p>
          </div>

          <div className="space-y-3 text-xs divide-y divide-slate-100">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-semibold text-slate-900">{currentUser.phone}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-slate-900">{currentUser.email}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Loyalty Identity</span>
              <span className="font-semibold text-emerald-700">Verified ✓</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Active Businesses</span>
              <span className="font-semibold text-slate-900">{myRelationships.length}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Your identity is private. Each business only sees your visits with them, never your activity elsewhere.
            </span>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-2 z-30">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {[
            { id: 'home', label: 'Home', icon: Store },
            { id: 'programmes', label: 'Circles', icon: Gift },
            { id: 'activity', label: 'Activity', icon: History },
            { id: 'profile', label: 'Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL: DIGITAL LOYALTY QR IDENTITY (Section 30) ================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">
                11thONUS Loyalty Identity
              </span>
              <h3 className="text-lg font-bold font-display text-slate-900">
                {currentUser.name}
              </h3>
              <p className="text-xs font-mono font-semibold text-slate-500">
                {currentUser.onusId}
              </p>
            </div>

            {/* Scannable QR Graphic Simulation */}
            <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl inline-block shadow-inner">
              <div className="w-48 h-48 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-3 relative">
                {/* SVG QR Code Simulation */}
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-white rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                          ? 'bg-slate-900'
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded bg-amber-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow">
                    11
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-tight">
              Present this code at any participating business counter to record your visit or claim rewards.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL: JOIN NEW PROGRAMME ================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Join a Loyalty Circle</h3>
              </div>
              <button onClick={() => setShowJoinModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <p className="text-slate-600">
              Join a participating business to begin counting 10 qualifying purchases towards your 11th on us.
            </p>

            {/* Quick Browse Available Active Programmes */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Available Businesses:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {programmes
                  .filter(p => p.status === 'active')
                  .map(prog => {
                    const org = organisations.find(o => o.id === prog.orgId);
                    const alreadyJoined = myRelationships.some(r => r.programmeId === prog.id);
                    return (
                      <div
                        key={prog.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {org?.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {prog.name}
                          </div>
                        </div>
                        {alreadyJoined ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Enrolled ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              joinProgrammeAsParticipant(prog.id);
                              setShowJoinModal(false);
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition shadow-2xs"
                          >
                            Join Circle
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                Or enter Business invite code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. BELLA-VIP"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                />
                <button
                  onClick={() => {
                    if (!joinCode.trim()) return;
                    const matched = programmes.find(
                      p => p.name.toLowerCase().includes(joinCode.toLowerCase()) || p.id.includes(joinCode.toLowerCase())
                    ) || programmes[0];
                    if (matched) {
                      joinProgrammeAsParticipant(matched.id);
                    }
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
