import {
  Organisation,
  LoyaltyProgramme,
  User,
  ParticipantRelationship,
  Transaction,
  CompletedReward,
  ApprovalItem,
  IntegrityCase,
  SupportCase,
  CommercialRecord,
  AuditLogEntry,
  MarketConfig
} from '../types';

export const INITIAL_ORGANISATIONS: Organisation[] = [
  {
    id: 'org-bella-salon',
    name: 'Bella Salon',
    category: 'Beauty & Personal Care',
    country: 'Burundi',
    city: 'Bujumbura',
    address: 'Boulevard de la Liberté, Rohero I',
    phone: '+257 22 24 55 10',
    email: 'contact@bellasalon.bi',
    currency: 'BIF',
    status: 'active',
    logoText: 'BS',
    primaryContact: 'Grace Ndayishimiye',
    trialCirclesRemaining: 18,
    completedBillableCircles: 32,
    creditBalanceUSD: 45.0,
    lowCreditAlert: false,
    gracePeriodActive: false,
    createdAt: '2026-03-12'
  },
  {
    id: 'org-joes-coffee',
    name: "Joe's Coffee",
    category: 'Food & Beverage',
    country: 'Rwanda',
    city: 'Kigali',
    address: 'KG 9 Ave, Nyarutarama',
    phone: '+250 788 345 678',
    email: 'hello@joescoffee.rw',
    currency: 'RWF',
    status: 'active',
    logoText: 'JC',
    primaryContact: 'Joseph Kamanzi',
    trialCirclesRemaining: 4,
    completedBillableCircles: 86,
    creditBalanceUSD: 12.0,
    lowCreditAlert: false,
    gracePeriodActive: false,
    createdAt: '2026-01-20'
  },
  {
    id: 'org-sparkle-wash',
    name: 'Sparkle Car Wash',
    category: 'Automotive Services',
    country: 'Burundi',
    city: 'Bujumbura',
    address: 'Chaussée du Peuple Murundi',
    phone: '+257 79 98 12 34',
    email: 'sparkle@wash.bi',
    currency: 'BIF',
    status: 'active',
    logoText: 'SW',
    primaryContact: 'Christian Bizimana',
    trialCirclesRemaining: 0,
    completedBillableCircles: 14,
    creditBalanceUSD: 3.0,
    lowCreditAlert: true,
    gracePeriodActive: true,
    createdAt: '2026-05-18'
  },
  {
    id: 'org-kivu-bistro',
    name: 'Kivu Fresh Bistro',
    category: 'Food & Beverage',
    country: 'Rwanda',
    city: 'Rubavu',
    address: 'Lakefront Promenade',
    phone: '+250 782 112 233',
    email: 'info@kivubistro.rw',
    currency: 'RWF',
    status: 'onboarding',
    logoText: 'KB',
    primaryContact: 'Alain Mugabe',
    trialCirclesRemaining: 50,
    completedBillableCircles: 0,
    creditBalanceUSD: 0.0,
    lowCreditAlert: false,
    gracePeriodActive: false,
    createdAt: '2026-09-14'
  }
];

