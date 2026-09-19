import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(sectors);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar setores' }, { status: 500 });
  }
}
