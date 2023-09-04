/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    alter table app_private.sessions
    add constraint sessions_user_id_fkey
    foreign key ("user_id") references app_public.users on delete cascade;  
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint(
    { schema: "app_private", name: "sessions" },
    "sessions_user_id_fkey"
  );
}
