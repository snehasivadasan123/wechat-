import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await prisma.$connect()
    console.log(' Database connected!')

    return NextResponse.json({
      status: 'success',
      message: 'Prisma is working correctly!'
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}