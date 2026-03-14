-- Enable RLS
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  initial_capital decimal(12,2) default 1000.00,
  created_at timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create table public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  coin text not null check (coin in ('BTC', 'ETH', 'SOL')),
  entry_price decimal(18,8) not null,
  exit_price decimal(18,8),
  result_pct decimal(8,4),
  pnl_usd decimal(12,2),
  date date default current_date,
  type text not null check (type in ('snowball', 'tournament', 'wave')),
  created_at timestamptz default now()
);
alter table public.trades enable row level security;
create policy "Users can manage own trades" on public.trades for all using (auth.uid() = user_id);

create table public.portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  coin text not null,
  allocation_pct decimal(5,2) not null,
  current_value decimal(12,2) not null,
  updated_at timestamptz default now()
);
alter table public.portfolio enable row level security;
create policy "Users can manage own portfolio" on public.portfolio for all using (auth.uid() = user_id);

create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_name text not null,
  unlocked_at timestamptz default now()
);
alter table public.achievements enable row level security;
create policy "Users can view own achievements" on public.achievements for all using (auth.uid() = user_id);

create table public.tournaments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  capital_assigned decimal(12,2) not null,
  current_balance decimal(12,2) not null,
  target_pct decimal(5,2) not null,
  deadline timestamptz not null,
  status text default 'active' check (status in ('active', 'completed', 'failed')),
  created_at timestamptz default now()
);
alter table public.tournaments enable row level security;
create policy "Users can manage own tournaments" on public.tournaments for all using (auth.uid() = user_id);

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
