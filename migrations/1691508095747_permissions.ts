/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        -- Currently our jwt session is not working properly otherwise we have to enable row level security and define RLS for various operation for better security 

        grant all on app_public.users to ${process.env.DATABASE_VISITOR};

        grant all on app_public.subscriptions to ${process.env.DATABASE_VISITOR};

        grant all on app_public.subscription_details to ${process.env.DATABASE_VISITOR};

        grant all on app_private.sessions to ${process.env.DATABASE_VISITOR};

    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        revoke all on app_public.users from ${process.env.DATABASE_VISITOR};

        revoke all on app_public.subscriptions from ${process.env.DATABASE_VISITOR};

        revoke all on app_public.subscription_details from ${process.env.DATABASE_VISITOR};

        revoke all on app_private.sessions from ${process.env.DATABASE_VISITOR};
    `);
}