export const INITIAL_PROGRAMMES: LoyaltyProgramme[] = [
  {
    id: 'prog-bella-premium',
    orgId: 'org-bella-salon',
    name: 'Premium Haircut & Styling',
    category: 'Salon Treatment',
    description: 'Complete wash, treatment, custom cut and signature styling session.',
    qualifyingItemName: 'Premium Haircut',
    sellingPrice: 35000,
    currency: 'BIF',
    status: 'active',
    rules: {
      allowMultipleUnits: true,
      maxUnitsPerTx: 3,
      requireApprovalAbove: 2,
      customerConfirmation: false,
      allowBackdated: false
    },
    requiredSteps: 10,
    rewardDescription: '11th Premium Haircut & Styling is on Bella Salon',
    totalParticipants: 48,
    activeCycles: 37,
    completedRewardsCount: 19,
    createdAt: '2026-03-15'
  },
  {
    id: 'prog-bella-standard',
    orgId: 'org-bella-salon',
    name: 'Standard Haircut',
    category: 'Barber & Cut',
    description: 'Standard precision cut, beard trim and natural oil finish.',
    qualifyingItemName: 'Standard Haircut',
    sellingPrice: 20000,
    currency: 'BIF',
    status: 'active',
    rules: {
      allowMultipleUnits: true,
      maxUnitsPerTx: 2,
      requireApprovalAbove: 2,
      customerConfirmation: false,
      allowBackdated: false
    },
    requiredSteps: 10,
    rewardDescription: '11th Standard Haircut is on Bella Salon',
    totalParticipants: 62,
    activeCycles: 51,
    completedRewardsCount: 13,
    createdAt: '2026-04-01'
  },
  {
    id: 'prog-bella-manicure',
    orgId: 'org-bella-salon',
    name: 'Deluxe Manicure',
    category: 'Nail Care',
    description: 'Nourishing botanical scrub, shaping, and premium polish.',
    qualifyingItemName: 'Deluxe Manicure',
    sellingPrice: 25000,
    currency: 'BIF',
    status: 'draft',
    rules: {
      allowMultipleUnits: true,
      maxUnitsPerTx: 2,
      requireApprovalAbove: 2,
      customerConfirmation: false,
      allowBackdated: false
    },
    requiredSteps: 10,
    rewardDescription: '11th Deluxe Manicure is on Bella Salon',
    totalParticipants: 0,
    activeCycles: 0,
    completedRewardsCount: 0,
    createdAt: '2026-09-02'
  },
  {
    id: 'prog-joes-cappuccino',
    orgId: 'org-joes-coffee',
    name: 'Large Cappuccino',
    category: 'Specialty Coffee',
    description: 'Artisan single-origin espresso with silky steamed whole milk.',
    qualifyingItemName: 'Large Cappuccino',
    sellingPrice: 4500,
    currency: 'RWF',
    status: 'active',
    rules: {
      allowMultipleUnits: true,
      maxUnitsPerTx: 4,
      requireApprovalAbove: 3,
      customerConfirmation: false,
      allowBackdated: false
    },
    requiredSteps: 10,
    rewardDescription: "11th Large Cappuccino is on Joe's Coffee",
    totalParticipants: 114,
    activeCycles: 92,
    completedRewardsCount: 41,
    createdAt: '2026-01-22'
  },
  {
    id: 'prog-sparkle-suv',
    orgId: 'org-sparkle-wash',
    name: 'SUV Thorough Wash',
    category: 'Car Detailing',
    description: 'High-pressure foam exterior wash, rim polish and interior vacuuming.',
    qualifyingItemName: 'SUV Wash',
    sellingPrice: 30000,
    currency: 'BIF',
    status: 'active',
    rules: {
      allowMultipleUnits: false,
      maxUnitsPerTx: 1,
      requireApprovalAbove: 1,
      customerConfirmation: false,
      allowBackdated: false
    },
    requiredSteps: 10,
    rewardDescription: '11th SUV Thorough Wash is on Sparkle Car Wash',
    totalParticipants: 29,
    activeCycles: 22,
    completedRewardsCount: 7,
    createdAt: '2026-05-20'
  }
];

