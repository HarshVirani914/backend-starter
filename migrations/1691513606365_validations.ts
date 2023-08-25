/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        create function app_private.tg__prevent_subscription_conflicts() returns trigger as $$
        begin
            if exists (
                select 1 from app_public.subscription_details
                where 
                    date = NEW.date and 
                    (
                        (start_time BETWEEN NEW.start_time and NEW.end_time) OR
                        (end_time BETWEEN NEW.start_time and NEW.end_time)
                    )
            ) THEN
              raise exception 'Conflicting subscription found' using errcode = 'DPLCT';
            END IF;

            return NEW;
        end;
        $$ language plpgsql volatile; 

        create trigger _100_subscription_detail_updated 
        before insert or update on app_public.subscription_details
            for each row execute procedure app_private.tg__prevent_subscription_conflicts();
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        drop trigger if exists _100_subscription_detail_updated on app_public.subscription_details;

        drop function if exists app_private.tg__prevent_subscription_conflicts();
    `);
}
