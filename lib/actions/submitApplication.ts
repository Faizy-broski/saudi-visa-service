'use server'

import { createClient } from '@/lib/supabase/server'
import { VisaType } from '@/lib/types/database'

export type ApplicationFormData = {
  full_name: string
  email: string
  phone: string
  country: string
  visa_type: VisaType
  travel_date?: string
  message?: string
}

export type SubmitApplicationResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: string }

export async function submitApplication(
  data: ApplicationFormData
): Promise<SubmitApplicationResult> {
  try {
    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from('visa_applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        visa_type: data.visa_type,
        travel_date: data.travel_date || null,
        message: data.message || null,
      })
      .select('reference_number')
      .single()

    if (error || !result) {
      return { success: false, error: 'Failed to submit application. Please try again.' }
    }

    return { success: true, referenceNumber: result.reference_number }
  } catch {
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
