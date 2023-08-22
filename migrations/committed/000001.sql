--! Previous: -
--! Hash: sha1:43c67278d7c05b7af353495422fec158971aa8ae

--! split: 1-current.sql
drop schema if exists app_public cascade;
drop schema if exists app_hidden cascade;
drop schema if exists app_private cascade;

revoke all on schema public from public;

alter default privileges revoke all on sequences from public;
alter default privileges revoke all on functions from public;

grant all on schema public to :DATABASE_OWNER;

create schema app_public;
create schema app_hidden;
create schema app_private;

grant usage on schema public, app_public, app_hidden to :DATABASE_VISITOR;

alter default privileges in schema public, app_public, app_hidden
grant usage, select on sequences to :DATABASE_VISITOR;

alter default privileges in schema public, app_public, app_hidden
grant execute on functions to :DATABASE_VISITOR;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
