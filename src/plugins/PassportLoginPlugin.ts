import { gql, makeExtendSchemaPlugin } from 'graphile-utils';
import { login, register } from '../auth';

import { OurGraphQLContext } from '../middleware/installPostGraphile';

const PassportLoginPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input RegisterInput {
      email: String!
      password: String!
      name: String
    }

    type RegisterPayload {
      token: String!
      user: User! @pgField
    }

    input LoginInput {
      email: String!
      password: String!
    }

    type LoginPayload {
      user: User! @pgField
      token: String
    }

    type LogoutPayload {
      success: Boolean
    }

    """
    All input for the \`resetPassword\` mutation.
    """
    input ResetPasswordInput {
      """
      An arbitrary string value with no semantic meaning. Will be included in the
      payload verbatim. May be used to track mutations by the client.
      """
      clientMutationId: String

      userId: UUID!
      resetToken: String!
      newPassword: String!
    }

    """
    The output of our \`resetPassword\` mutation.
    """
    type ResetPasswordPayload {
      """
      The exact same \`clientMutationId\` that was provided in the mutation input,
      unchanged and unused. May be used by a client to track mutations.
      """
      clientMutationId: String

      """
      Our root query field type. Allows us to run any query from our mutation payload.
      """
      query: Query

      success: Boolean
    }

    extend type Mutation {
      """
      Use this mutation to create an account on our system. This may only be used if you are logged out.
      """
      register(input: RegisterInput!): RegisterPayload

      """
      Use this mutation to log in to your account; this login uses sessions so you do not need to take further action.
      """
      login(input: LoginInput!): LoginPayload

      """
      Use this mutation to logout from your account. Don't forget to clear the client state!
      """
      logout: LogoutPayload

      """
      After triggering forgotPassword, you'll be sent a reset token. Combine this with your user ID and a new password to reset your password.
      """
      resetPassword(input: ResetPasswordInput!): ResetPasswordPayload
    }
  `,
  resolvers: {
    Mutation: {
      async register(_mutation, args, context: OurGraphQLContext, resolveInfo) {
        return register(args, context, resolveInfo, build);
      },
      async login(_mutation, args, context: OurGraphQLContext, resolveInfo) {
        return login(args, context, resolveInfo, build);
      },

      async logout(_mutation, _args, context: OurGraphQLContext, _resolveInfo) {
        const { pgClient, logout } = context;
        await pgClient.query('select app_public.logout();');
        await logout();
        return {
          success: true,
        };
      },

      async resetPassword(
        _mutation,
        args,
        context: OurGraphQLContext,
        _resolveInfo
      ) {
        const { rootPgPool } = context;
        const { userId, resetToken, newPassword, clientMutationId } =
          args.input;

        // Since the `reset_password` function needs to keep track of attempts
        // for security, we cannot risk the transaction being rolled back by a
        // later error. As such, we don't allow users to call this function
        // through normal means, instead calling it through our root pool
        // without a transaction.
        const {
          rows: [row],
        } = await rootPgPool.query(
          `select app_private.reset_password($1::uuid, $2::text, $3::text) as success`,
          [userId, resetToken, newPassword]
        );

        return {
          clientMutationId,
          success: row?.success,
        };
      },
    },
  },
}));

export default PassportLoginPlugin;
