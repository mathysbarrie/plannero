export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          timezone: string
          buffer_minutes: number
          min_notice_hours: number
          slot_duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          timezone?: string
          buffer_minutes?: number
          min_notice_hours?: number
          slot_duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          timezone?: string
          buffer_minutes?: number
          min_notice_hours?: number
          slot_duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          display_order?: number
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          duration: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          duration: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          duration?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      options: {
        Row: {
          id: string
          business_id: string
          service_id: string | null
          name: string
          description: string | null
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          service_id?: string | null
          name: string
          description?: string | null
          price: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          service_id?: string | null
          name?: string
          description?: string | null
          price?: number
          is_active?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          business_id: string
          service_id: string
          client_name: string
          client_email: string
          client_phone: string | null
          date: string
          time: string
          end_time: string | null
          duration: number
          base_price: number
          total_price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          service_id: string
          client_name: string
          client_email: string
          client_phone?: string | null
          date: string
          time: string
          end_time?: string | null
          duration: number
          base_price: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          service_id?: string
          client_name?: string
          client_email?: string
          client_phone?: string | null
          date?: string
          time?: string
          end_time?: string | null
          duration?: number
          base_price?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_options: {
        Row: {
          id: string
          booking_id: string
          option_id: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          option_id: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          option_id?: string
          price?: number
          created_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_open: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_open?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_open?: boolean
          created_at?: string
        }
      }
      category_questions: {
        Row: {
          id: string
          category_id: string
          question_text: string
          question_type: 'text' | 'select' | 'number'
          options: string[] | null
          is_required: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question_text: string
          question_type?: 'text' | 'select' | 'number'
          options?: string[] | null
          is_required?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          question_text?: string
          question_type?: 'text' | 'select' | 'number'
          options?: string[] | null
          is_required?: boolean
          display_order?: number
          created_at?: string
        }
      }
      booking_answers: {
        Row: {
          id: string
          booking_id: string
          question_id: string
          answer: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          question_id: string
          answer: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          question_id?: string
          answer?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
    }
  }
}

export type Business = Database['public']['Tables']['businesses']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Option = Database['public']['Tables']['options']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingOption = Database['public']['Tables']['booking_options']['Row']
export type BusinessHours = Database['public']['Tables']['business_hours']['Row']
export type CategoryQuestion = Database['public']['Tables']['category_questions']['Row']
export type BookingAnswer = Database['public']['Tables']['booking_answers']['Row']
