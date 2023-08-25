/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        -- Test Users

        select app_private.create_user('Test Admin', 'admin@gmail.com', 'Admin@123');

        select app_private.create_user('Test User', 'user@gmail.com', 'User@123');

        update app_public.users
            set is_admin = true
        where email = 'admin@gmail.com';
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      delete from app_public.users
      where email = ANY('admin@gmail.com', 'user@gmail.com');
    `
  );
}
