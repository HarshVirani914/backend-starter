/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        -- drop not null from user id on a temporary bases
        -- set not null after fixing jwt authentication

        alter table app_public.subscriptions
            alter column user_id drop not null;

        alter table app_public.subscription_details
            alter column user_id drop not null;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        alter table app_public.subscriptions
            alter column user_id set not null;

        alter table app_public.subscription_details
            alter column user_id set not null;
    `);
}
