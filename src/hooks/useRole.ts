'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/supabase-browser'
import { hasRole, roleFromUser, type Role } from '@/lib/auth/roles'

export function useRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setRole(roleFromUser(data.user))
      setLoading(false)
    })
  }, [])

  return { role, loading, isLead: hasRole(role, 'lead'), isAdmin: hasRole(role, 'admin') }
}
