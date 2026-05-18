
-- Restrict storage.objects SELECT on the public avatars bucket to prevent listing of all files.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Users can read only their own avatar via authenticated queries.
-- Public URL fetches via the CDN continue to work because the bucket is marked public.
CREATE POLICY "Users can view their own avatar"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Enable RLS on realtime.messages and restrict channel topics to per-user channels
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users subscribe to their own taxes channel" ON realtime.messages;
CREATE POLICY "Users subscribe to their own taxes channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = 'taxes-rt-' || (auth.uid())::text)
);

DROP POLICY IF EXISTS "Users broadcast only to their own taxes channel" ON realtime.messages;
CREATE POLICY "Users broadcast only to their own taxes channel"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() = 'taxes-rt-' || (auth.uid())::text)
);
