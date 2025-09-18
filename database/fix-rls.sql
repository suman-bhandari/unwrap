-- Fix RLS policies for public gift access
-- Run this in your Supabase SQL Editor

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'gifts';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Users can insert their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Users can update their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Users can delete their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can view gifts by ID" ON public.gifts;

-- Recreate policies with proper public access
-- Allow anyone to view gifts (for recipients)
CREATE POLICY "Public can view gifts" ON public.gifts
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own gifts
CREATE POLICY "Users can insert their own gifts" ON public.gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Allow authenticated users to update their own gifts
CREATE POLICY "Users can update their own gifts" ON public.gifts
  FOR UPDATE USING (auth.uid() = sender_id);

-- Allow authenticated users to delete their own gifts
CREATE POLICY "Users can delete their own gifts" ON public.gifts
  FOR DELETE USING (auth.uid() = sender_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'gifts';
