import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Organisation,
  LoyaltyProgramme,
  ParticipantRelationship,
  Transaction,
  CompletedReward,
  ApprovalItem,
  IntegrityCase,
  SupportCase,
  CommercialRecord,
  AuditLogEntry,
  MarketConfig,
  AppLanguage,
  ProgrammeStatus,
  RedemptionAuthority
} from '../types';
import {
  INITIAL_ORGANISATIONS,
  INITIAL_PROGRAMMES,
  INITIAL_USERS,
  INITIAL_RELATIONSHIPS,
  INITIAL_TRANSACTIONS,
  INITIAL_COMPLETED_REWARDS,
  INITIAL_APPROVAL_ITEMS,
  INITIAL_INTEGRITY_CASES,
  INITIAL_SUPPORT_CASES,
  INITIAL_COMMERCIAL_RECORDS,
  INITIAL_AUDIT_LOG,
  INITIAL_MARKETS
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'celebrate';
}

interface AppContextType {
  currentUser: User;
  activeRole: UserRole;
  currentOrg: Organisation;
  language: AppLanguage;
  deviceView: 'desktop' | 'mobile_frame';
  toasts: ToastMessage[];
  
  // Collections
  organisations: Organisation[];
  programmes: LoyaltyProgramme[];
  users: User[];
  relationships: ParticipantRelationship[];
  transactions: Transaction[];
  completedRewards: CompletedReward[];
  approvalItems: ApprovalItem[];
  integrityCases: IntegrityCase[];
  supportCases: SupportCase[];
  commercialRecords: CommercialRecord[];
  auditLogs: AuditLogEntry[];
  markets: MarketConfig[];

  // Actions
  setLanguage: (lang: AppLanguage) => void;
  setDeviceView: (view: 'desktop' | 'mobile_frame') => void;
  switchRole: (role: UserRole, targetUserId?: string) => void;
  switchOrganisation: (orgId: string) => void;
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;

  // Business / Counter actions
  recordQualifyingPurchase: (params: {
    programmeId: string;
    customerId: string;
    quantity: number;
    notes?: string;
  }) => { success: boolean; requiresApproval: boolean; rewardUnlocked: boolean; message: string };
  
  redeemReward: (params: {
    rewardId?: string;
    programmeId: string;
    customerId: string;
  }) => { success: boolean; message: string; reason?: 'unauthorised' | 'revoked' | 'suspended' | 'already_redeemed' | 'no_reward' };

  hasRedemptionAuthority: (userId?: string) => { authorised: boolean; status: RedemptionAuthority | 'suspended' };
  setRedemptionAuthority: (userId: string, authority: RedemptionAuthority) => void;
  applyRedemptionScenario: (scenario: 'authorised' | 'staff-blocked' | 'manager-revoked' | 'participant-ready' | 'after-redemption' | 'already-redeemed') => void;

  /**
   * Experience Reference choice for Founder review (privacy question).
   * false (Option A, default): participant sees "Reward redeemed at {Business}"
   *   without the individual confirmer's name.
   * true (Option B): participant sees "Reward confirmed by {name}".
   * Business-side attribution is always visible. Prototype flag only — NOT policy.
   */
  participantSeesConfirmer: boolean;
  setParticipantSeesConfirmer: (show: boolean) => void;

  approvePendingItem: (approvalId: string) => void;
  rejectPendingItem: (approvalId: string, reason: string) => void;
  reverseTransaction: (txId: string, reason: string) => void;

  // Programme management
  createProgramme: (programme: Omit<LoyaltyProgramme, 'id' | 'orgId' | 'totalParticipants' | 'activeCycles' | 'completedRewardsCount' | 'createdAt'>) => string;
  updateProgrammeStatus: (programmeId: string, status: ProgrammeStatus) => void;
  
  // Org & Staff management
  createOrganisation: (orgData: Partial<Organisation>, initialProgrammeData?: any) => string;
  inviteStaffMember: (staffData: { name: string; email: string; phone: string; role: UserRole; title: string }) => void;
  toggleStaffStatus: (userId: string) => void;
  topUpCommercialBalance: (orgId: string, amountUSD: number) => void;
  registerWalkInCustomer: (params: { name: string; phone: string; programmeId: string }) => string;
  joinProgrammeAsParticipant: (programmeId: string) => void;

  // Operator actions
  resolveIntegrityCase: (caseId: string, notes: string) => void;
  resolveSupportCase: (caseId: string, notes: string) => void;
  toggleOrgStatus: (orgId: string, newStatus: Organisation['status'], reason: string) => void;

  // Launch operator commercial actions (prototype experience only — manual
  // transitions that payment automation may later perform; no payment gateway).
  grantTrial: (orgId: string, units: number, reason: string) => void;
  adjustTrial: (orgId: string, delta: number, reason: string) => void;
  activatePaidService: (orgId: string, reference: string, note?: string) => void;
  addCommercialCredit: (orgId: string, amountUSD: number, reference: string) => void;
  adjustCommercialCredit: (orgId: string, deltaUSD: number, reason: string) => void;
  restrictBusiness: (orgId: string, reason: string) => void;
  restoreBusiness: (orgId: string, reason: string) => void;
  setOnboardingState: (orgId: string, state: Organisation['onboardingState'], reason?: string) => void;
  updateIntegrityCase: (caseId: string, status: 'open' | 'under_review' | 'resolved' | 'dismissed', notes: string) => void;
  updateSupportCase: (caseId: string, status: 'open' | 'investigating' | 'resolved', notes: string) => void;

