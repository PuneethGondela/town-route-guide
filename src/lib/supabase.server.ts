import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Database = {
  public: {
    Tables: {
      conductors: {
        Row: {
          id: string;
          employee_id: string;
          password: string;
          name: string;
          bus_number: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conductors"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["conductors"]["Row"]>;
      };
      conductor_sessions: {
        Row: {
          id: string;
          conductor_id: string;
          conductor_name: string;
          bus_number: string;
          route_id: string;
          origin_id: string;
          destination_id: string;
          start_time: string;
          end_time: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conductor_sessions"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["conductor_sessions"]["Row"]>;
      };
      location_pings: {
        Row: {
          id: string;
          session_id: string;
          lat: number;
          lon: number;
          accuracy: number | null;
          crowd_status: "low" | "medium" | "full";
          timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["location_pings"]["Row"], "created_at">;
        Update: never;
      };
      tickets: {
        Row: {
          id: string;
          session_id: string;
          bus_number: string;
          route_id: string;
          passenger_name: string;
          seat_number: string | null;
          boarding_stop: string;
          alighting_stop: string;
          fare: number;
          issued_at: string;
          valid_until: string;
          is_used: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tickets"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tickets"]["Row"]>;
      };
    };
  };
};
