'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/keys'
import { listMerchants } from '@/lib/api/merchants'

export function useMerchants() {
  return useQuery({ queryKey: queryKeys.merchants, queryFn: listMerchants })
}
