import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Branch } from '../types';
import { branches as defaultBranches } from '../data/branches';

export interface CohortRecord {
  id: string;
  course_id: string;
  branch_id?: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  schedule_type: string;
  capacity: number;
  enrolled_count: number;
  status: string;
}

/**
 * Fetch all active physical campuses / branches
 */
export async function fetchBranchesFromSupabase(): Promise<Branch[]> {
  if (!isSupabaseConfigured()) {
    return defaultBranches;
  }

  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true);

    if (error || !data || data.length === 0) {
      return defaultBranches;
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      location: `${row.city}, ${row.state}`,
      address: row.address,
      phone: row.phone,
      email: row.email,
      openingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
      courseIds: ["ui-ux-design", "frontend-development", "backend-engineering", "fullstack-software-engineering"],
      availableCohorts: ["Morning Cohort", "Weekend Intensive", "Executive Evening"],
      active: Boolean(row.is_active),
      facilities: Array.isArray(row.facilities) ? row.facilities : [],
    }));
  } catch {
    return defaultBranches;
  }
}

/**
 * Fetch cohorts for a course and optional branch
 */
export async function fetchCohortsForCourse(courseId: string, branchId?: string): Promise<CohortRecord[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('cohorts')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', 'open');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CohortRecord[];
  } catch {
    return [];
  }
}
