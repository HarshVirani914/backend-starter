/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create table app_public.subscription_details (
        id uuid primary key default gen_random_uuid(),
        subscription_id uuid not null,
        user_id uuid not null,
        date date not null,
        start_time time not null,
        end_time time not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    );  

    alter table app_public.subscription_details 
        drop constraint if exists subscription_details_user_id_fkey,
        add constraint subscription_details_user_id_fkey 
            foreign key ("user_id") references app_public.users(id) on delete cascade,
        Drop constraint if exists subscription_details_subscription_id_fkey, 
        add constraint subscription_details_subscription_id_fkey 
            foreign key ("subscription_id") references app_public.subscriptions(id) on delete cascade;
    
    create index on app_public.subscription_details(user_id);

    create index on app_public.subscription_details(subscription_id);

    create index on app_public.subscription_details(date);

    create index on app_public.subscription_details(start_time);

    create index on app_public.subscription_details(end_time);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop table if exists app_public.subscription_details cascade;  
  `);
}
