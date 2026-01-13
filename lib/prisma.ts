import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { PrismaClient } from "./generated/prisma/client"

const { Pool } = pg

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres1234',
  database: process.env.DB_NAME || 'wechat',
  ssl: false,
}

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