export const INITIAL_USERS: User[] = [
  // Bella Salon Team
  {
    id: 'user-grace-owner',
    name: 'Grace Ndayishimiye',
    email: 'grace@bellasalon.bi',
    phone: '+257 79 11 22 33',
    role: 'business_owner',
    orgId: 'org-bella-salon',
    initials: 'GN',
    title: 'Founder & Owner',
    active: true
  },
  {
    id: 'user-patrick-manager',
    name: 'Patrick Mugabo',
    email: 'patrick@bellasalon.bi',
    phone: '+257 71 44 55 66',
    role: 'business_manager',
    orgId: 'org-bella-salon',
    initials: 'PM',
    title: 'Salon Operations Manager',
    active: true
  },
  {
    id: 'user-diane-staff',
    name: 'Diane Kezimana',
    email: 'diane@bellasalon.bi',
    phone: '+257 76 88 99 00',
    role: 'frontline_staff',
    orgId: 'org-bella-salon',
    initials: 'DK',
    title: 'Senior Stylist & Frontline',
    active: true
  },
  // Participant
  {
    id: 'user-amina-participant',
    name: 'Amina Niyonsaba',
    email: 'amina.n@gmail.com',
    phone: '+257 79 88 44 11',
    role: 'participant',
    onusId: 'ONUS-8821-AMINA',
    initials: 'AN',
    title: 'Loyalty Member',
    active: true
  },
  // Additional sample participants
  {
    id: 'user-jeanluc-participant',
    name: 'Jean-Luc Tuyisenge',
    email: 'jl.tuyi@yahoo.fr',
    phone: '+257 72 33 66 99',
    role: 'participant',
    onusId: 'ONUS-5542-JEANL',
    initials: 'JT',
    title: 'Loyalty Member',
    active: true
  },
  {
    id: 'user-francine-participant',
    name: 'Francine Kwizera',
    email: 'f.kwizera@outlook.com',
    phone: '+257 79 40 20 80',
    role: 'participant',
    onusId: 'ONUS-3190-FRANC',
    initials: 'FK',
    title: 'Loyalty Member',
    active: true
  },
  // 11thONUS Platform Operator
  {
    id: 'user-marcus-operator',
    name: 'Marcus Touré',
    email: 'marcus.toure@11thonus.com',
    phone: '+250 790 001 100',
    role: 'platform_operator',
    operatorRole: 'platform_admin',
    initials: 'MT',
    title: 'Platform Lead & Trust Architect',
    active: true
  }
];

