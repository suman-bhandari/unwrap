-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Gifts table
create table if not exists public.gifts (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_email text not null,
  recipient_name text,
  title text not null,
  message text,
  video_url text,
  gift_image_url text,
  qr_code_url text,
  reservation_details jsonb,
  scheduled_for timestamp with time zone,
  is_opened boolean default false,
  opened_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Gift opens tracking
create table if not exists public.gift_opens (
  id uuid default uuid_generate_v4() primary key,
  gift_id uuid references public.gifts(id) on delete cascade not null,
  opened_at timestamp with time zone default now(),
  ip_address inet,
  user_agent text
);

-- RLS (Row Level Security) policies
alter table public.gifts enable row level security;
alter table public.gift_opens enable row level security;

-- Policies for gifts table
create policy "Users can view their own gifts" on public.gifts
  for select using (auth.uid() = sender_id);

create policy "Users can insert their own gifts" on public.gifts
  for insert with check (auth.uid() = sender_id);

create policy "Users can update their own gifts" on public.gifts
  for update using (auth.uid() = sender_id);

create policy "Users can delete their own gifts" on public.gifts
  for delete using (auth.uid() = sender_id);

-- Public access to view gifts by ID (for recipients)
create policy "Anyone can view gifts by ID" on public.gifts
  for select using (true);

-- Policies for gift_opens table
create policy "Anyone can insert gift opens" on public.gift_opens
  for insert with check (true);

create policy "Gift senders can view opens for their gifts" on public.gift_opens
  for select using (
    exists (
      select 1 from public.gifts
      where gifts.id = gift_opens.gift_id
      and gifts.sender_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists gifts_sender_id_idx on public.gifts(sender_id);
create index if not exists gifts_recipient_email_idx on public.gifts(recipient_email);
create index if not exists gifts_scheduled_for_idx on public.gifts(scheduled_for);
create index if not exists gift_opens_gift_id_idx on public.gift_opens(gift_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Updated_at trigger
create trigger handle_gifts_updated_at
  before update on public.gifts
  for each row
  execute function public.handle_updated_at();
