-- Fix missing columns in gifts table
-- Run this in your Supabase SQL Editor

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add sender_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'sender_name') THEN
        ALTER TABLE public.gifts ADD COLUMN sender_name text;
    END IF;
    
    -- Add recipient_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'recipient_name') THEN
        ALTER TABLE public.gifts ADD COLUMN recipient_name text;
    END IF;
    
    -- Add message column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'message') THEN
        ALTER TABLE public.gifts ADD COLUMN message text;
    END IF;
    
    -- Add video_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'video_url') THEN
        ALTER TABLE public.gifts ADD COLUMN video_url text;
    END IF;
    
    -- Add gift_image_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'gift_image_url') THEN
        ALTER TABLE public.gifts ADD COLUMN gift_image_url text;
    END IF;
    
    -- Add qr_code_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'qr_code_url') THEN
        ALTER TABLE public.gifts ADD COLUMN qr_code_url text;
    END IF;
    
    -- Add reservation_details column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'reservation_details') THEN
        ALTER TABLE public.gifts ADD COLUMN reservation_details jsonb;
    END IF;
    
    -- Add scheduled_for column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.gifts ADD COLUMN scheduled_for timestamp with time zone;
    END IF;
    
    -- Add is_opened column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'is_opened') THEN
        ALTER TABLE public.gifts ADD COLUMN is_opened boolean DEFAULT false;
    END IF;
    
    -- Add opened_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'opened_at') THEN
        ALTER TABLE public.gifts ADD COLUMN opened_at timestamp with time zone;
    END IF;
    
    -- Add created_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'created_at') THEN
        ALTER TABLE public.gifts ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gifts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.gifts ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gifts' 
ORDER BY ordinal_position;
