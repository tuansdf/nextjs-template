# GEMINI.md — Project Best Practices & AI Coding Guidelines

## Tech Stack

| Layer         | Technology                                                     | Version |
| ------------- | -------------------------------------------------------------- | ------- |
| Framework     | Next.js (App Router)                                           | 16      |
| UI Library    | React                                                          | 19      |
| Compiler      | React Compiler (`babel-plugin-react-compiler`)                 | enabled |
| Language      | TypeScript (strict mode)                                       | 5       |
| Styling       | Tailwind CSS v4 (via `@tailwindcss/postcss`)                   | 4       |
| Component Kit | shadcn/ui **base-nova** style (uses **Base UI** primitives)    | 3       |
| Icons         | lucide-react                                                   | —       |
| Class Utils   | `clsx` + `tailwind-merge` (via `cn()` in `lib/utils.ts`) + CVA | —       |
| Forms         | react-hook-form                                                | 7       |
| Validation    | Zod                                                            | 4       |
| HTTP Client   | axios                                                          | —       |
| Dates         | dayjs                                                          | —       |
| Auth          | Better Auth (email/password + admin plugin)                    | 1       |
| ORM           | Drizzle ORM (PostgreSQL dialect, `node-postgres` driver)       | 0.45    |
| Database      | PostgreSQL                                                     | —       |
| Package Mgr   | pnpm (workspace)                                               | —       |
| Linting       | ESLint 9 (flat config, `eslint-config-next`)                   | 9       |
| Formatting    | Prettier (double quotes, trailing commas, 100 print width)     | —       |

---

## Project Structure

```
nextjs-template/
├── app/                    # Next.js App Router
│   ├── globals.css         # Tailwind v4 imports + shadcn theme tokens (oklch)
│   ├── layout.tsx          # Root layout (Inter + Geist fonts)
│   ├── page.tsx            # Home page
│   └── favicon.ico
├── components/
│   └── ui/                 # shadcn base-nova components (Base UI primitives)
│       ├── button.tsx       # CVA variants + ButtonPrimitive from @base-ui/react
│       ├── input.tsx
│       ├── field.tsx
│       ├── select.tsx
│       ├── combobox.tsx
│       ├── dropdown-menu.tsx
│       ├── alert-dialog.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       ├── input-group.tsx
│       └── textarea.tsx
├── lib/
│   ├── auth-client.ts      # Better Auth client-side (React hooks: useSession, signIn, etc.)
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── server/
│   └── lib/
│       ├── auth/
│       │   └── client.ts   # Better Auth server config (drizzle adapter, admin plugin)
│       ├── config/
│       │   └── env.ts      # Zod-validated env variables
│       └── db/
│           ├── client.ts   # Drizzle client (node-postgres Pool)
│           └── schema/
│               ├── index.ts
│               └── auth.ts # user, session, account, verification tables + relations
├── public/                 # Static assets (SVGs)
├── drizzle.config.ts       # Drizzle Kit config (output: ./drizzle, schema: ./lib/db/schema)
├── components.json         # shadcn config (base-nova, neutral base color, lucide icons)
├── next.config.ts          # reactCompiler: true
├── tsconfig.json           # Strict, bundler module resolution, @/* path alias
├── eslint.config.mjs       # Flat config with core-web-vitals + typescript
├── postcss.config.mjs      # @tailwindcss/postcss
├── .prettierrc             # printWidth: 100, double quotes, trailing commas
└── .env.example            # DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
```

---

## Path Aliases

Use `@/*` as the root import alias (maps to project root):

```ts
import { cn } from "@/lib/utils";
import { db } from "@/server/lib/db/client";
import { Button } from "@/components/ui/button";
```

---

## Coding Conventions

### General

- **TypeScript strict mode** is enabled. Always provide explicit types; avoid `any`.
- **Double quotes** for strings (Prettier enforced).
- **Trailing commas** everywhere (Prettier enforced).
- **100 character print width** (Prettier enforced).
- **2-space indentation**, no tabs.
- Use **named function declarations** for components (`function Page()` not `const Page = () =>`).
- Export components as **default exports** for pages/layouts, **named exports** for everything else.

### React & Next.js

- **React Compiler is enabled** — do NOT use `useMemo`, `useCallback`, or `React.memo` manually. The compiler optimizes these automatically.
- Use **React Server Components** by default. Only add `"use client"` when the component genuinely needs client-side interactivity (event handlers, hooks, browser APIs).
- Place server-only logic under `server/` directory.
- Use Next.js App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Prefer **Server Actions** for mutations over API routes when possible.

### Styling & Components

