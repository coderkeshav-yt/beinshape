-- Allow admins to insert/update/delete enrollments
DROP POLICY IF EXISTS "Admins can insert enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can delete enrollments" ON public.enrollments;

CREATE POLICY "Admins can insert enrollments" ON public.enrollments
FOR INSERT
WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can update enrollments" ON public.enrollments
FOR UPDATE
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can delete enrollments" ON public.enrollments
FOR DELETE
USING ( public.is_admin() );

-- Allow admins to select all enrollments (needed to read the recent list)
DROP POLICY IF EXISTS "Admins can select enrollments" ON public.enrollments;
CREATE POLICY "Admins can select enrollments" ON public.enrollments
FOR SELECT
USING ( public.is_admin() );


