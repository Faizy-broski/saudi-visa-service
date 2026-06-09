'use server'

import { createClient } from '@/lib/supabase/server'
import { Testimonial } from '@/lib/types/database'

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('visible', true)
    .order('display_order', { ascending: true })

  return data || []
}
