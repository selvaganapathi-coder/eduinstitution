import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI uses the direct Neon connection for migrations.
    // Runtime Prisma Client will use the appropriate pooled/edge connection.
    url: env("DIRECT_DATABASE_URL"),
  },
});
