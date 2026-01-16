import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { PrismaClient } from "./generated/prisma/client"

const { Pool } = pg

const dbConfig = {
  host: process.env.DB_HOST || 'ep-cool-king-ahloqdjv-pooler.c-3.us-east-1.aws.neon.tech',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'neondb_owner',
  password: process.env.DB_PASSWORD || 'npg_tbEZGoX5zig9',
  database: process.env.DB_NAME || 'wechat',
  ssl: { rejectUnauthorized: false }, // since Neon requires SSL
};




console.log("Database config:", {
  ...dbConfig,
  password: dbConfig.password ? '***' : 'NOT SET'
})

const pool = new Pool(dbConfig)



pool.on('error', (err) => {

  console.error('Unexpected error on idle client', err)
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack)
  } else {
    console.log(' Database connected successfully')
    release()
  }
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma