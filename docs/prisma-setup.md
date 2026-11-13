# Prisma setup

This project uses Prisma 7 with PostgreSQL. The local development database is
defined in `docker-compose.yml`, and the Prisma schema is in
`prisma/schema.prisma`.

## Required npm packages

For a new project using the same Prisma 7 and PostgreSQL setup, install:

```powershell
npm install @prisma/client @prisma/adapter-pg dotenv
npm install --save-dev prisma
```

- `prisma` provides the CLI for schema validation, migrations, and generation.
- `@prisma/client` provides the generated client used by application code.
- `@prisma/adapter-pg` connects Prisma to PostgreSQL through the `pg` driver.
- `dotenv` loads `DATABASE_URL` from `.env` for Prisma and the Nest app.

The packages are already listed in this repository's `package.json`, so for this
project use `npm install` rather than installing them again.

## Initial setup

From the project root:

1. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   `DATABASE_URL` in the example connects to the local Docker database on port
   `5434`. The example credentials are for local development only.

2. Install dependencies and start PostgreSQL:

   ```powershell
   npm install
   docker compose up dev-db -d
   ```

   `npm install` runs Prisma Client generation through the `postinstall` script.
   To generate it again later, run:

   ```powershell
   npm run prisma:generate
   ```

3. Check the schema and apply its migrations:

   ```powershell
   npm run prisma:validate
   npm exec -- prisma migrate dev
   ```

   The initial migration is already in `prisma/migrations/`; `migrate dev`
   applies any migrations not yet in the database.

## Updating the schema

Edit `prisma/schema.prisma`, then validate and create/apply a migration:

```powershell
npm run prisma:validate
npm exec -- prisma migrate dev --name describe_your_change
npm run prisma:generate
```

Commit the resulting migration files so other developers and deployment
environments can apply the same database changes. Do not edit an already
applied migration; create a new migration for further schema changes.

To open Prisma Studio against the configured database:

```powershell
npm exec -- prisma studio
```

## Using Prisma in NestJS

The generated client is written to `src/generated/prisma` and is ignored by
Git. Regenerate it after installing dependencies or changing the schema.

The `PrismaModule` and `PrismaService` scaffolding under `src/prisma/` is
currently commented out, and `PrismaModule` is not registered in `AppModule`.
Enable and register that module before injecting `PrismaService` into Nest
providers.
