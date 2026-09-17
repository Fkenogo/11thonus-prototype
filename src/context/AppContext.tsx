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
  ProgrammeStatus
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
  }) => { success: boolean; message: string };

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

  // Operator actions
  resolveIntegrityCase: (caseId: string, notes: string) => void;
  resolveSupportCase: (caseId: string, notes: string) => void;
  toggleOrgStatus: (orgId: string, newStatus: Organisation['status'], reason: string) => void;

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

  // 2. REDEEM REWARD
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

    if (!rel || !rel.rewardAvailable || !programme || !customer) {
      return { success: false, message: 'No active reward available for redemption.' };
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
      description: `${customer.name}'s reward was applied. Circle #${nextCycle} is now underway.`,
      type: 'success'
    });

    return { success: true, message: `Reward redeemed! New cycle #${nextCycle} started.` };
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
      trialCirclesRemaining: 25,
      completedBillableCircles: 0,
      creditBalanceUSD: 25.0,
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
      active: true
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

  // 7. OPERATOR ACTIONS
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
    setOrganisations(prev => prev.map(o => {
      if (o.id !== orgId) return o;
      return { ...o, status: newStatus };
    }));

    setAuditLogs(prev => [
      {
        id: `aud-${Date.now().toString().slice(-4)}`,
        actorName: currentUser.name,
        actorRole: 'Platform Operator',
        action: 'ORGANISATION_STATUS_AMENDED',
        targetType: 'Organisation',
        targetId: orgId,
        reason,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    showToast({
      title: 'Organisation status updated',
      description: `Organisation is now ${newStatus}. Logged in platform audit history.`,
      type: 'warning'
    });
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
        approvePendingItem,
        rejectPendingItem,
        reverseTransaction,
        createProgramme,
        updateProgrammeStatus,
        createOrganisation,
        inviteStaffMember,
        toggleStaffStatus,
        topUpCommercialBalance,
        resolveIntegrityCase,
        resolveSupportCase,
        toggleOrgStatus,
        resetDemoData,
        jumpToDemoStep,
        currentDemoStep
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
