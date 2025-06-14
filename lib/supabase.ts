import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env.local file.")
}

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.includes("supabase.co") && !url.includes("dashboard")
  } catch {
    return false
  }
}

if (!isValidUrl(supabaseUrl)) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please check your environment variables.`)
}

if (supabaseAnonKey.length < 100) {
  throw new Error("Invalid Supabase anon key. Please check your environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "supervisor" | "payroll_manager" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: "supervisor" | "payroll_manager" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "supervisor" | "payroll_manager" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          full_name: string
          employee_id: string
          supervisor_id: string
          daily_wage: number
          overtime_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          employee_id: string
          supervisor_id: string
          daily_wage: number
          overtime_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          employee_id?: string
          supervisor_id?: string
          daily_wage?: number
          overtime_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      monthly_reports: {
        Row: {
          id: string
          worker_id: string
          month: number
          year: number
          regular_days: number
          friday_days: number
          holiday_days: number
          overtime_hours: number
          total_salary: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          month: number
          year: number
          regular_days: number
          friday_days: number
          holiday_days: number
          overtime_hours: number
          total_salary?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          month?: number
          year?: number
          regular_days?: number
          friday_days?: number
          holiday_days?: number
          overtime_hours?: number
          total_salary?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
