export type UserRole = 
  | 'business_owner'
  | 'business_manager'
  | 'frontline_staff'
  | 'participant'
  | 'platform_operator';

export type OperatorSubRole =
  | 'platform_admin'
  | 'business_ops'
  | 'support'
  | 'integrity'
  | 'finance';

/**
 * EXPERIENCE REFERENCE — SOLE ADMIN MODEL (launch):
 * Founder = sole Platform Administrator. `OperatorSubRole` scaffolding above
 * is inert prototype typing only and must NOT be treated as approved
 * production authority boundaries. The rendered console presents a single
 * "Platform Administrator". Differentiated roles are deferred.
 */

export type BusinessStatus =
  | 'onboarding'
  | 'trial'
  | 'active'
  | 'restricted'
  | 'suspended';

/** Prototype-only onboarding progression (experience, not production lifecycle). */
export type OnboardingState =
  | 'incomplete'
  | 'ready'
  | 'trial_ready'
  | 'commercially_active';

/** Prototype-only commercial standing, kept distinct from account status. */
export type CommercialStanding =
  | 'trial'
  | 'paid_active'
  | 'grace'
  | 'restricted'
  | 'suspended';

export interface ManualActivationRecord {
  activatedAt: string;
  activatedBy: string;
  reference: string;
  note?: string;
}

export type ProgrammeStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'retired';

export type TransactionType = 
  | 'qualifying_purchase'
  | 'reward_redemption'
  | 'correction'
  | 'reversal';

export type TransactionStatus = 
  | 'approved'
  | 'pending_approval'
  | 'rejected'
  | 'flagged';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  operatorRole?: OperatorSubRole;
  orgId?: string;
  onusId?: string; // For participants, e.g. ONUS-8821-AMINA
  avatar?: string;
  initials: string;
  title?: string;
  active: boolean;
  /**
   * Experience-oriented redemption authority grant.
   * Permission-based, not title-based. Prototype-only representation of
   * the governed grant — NOT production auth internals.
   * - 'authorised': may perform the Business confirmation.
   * - 'revoked': previously authorised, grant withdrawn (stale screens must reflect this).
   * - 'none': no grant (default for Staff/trusted users, Platform Admin, Customer).
   */
  redemptionAuthority?: RedemptionAuthority;
}

export type RedemptionAuthority = 'authorised' | 'revoked' | 'none';

export interface Organisation {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  status: BusinessStatus;
  logoText: string;
  primaryContact: string;
  trialCirclesRemaining: number;
  completedBillableCircles: number;
  creditBalanceUSD: number;
  lowCreditAlert: boolean;
  gracePeriodActive: boolean;
  createdAt: string;
  /**
   * Prototype-only commercial/operations extensions (experience-oriented).
   * NOT production billing architecture.
   */
  onboardingState?: OnboardingState;
  trialAllowanceTotal?: number;
  commercialStanding?: CommercialStanding;
  paidActive?: boolean;
  paidActivatedAt?: string;
  paidActivationRef?: string;
  manualActivation?: ManualActivationRecord;
  operatorNote?: string;
}

export interface ProgrammeRules {
  allowMultipleUnits: boolean;
  maxUnitsPerTx: number;
  requireApprovalAbove: number;
  customerConfirmation: boolean;
  allowBackdated: boolean;
}

export interface LoyaltyProgramme {
  id: string;
  orgId: string;
  name: string;
  category: string;
  description: string;
  qualifyingItemName: string;
  sellingPrice: number;
  currency: string;
  status: ProgrammeStatus;
  rules: ProgrammeRules;
  requiredSteps: number; // Default 10
  rewardDescription: string;
  totalParticipants: number;
  activeCycles: number;
  completedRewardsCount: number;
  createdAt: string;
}

export interface ParticipantRelationship {
  id: string;
  customerId: string;
  programmeId: string;
  orgId: string;
  currentCycle: number;
  approvedSteps: number; // 0 - 10
  pendingSteps: number;
  rewardAvailable: boolean;
  rewardCode?: string;
  totalCompletedCycles: number;
  totalRedeemedRewards: number;
  lastActivityAt: string;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  orgId: string;
  programmeId: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  quantity: number;
  type: TransactionType;
  status: TransactionStatus;
  pendingReason?: string;
  rejectionReason?: string;
  correctionReason?: string;
  originalTxId?: string;
  cycleBefore: number;
  cycleAfter: number;
  stepsBefore: number;
  stepsAfter: number;
  rewardTriggered?: boolean;
  notes?: string;
  createdAt: string;
}

export interface CompletedReward {
  id: string;
  orgId: string;
  orgName: string;
  programmeId: string;
  programmeName: string;
  customerId: string;
  customerName: string;
  rewardCode: string;
  rewardTitle: string;
  cycleNumber: number;
  earnedAt: string;
  redeemedAt?: string;
  redeemedByStaffId?: string;
  redeemedByStaffName?: string;
  status: 'available' | 'redeemed';
}

export interface ApprovalItem {
  id: string;
  transactionId: string;
  orgId: string;
  customerId: string;
  customerName: string;
  programmeId: string;
  programmeName: string;
  quantity: number;
  staffId: string;
  staffName: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface IntegrityCase {
  id: string;
  caseNumber: string;
  orgId: string;
  orgName: string;
  participantId?: string;
  participantName?: string;
  flagType: 'unusual_velocity' | 'repeated_reversals' | 'unusual_quantity' | 'staff_pattern' | 'policy_violation';
  reason: string;
  evidence: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  assignedOperator: string;
  createdAt: string;
  investigationNotes?: string;
  resolutionNotes?: string;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  requesterName: string;
  requesterRole: 'business' | 'participant' | 'internal';
  category: 'missing_purchase' | 'reward_dispute' | 'access_recovery' | 'billing_query' | 'setup_issue';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  assignedOperator: string;
  createdAt: string;
  title: string;
  description: string;
  linkedOrgId?: string;
  linkedOrgName?: string;
  investigationNotes?: string;
  resolutionNotes?: string;
}

export interface CommercialRecord {
  id: string;
  orgId: string;
  orgName: string;
  completedCircleId: string;
  unitAmountUSD: number;
  coverageType: 'trial' | 'paid_credit';
  recordedAt: string;
  status: 'settled' | 'pending';
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  timestamp: string;
  previousState?: string;
  newState?: string;
}

export interface MarketConfig {
  id: string;
  country: string;
  code: string;
  currency: string;
  defaultLanguage: 'en' | 'fr';
  activeBusinessesCount: number;
  status: 'active' | 'beta' | 'planned';
}

export type AppLanguage = 'en' | 'fr';
