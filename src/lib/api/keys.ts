export const queryKeys = {
  me: ['me'] as const,
  merchants: ['merchants'] as const,
  run: (runId: string) => ['run', runId] as const,
  review: (merchantId: string) => ['review', merchantId] as const,
  audit: (merchantId: string, filters: unknown) => ['audit', merchantId, filters] as const,
  killSwitch: ['kill-switch'] as const,
  metrics: ['metrics'] as const,
}
