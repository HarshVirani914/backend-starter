/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        create trigger _100_timestamps before insert or update on app_public.users
            for each row
            execute procedure app_private.tg__timestamps();
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTrigger({ schema: "app_public", name: "users" }, "_100_timestamps");
}
