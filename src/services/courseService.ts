import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Course, CourseCategory, CourseLevel } from '../types';
import { courses as defaultCourses } from '../data/courses';

export const ALL_COURSE_CATEGORIES: CourseCategory[] = [
  "Software Development",
  "Data & AI",
  "Cybersecurity",
  "Design",
  "Cloud & DevOps",
  "Mobile Development",
  "Emerging Technology",
  "Digital Skills",
];

/**
 * Fetch all active courses from Supabase with search, filter, and sort options.
 */
export async function fetchCoursesFromSupabase(options?: {
  categoryId?: string;
  level?: string;
  format?: string;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'popular' | 'newest';
}): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    return filterLocalCourses(defaultCourses, options);
  }

  try {
    let query = supabase.from('courses').select('*').eq('is_active', true);

    if (options?.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.level && options.level !== 'all') {
      query = query.ilike('level', `%${options.level}%`);
    }
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options?.sortBy === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (options?.sortBy === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (options?.sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (options?.sortBy === 'popular') {
      query = query.order('reviews_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return filterLocalCourses(defaultCourses, options);
    }

    return data.map(mapPostgresCourseToFrontend);
  } catch (err) {
    console.error('Error fetching courses from Supabase:', err);
    return filterLocalCourses(defaultCourses, options);
  }
}

/**
 * Fetch single course by slug or ID
 */
export async function fetchCourseByIdOrSlug(idOrSlug: string): Promise<Course | null> {
  const localMatch = defaultCourses.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
  if (!isSupabaseConfigured()) {
    return localMatch;
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single();

    if (error || !data) {
      return localMatch;
    }

    return mapPostgresCourseToFrontend(data);
  } catch {
    return localMatch;
  }
}

/**
 * Fetch course categories
 */
export async function fetchCategoriesFromSupabase(): Promise<CourseCategory[]> {
  return ALL_COURSE_CATEGORIES;
}

function mapPostgresCourseToFrontend(row: any): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    fullDescription: row.full_description || row.description,
    category: (row.category_id as CourseCategory) || "Software Development",
    level: (row.level as CourseLevel) || "Beginner",
    durationWeeks: parseInt(row.duration, 10) || 12,
    price: Number(row.price),
    image: row.image || '/img/2e6ffc7bb424ef561c1001111f222474.jpg',
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.reviews_count) || 0,
    learningModes: ["online", "physical"],
    instructorIds: row.instructor_id ? [row.instructor_id] : ["inst-1"],
    featured: Boolean(row.featured),
    active: Boolean(row.is_active),
    certificateIncluded: true,
    curriculum: Array.isArray(row.syllabus) ? row.syllabus : [],
    learningOutcomes: Array.isArray(row.learning_outcomes) ? row.learning_outcomes : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
  };
}

function filterLocalCourses(list: Course[], options?: any): Course[] {
  let result = [...list];
  if (options?.categoryId && options.categoryId !== 'all') {
    result = result.filter((c) => c.category === options.categoryId);
  }
  if (options?.level && options.level !== 'all') {
    result = result.filter((c) => c.level.toLowerCase().includes(options.level.toLowerCase()));
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  return result;
}
