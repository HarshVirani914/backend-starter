/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create table app_public.subscriptions (
      id uuid primary key default gen_random_uuid(),
      name citext not null unique,
      user_id uuid not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );  

    alter table app_public.subscriptions 
        drop constraint if exists subscriptions_user_id_fkey,
        add constraint subscriptions_user_id_fkey 
        foreign key ("user_id") references app_public.users(id) on delete cascade;
    
    create index on app_public.subscriptions(user_id);

    create index on app_public.subscriptions(name);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop table if exists app_public.subscriptions cascade;  
  `);
}
