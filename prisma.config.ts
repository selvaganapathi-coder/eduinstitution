import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({schema:"prisma/schema.prisma",migrations:{path:"prisma/migrations",seed:"node --experimental-strip-types prisma/seed.ts && node --experimental-strip-types prisma/seed-course-permissions.ts"},datasource:{url:env("DIRECT_DATABASE_URL")}});
