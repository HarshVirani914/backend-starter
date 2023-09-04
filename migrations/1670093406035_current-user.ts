/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        create function app_public.current_user() returns app_public.users as $$
            select users.* from app_public.users where id = app_public.current_user_id();
            $$ language sql stable;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropFunction({ schema: "app_public", name: "current_user" }, [""]);
}
