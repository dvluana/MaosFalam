import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// dotenv/config only loads .env — load .env.local for Next.js dev conventions
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
