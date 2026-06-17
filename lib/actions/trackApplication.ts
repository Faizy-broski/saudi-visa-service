'use server'

import { createClient } from '@/lib/supabase/server'
import { VisaApplication } from '@/lib/types/database'

export type TrackResult =
  | { success: true; application: VisaApplication }
  | { success: false; error: string }

export async function trackApplication(
  referenceNumber: string
): Promise<TrackResult> {
  if (!referenceNumber.trim()) {
    return { success: false, error: 'Please enter a reference number.' }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .ilike('reference_number', referenceNumber.trim())
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'No application found with this reference number.',
      }
    }

    return { success: true, application: data }
  } catch {
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
