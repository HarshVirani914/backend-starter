import { Build } from 'graphile-build';
import { GraphileHelpers } from 'graphile-utils/node8plus/fieldHelpers';
import { GraphQLResolveInfo } from 'graphql';
import { OurGraphQLContext } from '../middleware/installPostGraphile';

export const login = async (
  args: any,
  context: OurGraphQLContext,
  resolveInfo: GraphQLResolveInfo & {
    graphile: GraphileHelpers<any>;
  },
  build: Build
) => {
  const { selectGraphQLResultFromTable } = resolveInfo.graphile;
  const { email, password } = args.input;
  const { rootPgPool, login, pgClient, sessionId } = context;
  try {
    // Call our login function to find out if the username/password combination exists
    const {
      rows: [session],
    } = await rootPgPool.query(
      `select sessions.* from app_private.login($1, $2) sessions where not (sessions is null)`,
      [email, password]
    );

    if (!session) {
      const error: any = new Error('Incorrect email/password');
      error['code'] = 'CREDS';
      throw error;
    }

    console.log('sessionId', sessionId);

    // Tell Passport.js we're logged in
    const token = await login({ session_id: session.id });

    console.log('{ session_id: session.id }', { session_id: session.id });

    // Get session_id from PG
    const {
      rows: [row1],
    } = await pgClient.query(
      `select set_config('jwt.claims.session_id', $1, true)`,
      [session.id]
    );

    console.log('row1', row1);

    // Fetch the data that was requested from GraphQL, and return it
    const sql = build.pgSql;
    const [row] = await selectGraphQLResultFromTable(
      sql.fragment`app_public.users`,
      (tableAlias, sqlBuilder) => {
        sqlBuilder.where(
          sql.fragment`${tableAlias}.id = app_public.current_user_id()`
        );
      }
    );

    console.log('row', row);

    return {
      token,
      data: row,
    };
  } catch (e: any) {
    const { code } = e;
    const safeErrorCodes = ['LOCKD', 'CREDS'];
    if (safeErrorCodes.includes(code)) {
      throw e;
    } else {
      console.error(e);
      const error: any = new Error('Login failed');
      error['code'] = e.code;
      throw error;
    }
  }
};
