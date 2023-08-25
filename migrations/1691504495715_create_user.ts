/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_private.create_user(
        name text,
        email citext,
        password text default null
    ) returns app_public.users as $$
    declare
      v_user app_public.users;
      v_email citext = email;
    begin
      if email is null then
          raise exception 'Email is required' using errcode = 'NODAT';
        end if;
      
      if exists(select 1 from app_public.users where users.email = v_email) then
          raise exception 'Email already exist' using errcode = 'ISEXI';
        end if;
      
      if password is null then 
          raise exception 'Password is required' using errcode = 'NODAT';
      end if;

      insert into app_public.users (email, name, password) values
          (email, name, crypt(password, gen_salt('bf')))
          returning * into v_user;
    
      -- refresh the user
      select * into v_user from app_public.users where id = v_user.id;
    
      return v_user;
    end;
    $$ language plpgsql volatile security definer; 
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop function app_private.create_user cascade;
  `);
}
