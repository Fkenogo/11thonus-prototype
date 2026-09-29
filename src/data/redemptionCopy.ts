/**
 * Centralised redemption experience copy (prototype-only).
 * English is primary. French keys are structural placeholders so layouts
 * stay length-tolerant and a future pass can fill translations without
 * hunting hard-coded strings across components.
 *
 * Voice: short, human, calm. No system jargon, no internal permission
 * vocabulary, consistent terms across roles ("reward", "confirm", "provide").
 */
export type RedemptionCopyKey =
  | 'rewardReadyTitle'
  | 'rewardReadyEyebrow'
  | 'confirmAction'
  | 'confirmSheetTitle'
  | 'confirmSheetHelp'
  | 'needsAuthorisedMember'
  | 'authorityRevoked'
  | 'accountSuspended'
  | 'successTitle'
  | 'successConfirmedLine'
  | 'successNextLine'
  | 'nextProgressLabel'
  | 'serveNext'
  | 'alreadyRedeemed'
  | 'alreadyRedeemedStrip'
  | 'participantCodeCta'
  | 'participantCodeHelp'
  | 'participantRedeemedAck'
  | 'recordInstead';

export const REDEMPTION_COPY: Record<'en', Record<RedemptionCopyKey, string>> = {
  en: {
    rewardReadyTitle: 'reward is ready',
    rewardReadyEyebrow: 'Reward ready',
    confirmAction: 'Confirm reward provided',
    confirmSheetTitle: 'Confirm reward provided?',
    confirmSheetHelp:
      'After the reward has been provided, confirm it here. No customer tap is needed.',
    needsAuthorisedMember:
      'A manager or authorised team member needs to confirm this reward.',
    authorityRevoked:
      'You no longer have permission to confirm this reward. Ask an authorised team member.',
    accountSuspended:
      'This account is suspended and cannot confirm rewards.',
    successTitle: "This one's on us.",
    successConfirmedLine: 'was provided.',
    successNextLine: 'can start earning toward the next reward now.',
    nextProgressLabel: 'toward the next reward',
    serveNext: 'Serve next customer',
    alreadyRedeemed: 'This reward has already been redeemed.',
    alreadyRedeemedStrip:
      'New visits count normally from here.',
    participantCodeCta: 'Show my 11thONUS code',
    participantCodeHelp:
      'Show your code at the counter. An authorised team member will confirm your reward after it is provided.',
    participantRedeemedAck: 'reward enjoyed — your next 10 starts now.',
    recordInstead: 'Record purchase instead'
  }
};
