-- Tabela de Produtos
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Tabela de Pedidos
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  amount decimal(10,2) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  mp_preference_id text,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Policies Products
create policy "Public Read Active Products" on products for select using (active = true);
create policy "Admin Manage Products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies Orders
create policy "User View Own Orders" on orders for select using (auth.uid() = user_id);
create policy "Admin View All Orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
-- Orders Insert: Permitir que o usuário autenticado crie seu pedido (via app) ou service role (via edge function)
create policy "User Create Own Order" on orders for insert with check (auth.uid() = user_id);

-- Storage Bucket para Imagens de Produtos
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public Read Product Images" on storage.objects for select
using ( bucket_id = 'product-images' );

create policy "Admin Upload Product Images" on storage.objects for insert
with check ( bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );
