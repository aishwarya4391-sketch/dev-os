export const authCopy = {
  invalidCredentials: 'Invalid email or password.',
  emailNotVerified: 'Verify your email to continue.',
  emailTaken: 'An account with this email already exists.',
  network: "Can't reach the sign-in service. Try again.",
  forbidden: "You don't have access to this.",
  verifySent: 'We sent a verification link to your email. Open it to finish signing up.',
  verifyResent: 'Verification email sent again.',
} as const

export const merchantsCopy = {
  empty: 'No merchants assigned.',
  noMatches: (query: string) => `No merchants match "${query}".`,
  loadFailed: "We couldn't load your merchants. Try again.",
  forbidden: "You don't have access to this.",
  notConfigured:
    'The web app address is not set. Set NEXT_PUBLIC_API_BASE_URL, or turn on NEXT_PUBLIC_USE_MOCK_API for local development.',
} as const

export const uploadCopy = {
  invalidFile: 'Upload a CSV or JSON file up to 5 MB.',
  wrongMerchant: 'This file is for a different merchant. Check the merchant ID and try again.',
  fileTooLarge: 'Upload a CSV or JSON file up to 5 MB.',
  noUpload: (merchantId: string) => `Upload a POS export for ${merchantId} first.`,
  runInProgress: (merchantId: string) => `A run for ${merchantId} is already in progress.`,
  rejectedRows: (n: number) => `${n} ${n === 1 ? 'row was' : 'rows were'} rejected.`,
  accepted: (accepted: number, total: number) => `${accepted} of ${total} rows accepted.`,
} as const

export const runCopy = {
  unavailable: "We couldn't finish this run. Nothing was changed. Try again in a few minutes.",
  rolledBack: (items: number, verified: boolean) =>
    `This batch was rolled back. All ${items} items are back to their previous values${verified ? ' (verified)' : ''}.`,
  rollbackUnverified: 'Restoration could not be verified. Check the audit rows.',
  explanationLabel: 'AI-generated explanation',
  steps: {
    reading_upload: 'Reading upload',
    matching: 'Matching items',
    staging: 'Staging changes',
    routing: 'Routing',
    committing: 'Committing',
    verifying: 'Verifying',
  },
} as const
