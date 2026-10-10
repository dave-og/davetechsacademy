import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Application, LearningMode } from "../types";
import { saveApplication, getApplicationById } from "../data/applications";
import { getCourseById } from "../data/courses";
import { sanitizeString } from "../utils/security";

export interface SubmitApplicationInput {
  courseId: string;
  learningMode: LearningMode;
  branchId?: string;
  cohort: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stateOfResidence?: string;
  preferredContactMethod?: "email" | "whatsapp" | "phone";
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
}

/**
 * Submit an application to Supabase with authoritative price calculation.
 */
export async function submitApplicationToSupabase(
  formData: SubmitApplicationInput
): Promise<{
  success: boolean;
  application: Application;
  error?: string;
}> {
  // Authoritative price check
  const course = getCourseById(formData.courseId);
  const authoritativePrice = course ? course.price : 120000;

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const applicationNumber = `DTA-APP-${new Date().getFullYear()}-${randomSuffix}`;

  const localApp: Application = {
    id: `app_${timestamp}`,
    applicationNumber: applicationNumber,
    studentId: `std_${timestamp}`,
    studentName: `${formData.firstName} ${formData.lastName}`,
    studentEmail: formData.email,
    studentPhone: formData.phone,
    studentCountry: "Nigeria",
    studentState: formData.stateOfResidence || "Ogun State",
    preferredContactMethod: formData.preferredContactMethod || "whatsapp",
    courseId: formData.courseId,
    courseTitle: course?.title || 'Selected Course',
    tuitionAmount: authoritativePrice,
    learningMode: formData.learningMode,
    branchId: formData.branchId,
    cohort: formData.cohort,
    paymentStatus: 'pending',
    applicationStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Always save locally for immediate UI availability
  saveApplication(localApp);

  if (!isSupabaseConfigured()) {
    return { success: true, application: localApp };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('applications').insert({
      application_number: applicationNumber,
      user_id: user?.id || null,
      course_id: formData.courseId,
      learning_mode: formData.learningMode,
      branch_id: formData.branchId || null,
      first_name: sanitizeString(formData.firstName),
      last_name: sanitizeString(formData.lastName),
      email: sanitizeString(formData.email),
      phone: sanitizeString(formData.phone),
      state_of_residence: sanitizeString(formData.stateOfResidence || 'Ogun State'),
      education_level: 'Tertiary',
      employment_status: 'Employed',
      programming_experience: 'Beginner',
      tuition_amount: authoritativePrice,
      total_amount: authoritativePrice,
      currency: 'NGN',
      status: 'submitted',
      payment_status: 'pending',
    }).select().single();

    if (error) {
      console.warn('Supabase application sync error:', error);
      return { success: true, application: localApp };
    }

    if (data) {
      if (formData.emergencyContactName) {
        await supabase.from('emergency_contacts').insert({
          application_id: data.id,
          contact_name: sanitizeString(formData.emergencyContactName),
          relationship: sanitizeString(formData.emergencyContactRelationship || 'Parent'),
          phone_number: sanitizeString(formData.emergencyContactPhone || ''),
        });
      }

      localApp.id = data.id;
    }

    return { success: true, application: localApp };
  } catch (err: any) {
    console.warn('Supabase application submit fallback:', err);
    return { success: true, application: localApp };
  }
}

/**
 * Fetch application by ID from Supabase or local store
 */
export async function fetchApplicationById(applicationId: string): Promise<Application | null> {
  const localApp = getApplicationById(applicationId);
  if (!isSupabaseConfigured()) {
    return localApp || null;
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, courses(*)')
      .eq('id', applicationId)
      .single();

    if (error || !data) {
      return localApp || null;
    }

    return {
      id: data.id,
      applicationNumber: data.application_number || localApp?.applicationNumber || `DTA-${data.id}`,
      studentId: data.user_id || localApp?.studentId || `std_${data.id}`,
      studentName: `${data.first_name} ${data.last_name}`,
      studentEmail: data.email,
      studentPhone: data.phone,
      studentCountry: "Nigeria",
      studentState: data.state_of_residence,
      preferredContactMethod: localApp?.preferredContactMethod || "whatsapp",
      courseId: data.course_id,
      courseTitle: data.courses?.title || localApp?.courseTitle || 'Tech Course',
      tuitionAmount: Number(data.total_amount),
      learningMode: data.learning_mode,
      branchId: data.branch_id,
      cohort: localApp?.cohort || "Default Cohort",
      paymentStatus: data.payment_status,
      applicationStatus: data.status === 'enrolled' || data.status === 'confirmed' ? 'confirmed' : 'pending',
      paymentReference: data.payment_reference,
      createdAt: data.created_at,
    };
  } catch {
    return localApp || null;
  }
}
