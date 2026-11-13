import { apiFetch } from './client'
import type { MerchantList, MerchantSummary, Me } from '@/types/api'

export function getMe(): Promise<Me> {
  return apiFetch<Me>('/ui/me')
}

export async function listMerchants(): Promise<MerchantSummary[]> {
  const data = await apiFetch<MerchantList>('/ui/merchants')
  return data.merchants
}
