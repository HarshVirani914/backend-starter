/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_private.tg__timestamps() returns trigger as $$
    begin
        NEW.created_at = (case when TG_OP='INSERT' then NOW() else OLD.created_at end);
        NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
        return NEW;
    end;
    $$ language plpgsql volatile;

    create trigger _100_timestamps 
    before insert or update on app_public.users
        for each row execute procedure app_private.tg__timestamps();

    create trigger _100_timestamps 
    before insert or update on app_public.subscriptions
        for each row execute procedure app_private.tg__timestamps();
    
    create trigger _100_timestamps 
    before insert or update on app_public.subscription_details
        for each row execute procedure app_private.tg__timestamps();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop trigger if exists _100_timestamps on app_public.users();

    drop trigger if exists _100_timestamps on app_public.subscriptions();

    drop trigger if exists _100_timestamps on app_public.subscription_details();

    drop function if exists app_private.tg__timestamps();
  `);
}