export const INITIAL_RELATIONSHIPS: ParticipantRelationship[] = [
  {
    id: 'rel-amina-bella-premium',
    customerId: 'user-amina-participant',
    programmeId: 'prog-bella-premium',
    orgId: 'org-bella-salon',
    currentCycle: 1,
    approvedSteps: 8,
    pendingSteps: 0,
    rewardAvailable: false,
    totalCompletedCycles: 0,
    totalRedeemedRewards: 0,
    lastActivityAt: '2026-09-15T14:30:00Z',
    joinedAt: '2026-04-10T10:00:00Z'
  },
  {
    id: 'rel-amina-joes-cappuccino',
    customerId: 'user-amina-participant',
    programmeId: 'prog-joes-cappuccino',
    orgId: 'org-joes-coffee',
    currentCycle: 1,
    approvedSteps: 10,
    pendingSteps: 0,
    rewardAvailable: true,
    rewardCode: 'JC-ONUS-RW99',
    totalCompletedCycles: 1,
    totalRedeemedRewards: 0,
    lastActivityAt: '2026-09-16T09:15:00Z',
    joinedAt: '2026-02-05T08:30:00Z'
  },
  {
    id: 'rel-amina-sparkle-suv',
    customerId: 'user-amina-participant',
    programmeId: 'prog-sparkle-suv',
    orgId: 'org-sparkle-wash',
    currentCycle: 1,
    approvedSteps: 3,
    pendingSteps: 0,
    rewardAvailable: false,
    totalCompletedCycles: 0,
    totalRedeemedRewards: 0,
    lastActivityAt: '2026-09-08T16:00:00Z',
    joinedAt: '2026-06-01T11:20:00Z'
  },
  {
    id: 'rel-jeanluc-bella-standard',
    customerId: 'user-jeanluc-participant',
    programmeId: 'prog-bella-standard',
    orgId: 'org-bella-salon',
    currentCycle: 1,
    approvedSteps: 6,
    pendingSteps: 1, // Has a pending approval item
    rewardAvailable: false,
    totalCompletedCycles: 0,
    totalRedeemedRewards: 0,
    lastActivityAt: '2026-09-17T08:20:00Z',
    joinedAt: '2026-04-15T14:00:00Z'
  },
  {
    id: 'rel-francine-bella-premium',
    customerId: 'user-francine-participant',
    programmeId: 'prog-bella-premium',
    orgId: 'org-bella-salon',
    currentCycle: 2,
    approvedSteps: 4,
    pendingSteps: 0,
    rewardAvailable: false,
    totalCompletedCycles: 1,
    totalRedeemedRewards: 1,
    lastActivityAt: '2026-09-14T11:45:00Z',
    joinedAt: '2026-03-20T09:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    orgId: 'org-bella-salon',
    programmeId: 'prog-bella-premium',
    customerId: 'user-amina-participant',
    customerName: 'Amina Niyonsaba',
    staffId: 'user-diane-staff',
    staffName: 'Diane Kezimana',
    quantity: 1,
    type: 'qualifying_purchase',
    status: 'approved',
    cycleBefore: 1,
    cycleAfter: 1,
    stepsBefore: 7,
    stepsAfter: 8,
    createdAt: '2026-09-15T14:30:00Z'
  },
  {
    id: 'tx-100',
    orgId: 'org-bella-salon',
    programmeId: 'prog-bella-premium',
    customerId: 'user-amina-participant',
    customerName: 'Amina Niyonsaba',
    staffId: 'user-diane-staff',
    staffName: 'Diane Kezimana',
    quantity: 1,
    type: 'qualifying_purchase',
    status: 'approved',
    cycleBefore: 1,
    cycleAfter: 1,
    stepsBefore: 6,
    stepsAfter: 7,
    createdAt: '2026-09-02T11:15:00Z'
  },
  {
    id: 'tx-099',
    orgId: 'org-bella-salon',
    programmeId: 'prog-bella-standard',
    customerId: 'user-jeanluc-participant',
    customerName: 'Jean-Luc Tuyisenge',
    staffId: 'user-diane-staff',
    staffName: 'Diane Kezimana',
    quantity: 3,
    type: 'qualifying_purchase',
    status: 'pending_approval',
    pendingReason: 'Recorded 3 units in a single visit (threshold is 2)',
    cycleBefore: 1,
    cycleAfter: 1,
    stepsBefore: 6,
    stepsAfter: 6,
    notes: 'Family visit, paid for brother and nephew',
    createdAt: '2026-09-17T08:20:00Z'
  },
  {
    id: 'tx-098',
    orgId: 'org-bella-salon',
    programmeId: 'prog-bella-premium',
    customerId: 'user-francine-participant',
    customerName: 'Francine Kwizera',
    staffId: 'user-patrick-manager',
    staffName: 'Patrick Mugabo',
    quantity: 1,
    type: 'reward_redemption',
    status: 'approved',
    cycleBefore: 1,
    cycleAfter: 2,
    stepsBefore: 10,
    stepsAfter: 0,
    notes: 'Redeemed completed Circle 1 reward. Started Circle 2.',
    createdAt: '2026-08-28T16:45:00Z'
  },
  {
    id: 'tx-097',
    orgId: 'org-joes-coffee',
    programmeId: 'prog-joes-cappuccino',
    customerId: 'user-amina-participant',
    customerName: 'Amina Niyonsaba',
    staffId: 'staff-joe-1',
    staffName: 'Barista Eric',
    quantity: 1,
    type: 'qualifying_purchase',
    status: 'approved',
    cycleBefore: 1,
    cycleAfter: 1,
    stepsBefore: 9,
    stepsAfter: 10,
    rewardTriggered: true,
    notes: 'Completed 10th qualifying coffee. Reward generated.',
    createdAt: '2026-09-16T09:15:00Z'
  }
];

