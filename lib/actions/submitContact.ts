'use server'

import { createClient } from '@/lib/supabase/server'

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export type SubmitContactResult =
  | { success: true }
  | { success: false; error: string }

export async function submitContact(
  data: ContactFormData
): Promise<SubmitContactResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    })

    if (error) {
      return { success: false, error: 'Failed to send message. Please try again.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
