/**
 * Centralised redemption experience copy (prototype-only).
 * English is primary. French keys are structural placeholders so layouts
 * stay length-tolerant and a future pass can fill translations without
 * hunting hard-coded strings across components.
 */
export type RedemptionCopyKey =
  | 'rewardReadyTitle'
  | 'confirmAction'
  | 'confirmSheetTitle'
  | 'needsAuthorisedMember'
  | 'authorityRevoked'
  | 'successTitle'
  | 'alreadyRedeemed'
  | 'participantCodeCta'
  | 'participantCodeHelp';

export const REDEMPTION_COPY: Record<'en', Record<RedemptionCopyKey, string>> = {
  en: {
    rewardReadyTitle: 'reward is ready',
    confirmAction: 'Confirm reward provided',
    confirmSheetTitle: 'Confirm reward provided?',
    needsAuthorisedMember:
      'A manager or authorised team member needs to confirm this reward.',
    authorityRevoked:
      'You no longer have permission to confirm this reward. Ask an authorised team member.',
    successTitle: "This one's on us.",
    alreadyRedeemed: 'This reward has already been redeemed.',
    participantCodeCta: 'Show my 11thONUS code',
    participantCodeHelp:
      'Show your code at the counter. An authorised team member will confirm your reward after it is provided.'
  }
};
