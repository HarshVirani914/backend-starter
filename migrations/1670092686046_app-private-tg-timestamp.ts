/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        create function app_private.tg__timestamps() returns trigger as $$
        begin
            NEW.created_at = (case when TG_OP='INSERT' then NOW() else OLD.created_at end);
            NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
            return NEW;
        end;
        $$ language plpgsql volatile set search_path to pg_catalog, public, pg_temp;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropFunction({ schema: "app_private", name: "tg__timestamps" }, [""]);
}
