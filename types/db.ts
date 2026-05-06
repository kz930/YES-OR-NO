/**
 * Database types — to be regenerated from Supabase after migration runs:
 * npx supabase gen types typescript --project-id <id> > types/db.ts
 *
 * For now, this file holds hand-written types matching docs/PRD_假设_v0.2.md §7.
 */

export type Side = "a" | "b";

export type CategorySlug =
  | "qipashuo"
  | "philosophy"
  | "either-or"
  | "internet";

export type SuggestionStatus = "pending" | "approved" | "rejected";

export type QuestionStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  slug: CategorySlug;
  name: string;
  color_hex: string | null;
  display_order: number;
}

export interface Question {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  source: string | null;
  source_detail: string | null;
  side_a_label: string;
  side_b_label: string;
  status: QuestionStatus;
  is_daily: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  question_id: number;
  initial_side: Side;
  current_side: Side;
  created_at: string;
  updated_at: string;
}

export interface Argument {
  id: string;
  user_id: string;
  question_id: number;
  side: Side;
  content: string;
  likes_count: number;
  is_anonymous: boolean;
  created_at: string;
}

export interface QuestionSuggestion {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: number;
  side_a_label: string;
  side_b_label: string;
  source: string | null;
  status: SuggestionStatus;
  reviewer_note: string | null;
  reviewer_id: string | null;
  approved_question_id: number | null;
  is_anonymous: boolean;
  created_at: string;
  reviewed_at: string | null;
}