export const INITIAL_COMPLETED_REWARDS: CompletedReward[] = [
  {
    id: 'rew-amina-joes-1',
    orgId: 'org-joes-coffee',
    orgName: "Joe's Coffee",
    programmeId: 'prog-joes-cappuccino',
    programmeName: 'Large Cappuccino',
    customerId: 'user-amina-participant',
    customerName: 'Amina Niyonsaba',
    rewardCode: 'JC-ONUS-RW99',
    rewardTitle: 'Large Cappuccino on Joe’s Coffee',
    cycleNumber: 1,
    earnedAt: '2026-09-16T09:15:00Z',
    status: 'available'
  },
  {
    id: 'rew-francine-bella-1',
    orgId: 'org-bella-salon',
    orgName: 'Bella Salon',
    programmeId: 'prog-bella-premium',
    programmeName: 'Premium Haircut & Styling',
    customerId: 'user-francine-participant',
    customerName: 'Francine Kwizera',
    rewardCode: 'BS-ONUS-7712',
    rewardTitle: 'Premium Haircut & Styling on Bella Salon',
    cycleNumber: 1,
    earnedAt: '2026-08-25T14:00:00Z',
    redeemedAt: '2026-08-28T16:45:00Z',
    redeemedByStaffId: 'user-patrick-manager',
    redeemedByStaffName: 'Patrick Mugabo',
    status: 'redeemed'
  }
];

export const INITIAL_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: 'appr-099',
    transactionId: 'tx-099',
    orgId: 'org-bella-salon',
    customerId: 'user-jeanluc-participant',
    customerName: 'Jean-Luc Tuyisenge',
    programmeId: 'prog-bella-standard',
    programmeName: 'Standard Haircut',
    quantity: 3,
    staffId: 'user-diane-staff',
    staffName: 'Diane Kezimana',
    requestedAt: '2026-09-17T08:20:00Z',
    reason: 'Multi-unit purchase (3 units recorded in single receipt exceeds standard limit of 2)',
    status: 'pending'
  }
];

export const INITIAL_INTEGRITY_CASES: IntegrityCase[] = [
  {
    id: 'int-041',
    caseNumber: 'FLG-2026-041',
    orgId: 'org-sparkle-wash',
    orgName: 'Sparkle Car Wash',
    participantId: 'user-samuel-temp',
    participantName: 'Samuel B.',
    flagType: 'unusual_velocity',
    reason: 'Rapid repeated visits: 4 SUV Wash transactions logged within 90 minutes by the same staff operator.',
    evidence: 'Staff ID: SW-STAFF-03 logged transactions at 14:10, 14:32, 15:05, and 15:40 on Sept 14th.',
    status: 'under_review',
    priority: 'high',
    assignedOperator: 'Marcus Touré',
    createdAt: '2026-09-14T16:00:00Z',
    resolutionNotes: 'Contacted business manager Christian B. to verify group fleet washing contract.'
  },
  {
    id: 'int-039',
    caseNumber: 'FLG-2026-039',
    orgId: 'org-bella-salon',
    orgName: 'Bella Salon',
    flagType: 'repeated_reversals',
    reason: 'Manual reversal rate exceeded 3% threshold for the week.',
    evidence: 'Two transaction corrections performed consecutively on Sep 10th by staff member Diane K. for typo adjustment.',
    status: 'resolved',
    priority: 'low',
    assignedOperator: 'Marcus Touré',
    createdAt: '2026-09-11T10:00:00Z',
    resolutionNotes: 'Reviewed with manager Patrick M. Verified honest cashier typo on price tier.'
  }
];

export const INITIAL_SUPPORT_CASES: SupportCase[] = [
  {
    id: 'sup-104',
    caseNumber: 'SUP-8802',
    requesterName: 'Amina Niyonsaba',
    requesterRole: 'participant',
    category: 'missing_purchase',
    priority: 'medium',
    status: 'open',
    assignedOperator: 'Marcus Touré',
    createdAt: '2026-09-16T18:00:00Z',
    title: 'Question regarding pending stamp for manicure',
    description: 'Visited Bella Salon on Tuesday. Was told deluxe manicure might launch soon. Wondering if my visit can count once programme activates.',
    linkedOrgId: 'org-bella-salon',
    linkedOrgName: 'Bella Salon'
  },
  {
    id: 'sup-101',
    caseNumber: 'SUP-8794',
    requesterName: 'Joseph Kamanzi',
    requesterRole: 'business',
    category: 'billing_query',
    priority: 'low',
    status: 'resolved',
    assignedOperator: 'Marcus Touré',
    createdAt: '2026-09-12T09:00:00Z',
    title: 'Inquiry regarding 10+1 circle credit settlement',
    description: "Requested explanation of how completed circles are deducted from current account balance when trial ends.",
    linkedOrgId: 'org-joes-coffee',
    linkedOrgName: "Joe's Coffee",
    resolutionNotes: 'Explained consumption model ($1 per completed 10+1 unit). Sent statement breakdown.'
  }
];

