export type VisaType = 'umrah' | 'tourist' | 'hajj' | 'business' | 'family'
export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'on_hold'

export interface VisaApplication {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  first_name?: string | null
  last_name?: string | null
  email: string
  phone: string
  country: string
  nationality?: string | null
  passport_number?: string | null
  passport_expiry?: string | null
  date_of_birth?: string | null
  visa_type: VisaType
  service_id?: string | null
  travel_date: string | null
  num_travelers?: number | null
  departure_city?: string | null
  message: string | null
  status: ApplicationStatus
  reference_number: string
  consultant_notes: string | null
  assigned_to: string | null
  passport_url?: string | null
  id_card_url?: string | null
  photo_url?: string | null
  amount_usd?: number | null
  stripe_payment_intent_id?: string | null
}

export interface ContactMessage {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  read: boolean
}

export interface Testimonial {
  id: string
  created_at: string
  author_name: string
  author_initial: string
  visa_type: string
  content: string
  rating: number
  visible: boolean
  display_order: number
}
