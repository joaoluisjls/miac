import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      where: { status: { not: 'DEACTIVATED' } },
      include: { sector: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(machines);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar máquinas' }, { status: 500 });
  }
}
