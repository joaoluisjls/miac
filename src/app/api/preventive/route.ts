import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.preventiveMaintenance.findMany({
      include: { machine: { select: { id: true, name: true } } },
      orderBy: { nextExecution: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar planos preventivos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { machineId, title, description, periodicityMonths, responsible, observations } = body;

    if (!machineId || !title) {
      return NextResponse.json({ error: 'Máquina e título são obrigatórios' }, { status: 400 });
    }

    const now = new Date();
    const nextExecution = periodicityMonths
      ? new Date(now.getTime() + periodicityMonths * 30 * 86400000)
      : null;

    const plan = await prisma.preventiveMaintenance.create({
      data: {
        machineId, title, description: description || null,
        periodicityMonths: periodicityMonths || null,
        responsible: responsible || null,
        observations: observations || null,
        lastExecution: null,
        nextExecution,
        status: 'OK',
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar plano preventivo' }, { status: 500 });
  }
}
