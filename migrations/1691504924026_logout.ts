/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_public.logout() returns void as $$
    begin
        delete from app_private.sessions where uuid = app_public.current_session_id();
    
        perform set_config('jwt.claims.session_id', '', true);
    end;
    $$ language plpgsql security definer volatile;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop function app_public.logout cascade;
 `);
}
