-- Run this in Supabase SQL Editor (Database > SQL Editor)

-- Profiles table, auto-populated when a user signs up
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Orders table (Cash on Delivery for now; online payment coming later)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  subtotal numeric not null,
  payment_method text not null default 'cod',
  status text not null default 'pending_cod',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Signed-in users can only insert orders under their own id; guests (user_id null) can also insert.
create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

-- Signed-in users can view only their own orders.
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

