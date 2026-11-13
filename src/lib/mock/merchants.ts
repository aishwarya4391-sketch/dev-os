import type { MerchantSummary, Me } from '@/types/api'

// Contract-shaped sample data used by the local mock API (NEXT_PUBLIC_USE_MOCK_API=true).
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export const mockMerchants: MerchantSummary[] = [
  {
    merchant_id: 'M-1001',
    name: "Luigi's Pizzeria",
    autonomy: 'suggest',
    last_run_at: hoursAgo(3),
    last_run_status: 'succeeded',
    pending_count: 6,
    has_upload: true,
    active_run_id: null,
  },
  {
    merchant_id: 'M-1002',
    name: 'Green Bowl Kitchen',
    autonomy: 'auto_low_risk',
    last_run_at: hoursAgo(26),
    last_run_status: 'succeeded',
    pending_count: 0,
    has_upload: true,
    active_run_id: null,
  },
  {
    merchant_id: 'M-1003',
    name: 'Taco Corner',
    autonomy: 'shadow',
    last_run_at: null,
    last_run_status: null,
    pending_count: 0,
    has_upload: false,
    active_run_id: null,
  },
  {
    merchant_id: 'M-1004',
    name: 'Sakura Sushi',
    autonomy: 'suggest',
    last_run_at: hoursAgo(1),
    last_run_status: 'running',
    pending_count: 2,
    has_upload: true,
    active_run_id: 'run-demo-1004',
  },
  {
    merchant_id: 'M-1005',
    name: 'Burger Barn',
    autonomy: 'shadow',
    last_run_at: hoursAgo(72),
    last_run_status: 'failed',
    pending_count: 0,
    has_upload: true,
    active_run_id: null,
  },
]

export const mockMe: Me = {
  user_id: '00000000-0000-0000-0000-000000000000',
  email: 'mock@example.com',
  role: 'admin',
}
