-- Update the character limit constraint to 140 characters
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_content_check;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_content_check 
CHECK (char_length(content) <= 140);