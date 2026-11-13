export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

// With the mock flag on, the UI talks to the local mock route handlers instead of the Azure web app.
export const API_BASE_URL = USE_MOCK_API ? '/api/mock' : (process.env.NEXT_PUBLIC_API_BASE_URL ?? '')

export const POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_API_POLL_INTERVAL_MS) || 2000
