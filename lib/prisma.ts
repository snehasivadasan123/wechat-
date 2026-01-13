import { PrismaClient } from "./generated/prisma"

import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create adapter
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Pass adapter to PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma