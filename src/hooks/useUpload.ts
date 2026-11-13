'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/keys'
import { uploadPos } from '@/lib/api/uploads'

export function useUpload(merchantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadPos(merchantId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.merchants }),
  })
}
