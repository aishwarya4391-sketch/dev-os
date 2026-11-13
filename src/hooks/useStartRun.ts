'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '@/lib/api/keys'
import { startRun } from '@/lib/api/runs'

export function useStartRun(merchantId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uploadId?: string) => startRun(merchantId, uploadId),
    onSuccess: ({ run_id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.merchants })
      router.push(`/merchants/${merchantId}/runs/${run_id}`)
    },
  })
}
