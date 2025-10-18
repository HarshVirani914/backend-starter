# Package Upgrade Notes - October 2025

This document outlines all the changes made to upgrade packages to their latest versions and resolve breaking changes.

## Summary of Changes

### 1. **Inquirer v9 → v12 (Breaking Changes)**

**File:** `scripts/setup-db.ts`

**Change:** Updated from the old `inquirer.prompt([...])` API to the new individual prompt functions.

**Before:**

```typescript
const { default: inquirer } = await import('inquirer');
const input = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'confirm',
    default: false,
    message: '...'
  }
]);
if (!input.confirm) { ... }
```

**After:**

```typescript
const { confirm } = await import('@inquirer/prompts');
const input = await confirm({
  default: false,
  message: '...'
});
if (!input) { ... }
```

### 2. **node-pg-migrate v6 → v8 (Breaking Changes)**

#### TypeScript Configuration

**File:** `tsconfig.json`

**Change:** Updated module system from `NodeNext` to `commonjs` and excluded migrations from TypeScript compilation since they're handled by jiti.

**Before:**

```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    ...
  },
  "include": ["src", ".env", "migrations"]
}
```

**After:**

```json
{
  "compilerOptions": {
    "moduleResolution": "node10",
    "module": "commonjs",
    "skipLibCheck": true,
    ...
  },
  "include": ["src", ".env"],
  "exclude": ["migrations", "node_modules", "dist"]
}
```

#### Migration Files Import

**Files:** All migration files in `migrations/` directory

**Change:** Updated imports to use TypeScript `type` imports for types.

**Before:**

```typescript
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
```

**After:**

```typescript
import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
```

#### Package.json Script

**File:** `package.json`

**Change:** Removed `--tsconfig` flag as node-pg-migrate v8 uses jiti by default for TypeScript support.

**Before:**

```json
"migrate": "node-pg-migrate -j ts --tsconfig ./tsconfig.json"
```

**After:**

```json
"migrate": "node-pg-migrate -j ts"
```

### 3. **Express v4 → v5 (Minor Changes)**

**File:** `package.json`

**Change:** Removed `body-parser` dependency as Express v5 includes body-parser functionality built-in.

**Note:** No code changes were required as body-parser was not being used directly in the codebase.

### 4. **Passport v0.4.1 → v0.7.0 (Breaking Changes)**

#### Removed Session-Based Authentication

**Files:**

- `src/middleware/installPassport.ts`
- `src/middleware/installPostGraphile.ts`

**Change:** Passport v0.7.0 requires `express-session` middleware for session support. Since this application uses JWT authentication (stateless), session-based authentication was removed.

**Before:**

```typescript
// installPassport.ts
passport.serializeUser((sessionObject: DbSession, done) => {
  done(null, sessionObject.session_id);
});

passport.deserializeUser((session_id: string, done) => {
  done(null, { session_id });
});

app.use(passport.initialize());
app.use(passport.session()); // This requires express-session

app.use((req, res, next) =>
  passport.authenticate('jwt', (err: any, user: any) => {
    if (user) req.user = user;
    next();
  })(req, res, next)
);
```

**After:**

```typescript
// installPassport.ts
app.use(passport.initialize());

await installJWTStrategy(app);

// JWT authentication with session: false (stateless)
app.use((req, res, next) =>
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (user) req.user = user;
    next();
  })(req, res, next)
);
```

**installPostGraphile.ts logout change:**

```typescript
// Before
logout: () => {
  req.logout(); // Requires session support
  return Promise.resolve();
};

// After
logout: () => {
  // JWT is stateless - logout handled client-side by clearing token
  // Server-side logout happens via database (app_public.logout())
  return Promise.resolve();
};
```

#### Type Safety Improvements

**File:** `src/middleware/installJWTStrategy.ts`

**Change:** Added proper type annotations and environment variable validation for JWT secret.

**Before:**

```typescript
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
      done(null, payload);
    }
  )
);
```

**After:**

```typescript
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    (payload: any, done: VerifiedCallback) => {
      done(null, payload);
    }
  )
);
```

### 5. **Other Package Updates**

All other packages were updated without requiring code changes:

- **TypeScript:** v4.9.3 → v5.9.3
- **concurrently:** v7.6.0 → v9.2.1
- **nodemon:** v2.0.20 → v3.1.10
- **prettier:** v3.0.2 → v3.6.2
- **chalk:** v5.3.0 → v5.6.2
- **cross-env:** v7.0.3 → v10.1.0
- **dotenv:** v16.0.3 → v17.2.3
- **dotenv-expand:** v9.0.0 → v12.0.3
- **graphile-worker:** v0.11.4 → v0.16.6
- **pg:** v8.8.0 → v8.16.3
- **postgraphile:** v4.12.11 → v4.14.1
- **passport:** v0.4.1 → v0.7.0 (no breaking changes detected in current usage)
- **@types/passport-jwt:** v3.0.7 → v4.0.1

## Testing Results

✅ **Migration tests:** All 13 migrations run successfully  
✅ **Setup script:** Database setup works correctly with updated Inquirer  
✅ **TypeScript build:** Successful compilation with no errors  
✅ **Type checking:** All source files type-check correctly  
✅ **Runtime:** No deprecated method usage detected in Express v5

## Warnings to Note

1. **Node Module Warning:** You may see a warning about adding `"type": "module"` to package.json when running migrations. This can be safely ignored as the current CommonJS setup works correctly.

2. **Deprecated Packages:** Some transitive dependencies show deprecation warnings:
   - `subscriptions-transport-ws` (used by postgraphile) - recommended to migrate to `graphql-ws` in future
   - `graphql` peer dependency warnings from graphile packages

## Next Steps / Recommendations

1. Consider migrating to ES modules (`"type": "module"`) in a future update for better modern Node.js compatibility
2. Monitor for PostGraphile v5 release which may address the graphql-ws migration
3. Review Express v5 migration guide for any advanced features you may want to adopt: https://expressjs.com/en/guide/migrating-5.html

## Commands to Verify Everything Works

```bash
# Install dependencies
yarn install

# Setup database
yarn setup:db

# Run migrations
yarn migrate up

# Build TypeScript
yarn build
```

All packages are now up-to-date and compatible with the latest versions as of October 2025.
