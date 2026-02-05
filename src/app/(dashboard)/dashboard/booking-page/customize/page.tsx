import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomizePageClient } from './CustomizePageClient'
import type { Business } from '@/types/database.types'

export default async function CustomizePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard/settings')
  }

  return <CustomizePageClient business={business as Business} />
}
