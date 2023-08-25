/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      create function app_private.login(email citext, password text) returns app_private.sessions as $$
      declare
        v_user app_public.users;
        v_session app_private.sessions;
      begin
          select 
            users.* into v_user
          from app_public.users
          where 
            users.email = login.email and 
            users.password = crypt(login.password, users.password);
      
          if not (v_user is null) then   
              insert into app_private.sessions (user_id) 
              values (v_user.id) returning * into v_session;

              return v_session;
          else
              raise exception 'Invalid email/password' using errcode = 'CREDS';
          end if;
      end;
      $$ language plpgsql strict volatile security definer;
    `
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop function app_private.login cascade;
  `);
}
