-- ============================================================================
-- DAVE TECHS ACADEMY — MIGRATION 03: STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('course-resources', 'course-resources', false, 52428800, ARRAY['application/pdf', 'application/zip', 'text/plain', 'image/jpeg', 'image/png']),
  ('assignment-submissions', 'assignment-submissions', false, 52428800, ARRAY['application/pdf', 'application/zip', 'text/plain', 'application/json']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- AVATARS STORAGE POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- ASSIGNMENT SUBMISSIONS STORAGE POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students can upload assignment files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Students can read their own submission files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assignment-submissions' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
      OR public.is_instructor()
    )
  );

-- ----------------------------------------------------------------------------
-- COURSE RESOURCES & CERTIFICATES STORAGE POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Certificates are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'certificates');

CREATE POLICY "Enrolled students can read course resources"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND (
      public.is_admin()
      OR public.is_instructor()
      OR EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.student_id = auth.uid()
          AND enrollments.course_id = (storage.foldername(name))[1]
          AND enrollments.status IN ('enrolled', 'active', 'completed')
      )
    )
  );

CREATE POLICY "Admins can manage all storage objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (public.is_admin());
