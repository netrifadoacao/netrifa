insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public Read Avatars" on storage.objects;
create policy "Public Read Avatars" on storage.objects for select
using ( bucket_id = 'avatars' );

drop policy if exists "User Upload Own Avatar" on storage.objects;
create policy "User Upload Own Avatar" on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (name like (auth.uid()::text || '.%') or name like ('/' || auth.uid()::text || '.%'))
);

drop policy if exists "User Update Own Avatar" on storage.objects;
create policy "User Update Own Avatar" on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' and (name like (auth.uid()::text || '.%') or name like ('/' || auth.uid()::text || '.%')) );

drop policy if exists "User Delete Own Avatar" on storage.objects;
create policy "User Delete Own Avatar" on storage.objects for delete
to authenticated
using ( bucket_id = 'avatars' and (name like (auth.uid()::text || '.%') or name like ('/' || auth.uid()::text || '.%')) );