  /** Deterministic prototype review scenarios A–F (operator console only). */
  applyOperatorScenario: (scenario: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;

  // Guided walkthrough
  resetDemoData: () => void;
  jumpToDemoStep: (stepNumber: number) => void;
  currentDemoStep: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organisations, setOrganisations] = useState<Organisation[]>(INITIAL_ORGANISATIONS);
  const [programmes, setProgrammes] = useState<LoyaltyProgramme[]>(INITIAL_PROGRAMMES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [relationships, setRelationships] = useState<ParticipantRelationship[]>(INITIAL_RELATIONSHIPS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [completedRewards, setCompletedRewards] = useState<CompletedReward[]>(INITIAL_COMPLETED_REWARDS);
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>(INITIAL_APPROVAL_ITEMS);
  const [integrityCases, setIntegrityCases] = useState<IntegrityCase[]>(INITIAL_INTEGRITY_CASES);
  const [supportCases, setSupportCases] = useState<SupportCase[]>(INITIAL_SUPPORT_CASES);
  const [commercialRecords, setCommercialRecords] = useState<CommercialRecord[]>(INITIAL_COMMERCIAL_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [markets] = useState<MarketConfig[]>(INITIAL_MARKETS);

  const [activeRole, setActiveRole] = useState<UserRole>('business_owner');
  const [currentUserId, setCurrentUserId] = useState<string>('user-grace-owner');
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-bella-salon');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile_frame'>('desktop');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(0);
  const [participantSeesConfirmer, setParticipantSeesConfirmer] = useState<boolean>(false);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentOrg = organisations.find(o => o.id === currentOrgId) || organisations[0];

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchRole = (newRole: UserRole, targetUserId?: string) => {
    setActiveRole(newRole);
    if (targetUserId) {
      setCurrentUserId(targetUserId);
      const targetUser = users.find(u => u.id === targetUserId);
      if (targetUser?.orgId) setCurrentOrgId(targetUser.orgId);
      return;
    }
    // Default sensible user mapping
    if (newRole === 'business_owner') {
      setCurrentUserId('user-grace-owner');
      setCurrentOrgId('org-bella-salon');
    } else if (newRole === 'business_manager') {
      setCurrentUserId('user-patrick-manager');
      setCurrentOrgId('org-bella-salon');
    } else if (newRole === 'frontline_staff') {
      setCurrentUserId('user-diane-staff');
      setCurrentOrgId('org-bella-salon');
    } else if (newRole === 'participant') {
      setCurrentUserId('user-amina-participant');
    } else if (newRole === 'platform_operator') {
      setCurrentUserId('user-marcus-operator');
    }
  };

  const switchOrganisation = (orgId: string) => {
    setCurrentOrgId(orgId);
    const orgUsers = users.filter(u => u.orgId === orgId);
    if (activeRole === 'business_owner' || activeRole === 'business_manager' || activeRole === 'frontline_staff') {
      const match = orgUsers.find(u => u.role === activeRole) || orgUsers[0];
      if (match) setCurrentUserId(match.id);
    }
  };

  // 1. RECORD QUALIFYING PURCHASE
  const recordQualifyingPurchase = ({
    programmeId,
    customerId,
    quantity,
    notes
  }: {
    programmeId: string;
    customerId: string;
    quantity: number;
    notes?: string;
  }) => {
    const programme = programmes.find(p => p.id === programmeId);
    const customer = users.find(u => u.id === customerId);
    const staff = currentUser;

    if (!programme || !customer) {
      return { success: false, requiresApproval: false, rewardUnlocked: false, message: 'Programme or customer not found.' };
    }

    // Find or create participant relationship for this programme
    let rel = relationships.find(r => r.programmeId === programmeId && r.customerId === customerId);
    if (!rel) {
      rel = {
        id: `rel-${customerId}-${programmeId}`,
        customerId,
        programmeId,
        orgId: programme.orgId,
        currentCycle: 1,
        approvedSteps: 0,
        pendingSteps: 0,
        rewardAvailable: false,
        totalCompletedCycles: 0,
        totalRedeemedRewards: 0,
        lastActivityAt: new Date().toISOString(),
        joinedAt: new Date().toISOString()
      };
    }

    const requiresApproval = quantity > (programme.rules.requireApprovalAbove || 2);
    const txId = `tx-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    if (requiresApproval) {
      // Pending transaction
      const newTx: Transaction = {
        id: txId,
        orgId: programme.orgId,
        programmeId,
        customerId,
        customerName: customer.name,
        staffId: staff.id,
        staffName: staff.name,
        quantity,
        type: 'qualifying_purchase',
        status: 'pending_approval',
        pendingReason: `Entered ${quantity} units in one visit (approval threshold is ${programme.rules.requireApprovalAbove})`,
        cycleBefore: rel.currentCycle,
        cycleAfter: rel.currentCycle,
        stepsBefore: rel.approvedSteps,
        stepsAfter: rel.approvedSteps,
        notes,
        createdAt: now
      };

      const newApproval: ApprovalItem = {
        id: `appr-${txId}`,
        transactionId: txId,
        orgId: programme.orgId,
        customerId,
        customerName: customer.name,
        programmeId,
        programmeName: programme.name,
        quantity,
        staffId: staff.id,
        staffName: staff.name,
        requestedAt: now,
        reason: `Multi-unit transaction: ${quantity} units recorded at once by ${staff.name}`,
        status: 'pending'
      };

      setTransactions(prev => [newTx, ...prev]);
      setApprovalItems(prev => [newApproval, ...prev]);
      setRelationships(prev => {
        const others = prev.filter(r => r.id !== rel!.id);
        return [...others, { ...rel!, pendingSteps: rel!.pendingSteps + quantity, lastActivityAt: now }];
      });

      showToast({
        title: 'Purchase recorded — waiting for approval',
        description: `${quantity} ${programme.qualifyingItemName}(s) recorded for ${customer.name}. Needs manager approval.`,
        type: 'warning'
      });

      return {
        success: true,
        requiresApproval: true,
        rewardUnlocked: false,
        message: 'Purchase recorded. Forwarded to Approval Centre.'
      };
    }

    // Normal immediate approved recording
    const stepsBefore = rel.approvedSteps;
    const newSteps = stepsBefore + quantity;
    const rewardUnlocked = newSteps >= 10;
    const finalSteps = rewardUnlocked ? 10 : newSteps;

    const newTx: Transaction = {
      id: txId,
      orgId: programme.orgId,
      programmeId,
      customerId,
      customerName: customer.name,
      staffId: staff.id,
      staffName: staff.name,
      quantity,
      type: 'qualifying_purchase',
      status: 'approved',
      cycleBefore: rel.currentCycle,
      cycleAfter: rel.currentCycle,
      stepsBefore,
      stepsAfter: finalSteps,
      rewardTriggered: rewardUnlocked,
      notes,
      createdAt: now
    };

    let rewardCode = rel.rewardCode;
    if (rewardUnlocked && !rel.rewardAvailable) {
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      rewardCode = `${currentOrg.logoText || 'ONUS'}-REW-${codeSuffix}`;
      
      const newReward: CompletedReward = {
        id: `rew-${Date.now().toString().slice(-4)}`,
        orgId: programme.orgId,
        orgName: currentOrg.name,
        programmeId,
        programmeName: programme.name,
        customerId,
        customerName: customer.name,
        rewardCode,
        rewardTitle: programme.rewardDescription,
        cycleNumber: rel.currentCycle,
        earnedAt: now,
        status: 'available'
      };
      setCompletedRewards(prev => [newReward, ...prev]);

      // Commercial unit settlement
      const commercialRecord: CommercialRecord = {
        id: `comm-${Date.now().toString().slice(-4)}`,
        orgId: programme.orgId,
        orgName: currentOrg.name,
        completedCircleId: `circ-${rel.currentCycle}-${customer.id.slice(-4)}`,
        unitAmountUSD: 1.0,
        coverageType: currentOrg.trialCirclesRemaining > 0 ? 'trial' : 'paid_credit',
        recordedAt: now,
        status: 'settled'
      };
      setCommercialRecords(prev => [commercialRecord, ...prev]);

      // Deduct from trial or balance
      setOrganisations(prev => prev.map(o => {
        if (o.id !== programme.orgId) return o;
        const newTrial = Math.max(0, o.trialCirclesRemaining - 1);
        const newBalance = o.trialCirclesRemaining > 0 ? o.creditBalanceUSD : Math.max(0, o.creditBalanceUSD - 1.0);
        return {
          ...o,
          completedBillableCircles: o.completedBillableCircles + 1,
          trialCirclesRemaining: newTrial,
          creditBalanceUSD: newBalance,
          lowCreditAlert: newBalance < 5.0 && newTrial === 0
        };
      }));
    }

    setTransactions(prev => [newTx, ...prev]);
    setRelationships(prev => {
      const others = prev.filter(r => r.id !== rel!.id);
      return [
        ...others,
        {
          ...rel!,
          approvedSteps: finalSteps,
          rewardAvailable: rewardUnlocked ? true : rel!.rewardAvailable,
          rewardCode: rewardCode || rel!.rewardCode,
          totalCompletedCycles: rewardUnlocked ? rel!.totalCompletedCycles + 1 : rel!.totalCompletedCycles,
          lastActivityAt: now
        }
      ];
    });

    // Update programme counters
    setProgrammes(prev => prev.map(p => {
      if (p.id !== programmeId) return p;
      return {
        ...p,
        completedRewardsCount: rewardUnlocked ? p.completedRewardsCount + 1 : p.completedRewardsCount
      };
    }));

    if (rewardUnlocked) {
      showToast({
        title: 'Circle completed! 11th is On Us!',
        description: `${customer.name} reached 10 qualifying purchases. Next ${programme.qualifyingItemName} is free!`,
        type: 'celebrate'
      });
    } else {
      showToast({
        title: `Purchase recorded (${finalSteps} of 10)`,
        description: `Added ${quantity} to ${customer.name}'s circle. ${10 - finalSteps} more until reward!`,
        type: 'success'
      });
    }

    return {
      success: true,
      requiresApproval: false,
      rewardUnlocked,
      message: rewardUnlocked ? 'Circle completed! Reward is now available.' : `Recorded! ${finalSteps} of 10 completed.`
    };
  };

  // 2. REDEEM REWARD (permission-enforced, experience-oriented).
  // PROTOTYPE SCAFFOLDING ONLY: `redemptionAuthority` exists solely to render
  // governed experience states for review. It is NOT production authorization
  // architecture — production authority comes from the accepted backend/Product Truth.
  const resolveAuthority = (user: User): RedemptionAuthority | 'suspended' => {
    if (!user.active) return 'suspended';
    if (user.role === 'platform_operator' || user.role === 'participant') return 'none';
    if (user.redemptionAuthority) return user.redemptionAuthority;
    // Accepted defaults: Owner floor + Manager default grant; Staff no default grant.
    if (user.role === 'business_owner' || user.role === 'business_manager') return 'authorised';
    return 'none';
  };

  const hasRedemptionAuthority = (userId?: string) => {
    const user = userId ? users.find(u => u.id === userId) : currentUser;
    if (!user) return { authorised: false as const, status: 'none' as RedemptionAuthority | 'suspended' };
    const status = resolveAuthority(user);
    return { authorised: status === 'authorised', status };
  };

  const setRedemptionAuthority = (userId: string, authority: RedemptionAuthority) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, redemptionAuthority: authority } : u)));
    const target = users.find(u => u.id === userId);
    showToast({
      title: authority === 'authorised' ? 'Redemption authority granted' : authority === 'revoked' ? 'Redemption authority revoked' : 'Redemption authority removed',
      description: `${target?.name ?? 'Team member'} can${authority === 'authorised' ? '' : ' no longer'} confirm rewards.`,
      type: authority === 'authorised' ? 'success' : 'warning'
    });
  };

  /**
   * Deterministic scenario precondition: Amina's Bella Salon premium circle
   * sits at reward-ready. Prototype scenario scaffolding only — each review
   * scenario re-establishes its own precondition so switching scenarios in
   * any order never strands the UI in an impossible combination. Redeemed
   * history is preserved; only the *current* earning position is reset.
   * NOT production authorization architecture.
   */
  const resetBellaToReady = (): void => {
    const now = new Date().toISOString();
    // Reset the Bella/Amina demo slice to a known baseline: cycle 1, 10/10,
    // exactly one available demo reward. Other businesses (e.g. Joe's Coffee)
    // are untouched so cross-business state stays realistic.
    setRelationships(prev =>
      prev.map(r => {
        if (r.customerId === 'user-amina-participant' && r.programmeId === 'prog-bella-premium') {
          return {
            ...r,
            currentCycle: 1,
            approvedSteps: 10,
            pendingSteps: 0,
            rewardAvailable: true,
            rewardCode: 'BS-REF-READY',
            totalCompletedCycles: 1,
            totalRedeemedRewards: 0,
            lastActivityAt: now
          };
        }
        return r;
      })
    );
    setCompletedRewards(prev => [
      {
        id: `rew-bella-amina-demo`,
        orgId: 'org-bella-salon',
        orgName: 'Bella Salon',
        programmeId: 'prog-bella-premium',
        programmeName: 'Premium Haircut & Styling',
        customerId: 'user-amina-participant',
        customerName: 'Amina Niyonsaba',
        rewardCode: 'BS-REF-READY',
        rewardTitle: '11th Premium Haircut & Styling is on Bella Salon',
        cycleNumber: 1,
        earnedAt: now,
        status: 'available'
      },
      ...prev.filter(r => !(r.customerId === 'user-amina-participant' && r.programmeId === 'prog-bella-premium'))
    ]);
    // Purge prior demo-slice redemption transactions so review history never
    // shows duplicate redemptions. Qualifying-purchase history is preserved.
    setTransactions(prev =>
      prev.filter(
        t =>
          !(
            t.type === 'reward_redemption' &&
            t.customerId === 'user-amina-participant' &&
            t.programmeId === 'prog-bella-premium'
          )
      )
    );
  };

  const applyRedemptionScenario = (scenario: 'authorised' | 'staff-blocked' | 'manager-revoked' | 'participant-ready' | 'after-redemption' | 'already-redeemed') => {
    // Review entry points start from a clean slate: no stale toasts.
    setToasts([]);
    switch (scenario) {
      case 'authorised':
        // Explicit governed grant so the frontline counter can confirm (Scenario 1).
        setUsers(prev => prev.map(u => (u.id === 'user-diane-staff' ? { ...u, active: true, redemptionAuthority: 'authorised' as RedemptionAuthority } : u)));
        resetBellaToReady();
        setCurrentUserId('user-diane-staff');
        setActiveRole('frontline_staff');
        setCurrentOrgId('org-bella-salon');
        setCurrentDemoStep(0);
        break;
      case 'staff-blocked':
        setUsers(prev => prev.map(u => (u.id === 'user-diane-staff' ? { ...u, active: true, redemptionAuthority: 'none' as RedemptionAuthority } : u)));
        resetBellaToReady();
        setCurrentUserId('user-diane-staff');
        setActiveRole('frontline_staff');
        setCurrentOrgId('org-bella-salon');
        setCurrentDemoStep(0);
        break;
      case 'manager-revoked':
        setUsers(prev => prev.map(u => (u.id === 'user-patrick-manager' ? { ...u, active: true, redemptionAuthority: 'revoked' as RedemptionAuthority } : u)));
        resetBellaToReady();
        setCurrentUserId('user-patrick-manager');
        setActiveRole('business_manager');
        setCurrentOrgId('org-bella-salon');
        setCurrentDemoStep(0);
        break;
      case 'participant-ready':
        resetBellaToReady();
        setCurrentUserId('user-amina-participant');
        setActiveRole('participant');
        setCurrentDemoStep(0);
        break;
      case 'after-redemption':
      case 'already-redeemed': {
        // Deterministic redeemed state: reset the Bella slice to ready, then
        // confirm once as the Owner (Grace). Exactly one redeemed entry,
        // cycle 1 → 2, fresh 0/10 — no cumulative duplicates across runs.
        resetBellaToReady();
        const now = new Date().toISOString();
        const owner = users.find(u => u.id === 'user-grace-owner') ?? currentUser;
        setCompletedRewards(prev =>
          prev.map(r =>
            r.id === 'rew-bella-amina-demo'
              ? { ...r, status: 'redeemed' as const, redeemedAt: now, redeemedByStaffId: owner.id, redeemedByStaffName: owner.name }
              : r
          )
        );
        setRelationships(prev =>
          prev.map(r => {
            if (r.customerId === 'user-amina-participant' && r.programmeId === 'prog-bella-premium') {
              return { ...r, currentCycle: 2, approvedSteps: 0, pendingSteps: 0, rewardAvailable: false, rewardCode: undefined, totalCompletedCycles: 1, totalRedeemedRewards: 1, lastActivityAt: now };
            }
            return r;
          })
        );
        setTransactions(prev => [
          {
            id: `tx-bella-amina-demo`,
            orgId: 'org-bella-salon',
            programmeId: 'prog-bella-premium',
            customerId: 'user-amina-participant',
            customerName: 'Amina Niyonsaba',
            staffId: owner.id,
            staffName: owner.name,
            quantity: 1,
            type: 'reward_redemption' as const,
            status: 'approved' as const,
            cycleBefore: 1,
            cycleAfter: 2,
            stepsBefore: 10,
            stepsAfter: 0,
            notes: 'Reward redeemed successfully. Next earning cycle started.',
            createdAt: now
          },
          ...prev.filter(t => t.id !== 'tx-bella-amina-demo')
        ]);
        if (scenario === 'after-redemption') {
          setCurrentUserId('user-amina-participant');
          setActiveRole('participant');
        } else {
          setUsers(prev => prev.map(u => (u.id === 'user-diane-staff' ? { ...u, redemptionAuthority: 'authorised' as RedemptionAuthority } : u)));
          setCurrentUserId('user-diane-staff');
          setActiveRole('frontline_staff');
          setCurrentOrgId('org-bella-salon');
        }
        setCurrentDemoStep(0);
        break;
      }
    }
  };

  const redeemReward = ({
    rewardId,
    programmeId,
    customerId
  }: {
    rewardId?: string;
    programmeId: string;
    customerId: string;
  }) => {
    const programme = programmes.find(p => p.id === programmeId);
    const customer = users.find(u => u.id === customerId);
    const staff = currentUser;
    const rel = relationships.find(r => r.programmeId === programmeId && r.customerId === customerId);

    // Permission gate: platform operators and customers never hold Business authority.
    const authority = resolveAuthority(staff);
    if (authority !== 'authorised') {
      const reason = (authority === 'revoked' ? 'revoked' : authority === 'suspended' ? 'suspended' : 'unauthorised') as 'revoked' | 'suspended' | 'unauthorised';
      return { success: false as const, message: 'Confirmation requires an authorised team member.', reason };
    }

    if (!rel || !programme || !customer) {
      return { success: false as const, message: 'No active reward available for redemption.', reason: 'no_reward' as const };
    }

    if (!rel.rewardAvailable) {
      // Safe double-action state: a repeat confirm must not look like a second redemption.
      const wasRedeemed =
        rel.totalRedeemedRewards > 0 ||
        completedRewards.some(r => r.customerId === customerId && r.programmeId === programmeId && r.status === 'redeemed');
      return {
        success: false as const,
        message: 'This reward has already been redeemed.',
        reason: (wasRedeemed ? 'already_redeemed' : 'no_reward') as 'already_redeemed' | 'no_reward'
      };
    }

    const now = new Date().toISOString();
    const nextCycle = rel.currentCycle + 1;

    // Update CompletedReward
    setCompletedRewards(prev => prev.map(rew => {
      if ((rewardId && rew.id === rewardId) || (!rewardId && rew.customerId === customerId && rew.programmeId === programmeId && rew.status === 'available')) {
        return {
          ...rew,
          status: 'redeemed',
          redeemedAt: now,
          redeemedByStaffId: staff.id,
          redeemedByStaffName: staff.name
        };
      }
      return rew;
    }));

    // Record Transaction
    const txId = `tx-${Date.now().toString().slice(-4)}`;
    const redeemTx: Transaction = {
      id: txId,
      orgId: programme.orgId,
      programmeId,
      customerId,
      customerName: customer.name,
      staffId: staff.id,
      staffName: staff.name,
      quantity: 1,
      type: 'reward_redemption',
      status: 'approved',
      cycleBefore: rel.currentCycle,
      cycleAfter: nextCycle,
      stepsBefore: 10,
      stepsAfter: 0,
      notes: `Reward redeemed successfully. Commenced Circle #${nextCycle}.`,
      createdAt: now
    };

    setTransactions(prev => [redeemTx, ...prev]);

    // Reset relationship to start new cycle
    setRelationships(prev => prev.map(r => {
      if (r.id !== rel.id) return r;
      return {
        ...r,
        currentCycle: nextCycle,
        approvedSteps: 0,
        pendingSteps: 0,
        rewardAvailable: false,
        rewardCode: undefined,
        totalRedeemedRewards: r.totalRedeemedRewards + 1,
        lastActivityAt: now
      };
    }));

    // Audit log
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        actorName: staff.name,
        actorRole: staff.role,
        action: 'REWARD_REDEMPTION_COMPLETED',
        targetType: 'Reward',
        targetId: rel.rewardCode || txId,
        reason: `Redeemed 11th ONUS reward for ${customer.name} on ${programme.name}`,
        timestamp: now,
        previousState: `Cycle ${rel.currentCycle} - 10/10 (Available)`,
        newState: `Cycle ${nextCycle} - 0/10 (Active)`
      },
      ...prev
    ]);

    showToast({
      title: 'Reward redeemed successfully!',
      description: `${customer.name}'s reward was provided. They can start earning toward the next reward now.`,
      type: 'success'
    });

    return { success: true, message: `Reward redeemed! ${customer.name.split(' ')[0]} can start earning toward the next reward now.` };
  };

  // 3. APPROVAL ACTIONS
  const approvePendingItem = (approvalId: string) => {
    const item = approvalItems.find(a => a.id === approvalId);
    if (!item) return;

    const now = new Date().toISOString();
    const rel = relationships.find(r => r.programmeId === item.programmeId && r.customerId === item.customerId);
    const programme = programmes.find(p => p.id === item.programmeId);

    if (rel && programme) {
      const stepsBefore = rel.approvedSteps;
      const newSteps = stepsBefore + item.quantity;
      const rewardUnlocked = newSteps >= 10;
      const finalSteps = rewardUnlocked ? 10 : newSteps;

      // Update relationship
      setRelationships(prev => prev.map(r => {
        if (r.id !== rel.id) return r;
        return {
          ...r,
          approvedSteps: finalSteps,
          pendingSteps: Math.max(0, r.pendingSteps - item.quantity),
          rewardAvailable: rewardUnlocked ? true : r.rewardAvailable,
          lastActivityAt: now
        };
      }));

      // Update transaction status
      setTransactions(prev => prev.map(t => {
        if (t.id === item.transactionId) {
          return {
            ...t,
            status: 'approved',
            stepsAfter: finalSteps,
            rewardTriggered: rewardUnlocked
          };
        }
        return t;
      }));

      // Remove from pending approvals
      setApprovalItems(prev => prev.filter(a => a.id !== approvalId));

      // Audit log
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now().toString().slice(-4)}`,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'PENDING_TRANSACTION_APPROVED',
          targetType: 'Transaction',
          targetId: item.transactionId,
          reason: `Approved multi-unit entry for ${item.customerName}`,
          timestamp: now
        },
        ...prev
      ]);

      showToast({
        title: 'Transaction approved',
        description: `Approved ${item.quantity} units for ${item.customerName}.`,
        type: 'success'
      });
    }
  };

  const rejectPendingItem = (approvalId: string, reason: string) => {
    const item = approvalItems.find(a => a.id === approvalId);
    if (!item) return;

    const now = new Date().toISOString();
    // Update relationship: clear pending steps without applying
    setRelationships(prev => prev.map(r => {
      if (r.programmeId === item.programmeId && r.customerId === item.customerId) {
        return {
          ...r,
          pendingSteps: Math.max(0, r.pendingSteps - item.quantity),
          lastActivityAt: now
        };
      }
      return r;
    }));

    // Mark transaction rejected (audit history preserved)
    setTransactions(prev => prev.map(t => {
      if (t.id === item.transactionId) {
        return {
          ...t,
          status: 'rejected',
          rejectionReason: reason
        };
      }
      return t;
    }));

    setApprovalItems(prev => prev.filter(a => a.id !== approvalId));

    setAuditLogs(prev => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'PENDING_TRANSACTION_REJECTED',
        targetType: 'Transaction',
        targetId: item.transactionId,
        reason: reason || 'Declined by manager after review',
        timestamp: now
      },
      ...prev
    ]);

    showToast({
      title: 'Transaction rejected',
      description: `Transaction declined with reason preserved in audit logs.`,
      type: 'info'
    });
  };

  // 4. REVERSE TRANSACTION
  const reverseTransaction = (txId: string, reason: string) => {
    const origTx = transactions.find(t => t.id === txId);
    if (!origTx) return;

    const now = new Date().toISOString();
    const rel = relationships.find(r => r.programmeId === origTx.programmeId && r.customerId === origTx.customerId);

    if (rel) {
      const stepsToDeduct = origTx.quantity;
      const newSteps = Math.max(0, rel.approvedSteps - stepsToDeduct);

      setRelationships(prev => prev.map(r => {
        if (r.id !== rel.id) return r;
        return {
          ...r,
          approvedSteps: newSteps,
          lastActivityAt: now
        };
      }));

      // Create Reversal Transaction
      const revTxId = `tx-rev-${Date.now().toString().slice(-4)}`;
      const reversalTx: Transaction = {
        id: revTxId,
        orgId: origTx.orgId,
        programmeId: origTx.programmeId,
        customerId: origTx.customerId,
        customerName: origTx.customerName,
        staffId: currentUser.id,
        staffName: currentUser.name,
        quantity: -origTx.quantity,
        type: 'reversal',
        status: 'approved',
        originalTxId: txId,
        correctionReason: reason,
        cycleBefore: rel.currentCycle,
        cycleAfter: rel.currentCycle,
        stepsBefore: rel.approvedSteps,
        stepsAfter: newSteps,
        createdAt: now
      };

      setTransactions(prev => [reversalTx, ...prev]);

      setAuditLogs(prev => [
        {
          id: `aud-${Date.now().toString().slice(-4)}`,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'TRANSACTION_REVERSAL',
          targetType: 'Transaction',
          targetId: txId,
          reason,
          timestamp: now,
          previousState: `${origTx.quantity} units (${origTx.customerName})`,
          newState: `Reversed (${newSteps} of 10 remaining)`
        },
        ...prev
      ]);

      showToast({
        title: 'Transaction reversed',
        description: `Deducted ${origTx.quantity} step(s) with traceable audit record.`,
        type: 'warning'
      });
    }
  };

  // 5. PROGRAMME CREATION & MANAGEMENT
  const createProgramme = (data: Omit<LoyaltyProgramme, 'id' | 'orgId' | 'totalParticipants' | 'activeCycles' | 'completedRewardsCount' | 'createdAt'>) => {
    const id = `prog-${currentOrg.id.replace('org-', '')}-${Date.now().toString().slice(-4)}`;
    const newProg: LoyaltyProgramme = {
      ...data,
      id,
      orgId: currentOrg.id,
      totalParticipants: 0,
      activeCycles: 0,
      completedRewardsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProgrammes(prev => [newProg, ...prev]);
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'PROGRAMME_CREATED',
        targetType: 'LoyaltyProgramme',
        targetId: id,
        reason: `Created loyalty programme: ${data.name}`,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    showToast({
      title: 'Loyalty programme created!',
      description: `${data.name} is now ${data.status}. Buy 10, 11th is On Us.`,
      type: 'success'
    });

    return id;
  };

  const updateProgrammeStatus = (programmeId: string, status: ProgrammeStatus) => {
    setProgrammes(prev => prev.map(p => {
      if (p.id !== programmeId) return p;
      return { ...p, status };
    }));

    showToast({
      title: 'Programme updated',
      description: `Programme status changed to ${status}.`,
      type: 'info'
    });
  };

  // 6. STAFF & ORGANISATION
  const createOrganisation = (orgData: Partial<Organisation>, initialProg?: any) => {
    const orgId = `org-${orgData.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'new'}-${Date.now().toString().slice(-3)}`;
    const newOrg: Organisation = {
      id: orgId,
      name: orgData.name || 'New Organisation',
      category: orgData.category || 'Retail & Services',
      country: orgData.country || 'Burundi',
      city: orgData.city || 'Bujumbura',
      address: orgData.address || '',
      phone: orgData.phone || '',
      email: orgData.email || '',
      currency: orgData.currency || 'BIF',
      status: 'active',
      logoText: (orgData.name || 'NO').slice(0, 2).toUpperCase(),
      primaryContact: orgData.primaryContact || currentUser.name,
      trialCirclesRemaining: 5,
      completedBillableCircles: 0,
      creditBalanceUSD: 0.0,
      lowCreditAlert: false,
      gracePeriodActive: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrganisations(prev => [newOrg, ...prev]);
    setCurrentOrgId(orgId);

    if (initialProg) {
      const progId = `prog-${orgId.replace('org-', '')}-main`;
      const prog: LoyaltyProgramme = {
        id: progId,
        orgId,
        name: initialProg.name || 'Signature Offering',
        category: initialProg.category || 'General',
        description: initialProg.description || 'Buy 10, 11th On Us',
        qualifyingItemName: initialProg.qualifyingItemName || 'Service',
        sellingPrice: initialProg.sellingPrice || 10000,
        currency: newOrg.currency,
        status: 'active',
        rules: {
          allowMultipleUnits: true,
          maxUnitsPerTx: 2,
          requireApprovalAbove: 2,
          customerConfirmation: false,
          allowBackdated: false
        },
        requiredSteps: 10,
        rewardDescription: `11th ${initialProg.qualifyingItemName || 'Service'} is on ${newOrg.name}`,
        totalParticipants: 0,
        activeCycles: 0,
        completedRewardsCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProgrammes(prev => [prog, ...prev]);
    }

    showToast({
      title: 'Organisation live!',
      description: `${newOrg.name} is configured and ready for loyalty recognition.`,
      type: 'success'
    });

    return orgId;
  };

  const inviteStaffMember = ({
    name,
    email,
    phone,
    role,
    title
  }: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    title: string;
  }) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      role,
      orgId: currentOrg.id,
      initials,
      title,
      active: true,
      // Governed default: newly invited team members hold no redemption
      // authority until an explicit grant is made.
      redemptionAuthority: 'none'
    };

    setUsers(prev => [...prev, newUser]);
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'STAFF_INVITED',
        targetType: 'User',
        targetId: newUser.id,
        reason: `Invited ${name} with role ${role}`,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    showToast({
      title: 'Team member invited',
      description: `${name} invited as ${role.replace('_', ' ')}. Invitation dispatched.`,
      type: 'success'
    });
  };

  const toggleStaffStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newActive = !u.active;
      showToast({
        title: newActive ? 'Account activated' : 'Account deactivated',
        description: `${u.name}'s account is now ${newActive ? 'active' : 'suspended'}.`,
        type: newActive ? 'info' : 'warning'
      });
      return { ...u, active: newActive };
    }));
  };

  const topUpCommercialBalance = (orgId: string, amountUSD: number) => {
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      const newBalance = o.creditBalanceUSD + amountUSD;
      return {
        ...o,
        creditBalanceUSD: newBalance,
        lowCreditAlert: false,
        gracePeriodActive: false
      };
    }));

    showToast({
      title: 'Credits added',
      description: `Added $${amountUSD}.00 commercial credit balance to ${organisations.find(o => o.id === orgId)?.name}.`,
      type: 'success'
    });
  };

  const registerWalkInCustomer = ({ name, phone, programmeId }: { name: string; phone: string; programmeId: string }): string => {
    const custId = `user-walkin-${Date.now().toString().slice(-4)}`;
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CU';
    const onusId = `ONUS-${Math.floor(1000 + Math.random() * 9000)}-${initials}`;

    const newCustomer: User = {
      id: custId,
      name,
      phone,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@participant.11thonus.com`,
      role: 'participant',
      initials,
      onusId,
      active: true
    };

    setUsers(prev => [...prev, newCustomer]);

    // Create participant relationship
    const newRel: ParticipantRelationship = {
      id: `rel-${custId}-${programmeId}`,
      customerId: custId,
      programmeId,
      orgId: currentOrg.id,
      approvedSteps: 0,
      pendingSteps: 0,
      rewardAvailable: false,
      currentCycle: 1,
      totalCompletedCycles: 0,
      totalRedeemedRewards: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActivityAt: new Date().toISOString()
    };

    setRelationships(prev => [...prev, newRel]);

    showToast({
      title: 'Customer registered',
      description: `${name} registered. ID: ${onusId}. Starting Cycle #1 (0/10).`,
      type: 'success'
    });

    return custId;
  };

  const joinProgrammeAsParticipant = (programmeId: string) => {
    const prog = programmes.find(p => p.id === programmeId);
    if (!prog) return;

    const existing = relationships.find(
      r => r.customerId === currentUser.id && r.programmeId === programmeId
    );
    if (existing) {
      showToast({
        title: 'Already a member',
        description: `You are already enrolled in ${prog.name}.`,
        type: 'info'
      });
      return;
    }

    const newRel: ParticipantRelationship = {
      id: `rel-${currentUser.id}-${programmeId}`,
      customerId: currentUser.id,
      programmeId,
      orgId: prog.orgId,
      approvedSteps: 0,
      pendingSteps: 0,
      rewardAvailable: false,
      currentCycle: 1,
      totalCompletedCycles: 0,
      totalRedeemedRewards: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActivityAt: new Date().toISOString()
    };

    setRelationships(prev => [...prev, newRel]);
    showToast({
      title: 'Enrolled in Loyalty Circle',
      description: `Welcome! Complete 10 qualifying visits to earn your 11th on ${organisations.find(o => o.id === prog.orgId)?.name}.`,
      type: 'success'
    });
  };

  // 7. OPERATOR ACTIONS
  const pushAudit = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString();
    setAuditLogs(prev => [
      { ...entry, id: `aud-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 99)}`, timestamp: now },
      ...prev
    ]);
  };

  const adminName = 'Platform Administrator';
  const resolveIntegrityCase = (caseId: string, notes: string) => {
    setIntegrityCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return { ...c, status: 'resolved', resolutionNotes: notes };
    }));

    showToast({
      title: 'Integrity case resolved',
      description: 'Case marked resolved and archived with operator investigation findings.',
      type: 'info'
    });
  };

  const resolveSupportCase = (caseId: string, notes: string) => {
    setSupportCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return { ...c, status: 'resolved', resolutionNotes: notes };
    }));

    showToast({
      title: 'Support ticket resolved',
      description: 'Response dispatched to requester and case closed.',
      type: 'info'
    });
  };

  const toggleOrgStatus = (orgId: string, newStatus: Organisation['status'], reason: string) => {
    const prev = organisations.find(o => o.id === orgId);
    setOrganisations(prevOrgs => prevOrgs.map(o => {
      if (o.id !== orgId) return o;
      return { ...o, status: newStatus };
    }));

    pushAudit({
      actorName: currentUser.name || adminName,
      actorRole: 'Platform Administrator',
      action: 'ORGANISATION_STATUS_AMENDED',
      targetType: 'Organisation',
      targetId: orgId,
      reason,
      previousState: `status: ${prev?.status ?? 'unknown'}`,
      newState: `status: ${newStatus}`
    });

    showToast({
      title: 'Organisation status updated',
      description: `Organisation is now ${newStatus}. Logged in platform audit history.`,
      type: 'warning'
    });
  };

  // ---- Launch commercial operations (manual, governed, audited) ----
  const grantTrial = (orgId: string, units: number, reason: string) => {
    // Prototype entry bound (3–5-unit governed trial direction): grants are
    // capped at 5 units. This cap is an experience guardrail, not a claim
    // that 5 is the universally governed default.
    const bounded = Math.max(1, Math.min(5, Math.round(units)));
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const before = org.trialCirclesRemaining;
    const allowance = (org.trialAllowanceTotal ?? 5);
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return {
        ...o,
        trialCirclesRemaining: o.trialCirclesRemaining + bounded,
        trialAllowanceTotal: allowance,
        status: o.status === 'onboarding' ? 'trial' : o.status,
        onboardingState: 'trial_ready',
        commercialStanding: o.paidActive ? 'paid_active' : 'trial'
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'TRIAL_GRANTED',
      targetType: 'Organisation',
      targetId: orgId,
      reason: reason || `Trial granted (${bounded} units).`,
      previousState: `trialRemaining: ${before}`,
      newState: `trialRemaining: ${before + bounded}`
    });
    showToast({ title: 'Trial granted', description: `${org.name}: +${bounded} trial units. Now trial-ready.`, type: 'success' });
  };

  const adjustTrial = (orgId: string, delta: number, reason: string) => {
    // Small plausible extension/adjustment within the 3–5-unit trial model.
    // The ±5 prototype entry bound is NOT a governed trial rule.
    const bounded = Math.max(-5, Math.min(5, Math.round(delta)));
    if (bounded === 0) return;
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const before = org.trialCirclesRemaining;
    const after = Math.max(0, before + bounded);
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      const standing: Organisation['commercialStanding'] =
        o.paidActive ? 'paid_active' : after === 0 && o.creditBalanceUSD <= 0 ? 'restricted' : after > 0 ? 'trial' : o.commercialStanding;
      return { ...o, trialCirclesRemaining: after, commercialStanding: standing };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'TRIAL_ADJUSTED',
      targetType: 'Organisation',
      targetId: orgId,
      reason: reason || `Trial adjusted (${bounded > 0 ? '+' : ''}${bounded}).`,
      previousState: `trialRemaining: ${before}`,
      newState: `trialRemaining: ${after}`
    });
    showToast({ title: 'Trial adjusted', description: `${org.name}: trial ${before} → ${after}.`, type: 'info' });
  };

  const activatePaidService = (orgId: string, reference: string, note?: string) => {
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const now = new Date().toISOString();
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return {
        ...o,
        paidActive: true,
        paidActivatedAt: now,
        paidActivationRef: reference,
        manualActivation: { activatedAt: now, activatedBy: adminName, reference, note },
        status: 'active',
        onboardingState: 'commercially_active',
        commercialStanding: 'paid_active',
        gracePeriodActive: false
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'PAID_SERVICE_MANUALLY_ACTIVATED',
      targetType: 'Organisation',
      targetId: orgId,
      reason: `Offline payment confirmed. Ref ${reference}.${note ? ` ${note}` : ''}`,
      previousState: `commercialStanding: ${org.commercialStanding ?? 'unknown'}`,
      newState: 'commercialStanding: paid_active'
    });
    showToast({ title: 'Paid service activated', description: `${org.name} manually activated under paid terms. Ref ${reference}.`, type: 'success' });
  };

  const addCommercialCredit = (orgId: string, amountUSD: number, reference: string) => {
    const bounded = Math.max(1, Math.min(500, Math.round(amountUSD)));
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const before = org.creditBalanceUSD;
    const after = before + bounded;
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      const clearsRestriction = after > 0;
      return {
        ...o,
        creditBalanceUSD: after,
        lowCreditAlert: after < 5 && o.trialCirclesRemaining === 0,
        gracePeriodActive: after <= 0,
        commercialStanding: clearsRestriction
          ? (o.paidActive ? 'paid_active' : o.trialCirclesRemaining > 0 ? 'trial' : 'paid_active')
          : o.commercialStanding,
        status: clearsRestriction && o.status === 'restricted' ? 'active' : o.status
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'CREDIT_ADDED',
      targetType: 'Organisation',
      targetId: orgId,
      reason: `Approved credit added: $${bounded}. Ref ${reference}.`,
      previousState: `credit: $${before.toFixed(2)}`,
      newState: `credit: $${after.toFixed(2)}`
    });
    showToast({ title: 'Commercial credit added', description: `${org.name}: $${before.toFixed(2)} → $${after.toFixed(2)}.`, type: 'success' });
  };

  const adjustCommercialCredit = (orgId: string, deltaUSD: number, reason: string) => {
    const bounded = Math.max(-50, Math.min(100, Math.round(deltaUSD)));
    if (bounded === 0 || !reason.trim()) return;
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const before = org.creditBalanceUSD;
    // Governed principle: negative credit may be recoverable. No maximum
    // negative balance is invented here — the balance simply moves.
    const after = before + bounded;
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return {
        ...o,
        creditBalanceUSD: after,
        lowCreditAlert: after < 5 && o.trialCirclesRemaining === 0,
        gracePeriodActive: after <= 0 ? true : false,
        commercialStanding: after <= 0 ? 'grace' : o.commercialStanding
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'CREDIT_ADJUSTED',
      targetType: 'Organisation',
      targetId: orgId,
      reason,
      previousState: `credit: $${before.toFixed(2)}`,
      newState: `credit: $${after.toFixed(2)}`
    });
    showToast({ title: 'Credit adjusted', description: `${org.name}: $${before.toFixed(2)} → $${after.toFixed(2)}.`, type: 'info' });
  };

  const restrictBusiness = (orgId: string, reason: string) => {
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return { ...o, status: 'restricted', commercialStanding: 'restricted' as const };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'BUSINESS_RESTRICTED',
      targetType: 'Organisation',
      targetId: orgId,
      reason,
      previousState: `status: ${org.status} / standing: ${org.commercialStanding ?? 'unknown'}`,
      newState: 'status: restricted / standing: restricted (earned rewards + active cycles preserved)'
    });
    showToast({ title: 'Business restricted', description: `${org.name}: new starts blocked. Earned rewards remain redeemable.`, type: 'warning' });
  };

  const restoreBusiness = (orgId: string, reason: string) => {
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    const standing: Organisation['commercialStanding'] =
      org.paidActive ? 'paid_active' : org.trialCirclesRemaining > 0 ? 'trial' : org.creditBalanceUSD > 0 ? 'paid_active' : 'grace';
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return {
        ...o,
        status: standing === 'grace' ? 'restricted' : 'active',
        commercialStanding: standing,
        gracePeriodActive: standing === 'grace',
        lowCreditAlert: o.creditBalanceUSD < 5 && o.trialCirclesRemaining === 0
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'BUSINESS_RESTORED',
      targetType: 'Organisation',
      targetId: orgId,
      reason,
      previousState: `status: ${org.status} / standing: ${org.commercialStanding ?? 'unknown'}`,
      newState: `status: ${standing === 'grace' ? 'restricted' : 'active'} / standing: ${standing}`
    });
    showToast({ title: 'Standing restored', description: `${org.name}: commercial standing → ${standing}.`, type: 'success' });
  };

  const setOnboardingState = (orgId: string, state: Organisation['onboardingState'], reason?: string) => {
    const org = organisations.find(o => o.id === orgId);
    if (!org) return;
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return {
        ...o,
        onboardingState: state,
        status: state === 'commercially_active' ? 'active' : state === 'trial_ready' ? (o.status === 'onboarding' ? 'trial' : o.status) : o.status
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: 'ONBOARDING_STATE_UPDATED',
      targetType: 'Organisation',
      targetId: orgId,
      reason: reason || `Onboarding → ${state}.`,
      previousState: `onboarding: ${org.onboardingState ?? 'unknown'}`,
      newState: `onboarding: ${state}`
    });
  };

  const updateIntegrityCase = (caseId: string, status: 'open' | 'under_review' | 'resolved' | 'dismissed', notes: string) => {
    setIntegrityCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        status,
        investigationNotes: notes ? `${c.investigationNotes ? c.investigationNotes + ' | ' : ''}${notes}` : c.investigationNotes,
        resolutionNotes: status === 'resolved' || status === 'dismissed' ? notes : c.resolutionNotes
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: status === 'resolved' ? 'INTEGRITY_CASE_RESOLVED' : status === 'dismissed' ? 'INTEGRITY_CASE_DISMISSED' : 'INTEGRITY_CASE_REVIEWED',
      targetType: 'IntegrityCase',
      targetId: caseId,
      reason: notes || `Integrity case → ${status}.`
    });
    showToast({ title: `Integrity case ${status.replace('_', ' ')}`, description: 'Investigation record preserved in audit.', type: 'info' });
  };

  const updateSupportCase = (caseId: string, status: 'open' | 'investigating' | 'resolved', notes: string) => {
    setSupportCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        status,
        investigationNotes: notes ? `${c.investigationNotes ? c.investigationNotes + ' | ' : ''}${notes}` : c.investigationNotes,
        resolutionNotes: status === 'resolved' ? notes : c.resolutionNotes
      };
    }));
    pushAudit({
      actorName: adminName,
      actorRole: 'Platform Administrator',
      action: status === 'resolved' ? 'SUPPORT_CASE_RESOLVED' : 'SUPPORT_CASE_STATUS_UPDATED',
      targetType: 'SupportCase',
      targetId: caseId,
      reason: notes || `Support case → ${status}.`
    });
    showToast({ title: `Support case ${status}`, description: 'Case progress recorded.', type: 'info' });
  };

  const applyOperatorScenario = (scenario: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    setToasts([]);
    if (scenario === 'A') {
      // New Business awaiting trial (governed 3–5-unit trial model: 5-unit example)
      setOrganisations(prev => prev.map(o => o.id === 'org-kivu-bistro' ? {
        ...o, status: 'onboarding' as const, onboardingState: 'ready' as const,
        trialCirclesRemaining: 0, trialAllowanceTotal: 5, creditBalanceUSD: 0,
        paidActive: false, commercialStanding: 'trial' as const, gracePeriodActive: false
      } : o));
      setSupportCases(INITIAL_SUPPORT_CASES);
      showToast({ title: 'Scenario A ready', description: 'Kivu Fresh Bistro is onboarding-ready with no trial. Grant trial from Businesses or Commercial.', type: 'info' });
    } else if (scenario === 'B') {
      // Trial nearing exhaustion: 5 granted, 3 consumed, 2 remaining
      setOrganisations(prev => prev.map(o => o.id === 'org-joes-coffee' ? {
        ...o, status: 'trial' as const, onboardingState: 'trial_ready' as const,
        trialCirclesRemaining: 2, trialAllowanceTotal: 5, creditBalanceUSD: 12,
        paidActive: false, commercialStanding: 'trial' as const
      } : o));
      showToast({ title: 'Scenario B ready', description: "Joe's Coffee: 2 trial units left. Review consumption, grant a bounded extension.", type: 'info' });
    } else if (scenario === 'C') {
      // Offline payment confirmed → manual activation (5-unit trial consumed)
      setOrganisations(prev => prev.map(o => o.id === 'org-joes-coffee' ? {
        ...o, trialCirclesRemaining: 0, trialAllowanceTotal: 5, creditBalanceUSD: 12, paidActive: false,
        status: 'trial' as const, onboardingState: 'trial_ready' as const, commercialStanding: 'trial' as const
      } : o));
      showToast({ title: 'Scenario C ready', description: "Joe's Coffee trial exhausted with offline payment pending. Manually activate paid service.", type: 'info' });
    } else if (scenario === 'D') {
      // Add commercial credit (trial consumed: 5 granted, 5 used)
      setOrganisations(prev => prev.map(o => o.id === 'org-sparkle-wash' ? {
        ...o, trialCirclesRemaining: 0, trialAllowanceTotal: 5, creditBalanceUSD: 2, lowCreditAlert: true,
        status: 'active' as const, commercialStanding: 'grace' as const, gracePeriodActive: true, paidActive: false
      } : o));
      showToast({ title: 'Scenario D ready', description: 'Sparkle Car Wash: $2.00 credit. Add approved credit and watch balance/history update.', type: 'info' });
    } else if (scenario === 'E') {
      // Zero credit / restricted new starts (trial consumed: 5 granted, 5 used).
      // New starts blocked; active circles may finish; earned rewards stay redeemable.
      setOrganisations(prev => prev.map(o => o.id === 'org-sparkle-wash' ? {
        ...o, trialCirclesRemaining: 0, trialAllowanceTotal: 5, creditBalanceUSD: 0, lowCreditAlert: true,
        status: 'restricted' as const, commercialStanding: 'grace' as const,
        gracePeriodActive: true, paidActive: false,
        operatorNote: 'Zero credit: new starts blocked. Active circles may finish; earned rewards remain redeemable; loyalty history intact.'
      } : o));
      showToast({ title: 'Scenario E ready', description: 'Sparkle Car Wash: zero credit, new starts blocked. Restore after commercial resolution.', type: 'info' });
    } else {
      setSupportCases(INITIAL_SUPPORT_CASES);
      setIntegrityCases(INITIAL_INTEGRITY_CASES);
      showToast({ title: 'Scenario F ready', description: 'Support queue reset. Open SUP-8804 (Kivu setup) and jump into the linked Business 360°.', type: 'info' });
    }
  };

  // 8. GUIDED SCRIPTED DEMO STEPS (Sections 55 - 58)
  const jumpToDemoStep = (stepNumber: number) => {
    setCurrentDemoStep(stepNumber);

    switch (stepNumber) {
      case 1: // Business Owner view
        switchRole('business_owner', 'user-grace-owner');
        break;
      case 2: // Staff Counter View
        switchRole('frontline_staff', 'user-diane-staff');
        break;
      case 3: // Staff records Amina's 9th haircut
        recordQualifyingPurchase({
          programmeId: 'prog-bella-premium',
          customerId: 'user-amina-participant',
          quantity: 1,
          notes: 'Regular styling visit (demo step 3)'
        });
        break;
      case 4: // Participant view of 9/10
        switchRole('participant', 'user-amina-participant');
        break;
      case 5: // Staff records 10th haircut -> Reward unlocked!
        switchRole('frontline_staff', 'user-diane-staff');
        recordQualifyingPurchase({
          programmeId: 'prog-bella-premium',
          customerId: 'user-amina-participant',
          quantity: 1,
          notes: '10th qualifying haircut! Completes the circle!'
        });
        break;
      case 6: // Participant sees reward available!
        switchRole('participant', 'user-amina-participant');
        break;
      case 7: // Staff redeems reward
        switchRole('frontline_staff', 'user-diane-staff');
        redeemReward({
          programmeId: 'prog-bella-premium',
          customerId: 'user-amina-participant'
        });
        break;
      case 8: // Owner checks commercial usage & completed circles
        switchRole('business_owner', 'user-grace-owner');
        break;
      case 9: // Manager handles pending approval exception (Jean-Luc)
        switchRole('business_manager', 'user-patrick-manager');
        break;
      case 10: // Operator checks platform integrity & commercial health
        switchRole('platform_operator', 'user-marcus-operator');
        break;
      default:
        break;
    }
  };

  const resetDemoData = () => {
    setOrganisations(INITIAL_ORGANISATIONS);
    setProgrammes(INITIAL_PROGRAMMES);
    setUsers(INITIAL_USERS);
    setRelationships(INITIAL_RELATIONSHIPS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCompletedRewards(INITIAL_COMPLETED_REWARDS);
    setApprovalItems(INITIAL_APPROVAL_ITEMS);
    setIntegrityCases(INITIAL_INTEGRITY_CASES);
    setSupportCases(INITIAL_SUPPORT_CASES);
    setCommercialRecords(INITIAL_COMMERCIAL_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOG);
    setCurrentDemoStep(0);
    switchRole('business_owner', 'user-grace-owner');
    showToast({
      title: 'Demo reset',
      description: 'Reset state to pristine benchmark data (Amina at 8/10, Joe’s Coffee reward available).',
      type: 'info'
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        currentOrg,
        language,
        deviceView,
        toasts,
        organisations,
        programmes,
        users,
        relationships,
        transactions,
        completedRewards,
        approvalItems,
        integrityCases,
        supportCases,
        commercialRecords,
        auditLogs,
        markets,
        setLanguage,
        setDeviceView,
        switchRole,
        switchOrganisation,
        dismissToast,
        showToast,
        recordQualifyingPurchase,
        redeemReward,
        hasRedemptionAuthority,
        setRedemptionAuthority,
        applyRedemptionScenario,
        approvePendingItem,
        rejectPendingItem,
        reverseTransaction,
        createProgramme,
        updateProgrammeStatus,
        createOrganisation,
        inviteStaffMember,
        toggleStaffStatus,
        topUpCommercialBalance,
        registerWalkInCustomer,
        joinProgrammeAsParticipant,
        resolveIntegrityCase,
        resolveSupportCase,
        toggleOrgStatus,
        grantTrial,
        adjustTrial,
        activatePaidService,
        addCommercialCredit,
        adjustCommercialCredit,
        restrictBusiness,
        restoreBusiness,
        setOnboardingState,
        updateIntegrityCase,
        updateSupportCase,
        applyOperatorScenario,
        resetDemoData,
        jumpToDemoStep,
        currentDemoStep,
        participantSeesConfirmer,
        setParticipantSeesConfirmer
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
