/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_public.current_user_is_admin() returns boolean as $$
      select exists(
        select 1 
        from app_public.users
        where id = app_public.current_user_id()
        and is_admin is true 
      )
    $$ language sql stable;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop function if exists app_public.current_user_is_admin cascade;
`);
}