export const INITIAL_COMMERCIAL_RECORDS: CommercialRecord[] = [
  {
    id: 'comm-881',
    orgId: 'org-bella-salon',
    orgName: 'Bella Salon',
    completedCircleId: 'circ-bs-032',
    unitAmountUSD: 1.0,
    coverageType: 'paid_credit',
    recordedAt: '2026-09-15T16:00:00Z',
    status: 'settled'
  },
  {
    id: 'comm-880',
    orgId: 'org-joes-coffee',
    orgName: "Joe's Coffee",
    completedCircleId: 'circ-jc-086',
    unitAmountUSD: 1.0,
    coverageType: 'paid_credit',
    recordedAt: '2026-09-16T09:15:00Z',
    status: 'settled'
  },
  {
    id: 'comm-879',
    orgId: 'org-bella-salon',
    orgName: 'Bella Salon',
    completedCircleId: 'circ-bs-031',
    unitAmountUSD: 1.0,
    coverageType: 'trial',
    recordedAt: '2026-08-25T14:00:00Z',
    status: 'settled'
  }
];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-001',
    actorName: 'Marcus Touré',
    actorRole: 'Platform Administrator',
    action: 'ORGANISATION_STATUS_UPDATE',
    targetType: 'Organisation',
    targetId: 'org-sparkle-wash',
    reason: 'Enabled grace period on commercial threshold after owner inquiry',
    timestamp: '2026-09-15T11:00:00Z',
    previousState: 'gracePeriodActive: false',
    newState: 'gracePeriodActive: true'
  },
  {
    id: 'aud-002',
    actorName: 'Patrick Mugabo',
    actorRole: 'Business Manager',
    action: 'PROGRAMME_RULES_AMENDMENT',
    targetType: 'LoyaltyProgramme',
    targetId: 'prog-bella-premium',
    reason: 'Configured approval threshold to trigger on 3+ units per receipt',
    timestamp: '2026-09-01T14:30:00Z'
  },
  {
    id: 'aud-003',
    actorName: 'Grace Ndayishimiye',
    actorRole: 'Business Owner',
    action: 'STAFF_ROLE_ASSIGNMENT',
    targetType: 'User',
    targetId: 'user-diane-staff',
    reason: 'Promoted Diane Kezimana to Senior Frontline Staff with multi-unit entry permissions',
    timestamp: '2026-06-10T09:15:00Z'
  }
];

export const INITIAL_MARKETS: MarketConfig[] = [
  {
    id: 'mkt-bi',
    country: 'Burundi',
    code: 'BDI',
    currency: 'BIF',
    defaultLanguage: 'fr',
    activeBusinessesCount: 24,
    status: 'active'
  },
  {
    id: 'mkt-rw',
    country: 'Rwanda',
    code: 'RWA',
    currency: 'RWF',
    defaultLanguage: 'en',
    activeBusinessesCount: 38,
    status: 'active'
  },
  {
    id: 'mkt-cd',
    country: 'DR Congo (East)',
    code: 'COD',
    currency: 'USD',
    defaultLanguage: 'fr',
    activeBusinessesCount: 8,
    status: 'beta'
  },
  {
    id: 'mkt-tz',
    country: 'Tanzania',
    code: 'TZA',
    currency: 'TZS',
    defaultLanguage: 'en',
    activeBusinessesCount: 0,
    status: 'planned'
  }
];
