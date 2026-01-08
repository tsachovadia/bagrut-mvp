export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            admission_rules: {
                Row: {
                    created_at: string | null
                    direct_track_bagrut: number | null
                    id: string
                    logic_config: Json | null
                    min_psychometric: number | null
                    min_sekem: number | null
                    program_id: string | null
                    year: number
                }
                Insert: {
                    created_at?: string | null
                    direct_track_bagrut?: number | null
                    id?: string
                    logic_config?: Json | null
                    min_psychometric?: number | null
                    min_sekem?: number | null
                    program_id?: string | null
                    year: number
                }
                Update: {
                    created_at?: string | null
                    direct_track_bagrut?: number | null
                    id?: string
                    logic_config?: Json | null
                    min_psychometric?: number | null
                    min_sekem?: number | null
                    program_id?: string | null
                    year?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "admission_rules_program_id_fkey"
                        columns: ["program_id"]
                        isOneToOne: false
                        referencedRelation: "programs"
                        referencedColumns: ["id"]
                    },
                ]
            }
            email_logs: {
                Row: {
                    body: string | null
                    clicked_at: string | null
                    created_at: string
                    id: string
                    ip_address: string | null
                    lead_id: string | null
                    location: string | null
                    opened_at: string | null
                    recipient_email: string | null
                    resend_email_id: string | null
                    status: string
                    subject: string | null
                    user_agent: string | null
                }
                Insert: {
                    body?: string | null
                    clicked_at?: string | null
                    created_at?: string
                    id?: string
                    ip_address?: string | null
                    lead_id?: string | null
                    location?: string | null
                    opened_at?: string | null
                    recipient_email?: string | null
                    resend_email_id?: string | null
                    status: string
                    subject?: string | null
                    user_agent?: string | null
                }
                Update: {
                    body?: string | null
                    clicked_at?: string | null
                    created_at?: string
                    id?: string
                    ip_address?: string | null
                    lead_id?: string | null
                    location?: string | null
                    opened_at?: string | null
                    recipient_email?: string | null
                    resend_email_id?: string | null
                    status?: string
                    subject?: string | null
                    user_agent?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "email_logs_lead_id_fkey"
                        columns: ["lead_id"]
                        isOneToOne: false
                        referencedRelation: "leads"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exam_schedules: {
                Row: {
                    created_at: string | null
                    exam_date: string
                    exam_type: string
                    id: string
                    season: string
                    subject: string | null
                }
                Insert: {
                    created_at?: string | null
                    exam_date: string
                    exam_type: string
                    id?: string
                    season: string
                    subject?: string | null
                }
                Update: {
                    created_at?: string | null
                    exam_date?: string
                    exam_type?: string
                    id?: string
                    season?: string
                    subject?: string | null
                }
                Relationships: []
            }
            faculties: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    university_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    university_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    university_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "faculties_university_id_fkey"
                        columns: ["university_id"]
                        isOneToOne: false
                        referencedRelation: "universities"
                        referencedColumns: ["id"]
                    },
                ]
            }
            leads: {
                Row: {
                    age: string | null
                    ai_draft: string | null
                    city: string | null
                    created_at: string
                    dilemma: string | null
                    email: string | null
                    facebook_user_id: string
                    full_name: string
                    id: string
                    joined_group_at: string | null
                    profile_link: string | null
                    status: Database["public"]["Enums"]["lead_status"]
                    target_degree: string | null
                    updated_at: string | null
                }
                Insert: {
                    age?: string | null
                    ai_draft?: string | null
                    city?: string | null
                    created_at?: string
                    dilemma?: string | null
                    email?: string | null
                    facebook_user_id: string
                    full_name: string
                    id?: string
                    joined_group_at?: string | null
                    profile_link?: string | null
                    status?: Database["public"]["Enums"]["lead_status"]
                    target_degree?: string | null
                    updated_at?: string | null
                }
                Update: {
                    age?: string | null
                    ai_draft?: string | null
                    city?: string | null
                    created_at?: string
                    dilemma?: string | null
                    email?: string | null
                    facebook_user_id?: string
                    full_name?: string
                    id?: string
                    joined_group_at?: string | null
                    profile_link?: string | null
                    status?: Database["public"]["Enums"]["lead_status"]
                    target_degree?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            partner_outreach_logs: {
                Row: {
                    content: string | null
                    created_at: string
                    id: string
                    method: string
                    partner_id: string
                    status: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    method: string
                    partner_id: string
                    status: string
                }
                Update: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    method?: string
                    partner_id?: string
                    status?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "partner_outreach_logs_partner_id_fkey"
                        columns: ["partner_id"]
                        isOneToOne: false
                        referencedRelation: "partners"
                        referencedColumns: ["id"]
                    },
                ]
            }
            partners: {
                Row: {
                    category: string | null
                    contact_name: string | null
                    created_at: string
                    email: string | null
                    id: string
                    name: string
                    notes: string | null
                    phone: string | null
                    status: string
                    updated_at: string
                    website: string | null
                }
                Insert: {
                    category?: string | null
                    contact_name?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name: string
                    notes?: string | null
                    phone?: string | null
                    status?: string
                    updated_at?: string
                    website?: string | null
                }
                Update: {
                    category?: string | null
                    contact_name?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name?: string
                    notes?: string | null
                    phone?: string | null
                    status?: string
                    updated_at?: string
                    website?: string | null
                }
                Relationships: []
            }
            programs: {
                Row: {
                    created_at: string | null
                    degree_type: string
                    description: string | null
                    duration_years: number
                    faculty_id: string | null
                    id: string
                    is_direct_track: boolean
                    name: string
                    university_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    degree_type: string
                    description?: string | null
                    duration_years: number
                    faculty_id?: string | null
                    id?: string
                    is_direct_track: boolean
                    name: string
                    university_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    degree_type?: string
                    description?: string | null
                    duration_years?: number
                    faculty_id?: string | null
                    id?: string
                    is_direct_track?: boolean
                    name?: string
                    university_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "programs_faculty_id_fkey"
                        columns: ["faculty_id"]
                        isOneToOne: false
                        referencedRelation: "faculties"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "programs_university_id_fkey"
                        columns: ["university_id"]
                        isOneToOne: false
                        referencedRelation: "universities"
                        referencedColumns: ["id"]
                    },
                ]
            }
            universities: {
                Row: {
                    calculator_type: string
                    created_at: string | null
                    id: string
                    key: string
                    logo_url: string | null
                    name: string
                    website_url: string | null
                }
                Insert: {
                    calculator_type: string
                    created_at?: string | null
                    id?: string
                    key: string
                    logo_url?: string | null
                    name: string
                    website_url?: string | null
                }
                Update: {
                    calculator_type?: string
                    created_at?: string | null
                    id?: string
                    key?: string
                    logo_url?: string | null
                    name?: string
                    website_url?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            institution_type: "university" | "college"
            lead_status: "new" | "draft_generated" | "sent" | "replied"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
}
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