- **Tailwind CSS v4** — use `@theme inline` and CSS custom properties for theming. Theme tokens are defined in `app/globals.css` using oklch color space.
- Use the `cn()` utility from `@/lib/utils` for conditional class merging.
- **Prioritize existing shadcn components** — always check if a shadcn component exists in `components/ui/` before creating custom ones. Only create custom components when shadcn does not provide the needed functionality.
- **shadcn components use Base UI primitives** (not Radix) — this is the `base-nova` style. When adding new shadcn components, ensure you use the `base-nova` style variant.
- Use **CVA (class-variance-authority)** for component variant definitions.
- **Use shadcn theme colors** — never hardcode colors (e.g. `text-gray-500`, `bg-blue-600`). Always use semantic theme tokens defined in `app/globals.css` (e.g. `text-muted-foreground`, `bg-primary`, `border-border`, `bg-destructive`). This ensures consistent theming and dark mode support.
- Icons come from **lucide-react** — import individual icons: `import { ChevronDown } from "lucide-react"`.
- Dark mode is class-based (`.dark` class on ancestor element), toggled via `@custom-variant dark (&:is(.dark *))`.

### Adding shadcn Components

```bash
npx shadcn@latest add <component-name>
```

The `components.json` is pre-configured with `base-nova` style. Components will be placed in `components/ui/`.

### Forms

- Use **react-hook-form** for form state management.
- Use **Zod** for schema validation (both client and server).
- Pair with shadcn `<Field>` and `<Input>` components.

### HTTP Requests

- Use **axios** for external HTTP requests.
- Prefer **Server Actions** or **Route Handlers** for internal API communication.

### Date/Time

- Use **dayjs** for date formatting and manipulation.

---

## Database (Drizzle + PostgreSQL)

### Schema Location

All schemas reside in `server/lib/db/schema/`. The barrel export is `server/lib/db/schema/index.ts`.

### Schema Conventions

- Use `pgTable()` from `drizzle-orm/pg-core`.
- Use **UUID v7** for primary keys — generate with `v7()` from the `uuid` package and use the `uuid` column type:
  ```ts
  import { v7 } from "uuid";
  id: uuid("id").primaryKey().$defaultFn(() => v7()),
  ```
  > **Note:** Better Auth tables (`auth.ts`) use `text("id")` with Better Auth's own ID generation — do not change those.
- Use **snake_case** for column names in the database, **camelCase** for TypeScript field names.
- Always add `createdAt` and `updatedAt` timestamps with `defaultNow()` and `$onUpdate()`.
- Define **relations** alongside tables using `relations()` from `drizzle-orm`.
- Add indexes for foreign key columns.

### Database Commands

```bash
pnpm db:generate   # Generate migration files from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:push       # Push schema directly (dev only, no migration files)
pnpm db:studio     # Open Drizzle Studio GUI
```

### Drizzle Config

- Output directory: `./drizzle`
- Schema path: `./lib/db/schema`
- Dialect: `postgresql`
- Connection: `DATABASE_URL` env var

---

## Authentication (Better Auth)

### Server-Side

The auth instance is in `server/lib/auth/client.ts`:

- Uses **Drizzle adapter** with PostgreSQL.
- **Email/password** authentication enabled.
- **Admin plugin** enabled.
- **Cookie caching** enabled (5 min TTL).
- **Rate limiting** enabled (10 requests per 60s, memory storage).

### Client-Side

The client is in `lib/auth-client.ts`:

```ts
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";
```

Pre-exported hooks/methods: `useSession`, `signIn`, `signUp`, `signOut`.

### Auth Schema

Better Auth tables (`user`, `session`, `account`, `verification`) are defined in `server/lib/db/schema/auth.ts` with full Drizzle relations.

---

## Environment Variables

Validated with Zod in `server/lib/config/env.ts`. Required variables:

| Variable             | Description                | Example                                          |
| -------------------- | -------------------------- | ------------------------------------------------ |
| `DATABASE_URL`       | PostgreSQL connection URL  | `postgresql://user:password@localhost:5432/mydb` |
| `BETTER_AUTH_SECRET` | Auth encryption secret     | (generate a random string)                       |
| `BETTER_AUTH_URL`    | Auth base URL              | `http://localhost:3000`                          |
| `CORS_ORIGINS`       | Comma-separated origins    | `http://localhost:3000`                          |
| `NODE_ENV`           | Environment                | `development` / `production` / `test`            |
| `PORT`               | Server port (default 5000) | `5000`                                           |
| `LOG_LEVEL`          | Logging level              | `debug` / `info` / `warn` / `error`              |

---

## Scripts

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run Drizzle migrations
pnpm db:push      # Push schema to DB (dev)
pnpm db:studio    # Open Drizzle Studio
```

---

## Key Patterns

### Creating a New Page

1. Create `app/<route>/page.tsx` (Server Component by default).
2. Use `export const metadata` for SEO.
3. Fetch data directly in the component (no `getServerSideProps`).

### Creating a New Database Table

1. Add schema file in `server/lib/db/schema/<name>.ts`.
2. Export from `server/lib/db/schema/index.ts`.
3. Define relations if applicable.
4. Run `pnpm db:generate` then `pnpm db:migrate`.

### Creating a Client Component

1. Add `"use client"` directive at top of file.
2. Place in `components/` (not in `components/ui/` — that's for shadcn).
3. **Do not** add manual memoization (React Compiler handles it).

### Creating a Server Action

1. Create a file with `"use server"` directive at the top.
2. Export async functions that accept form data or typed arguments.
3. Validate inputs with Zod schemas.
4. Use the `db` client from `@/server/lib/db/client` for database operations.
