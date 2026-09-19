import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    const where: any = {};
    if (machineId) where.machineId = machineId;

    const codes = await prisma.errorCode.findMany({
      where,
      include: { machine: { select: { id: true, name: true } } },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(codes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar códigos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, machineId, description, probableCause, solution, riskLevel, requiredEquipment, requiredTools, observations, safetyInfo } = body;

    if (!code || !name || !description) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    const errorCode = await prisma.errorCode.create({
      data: {
        code, name, description,
        machineId: machineId || null,
        probableCause: probableCause || null,
        solution: solution || null,
        riskLevel: riskLevel || 'MEDIUM',
        requiredEquipment: requiredEquipment || null,
        requiredTools: requiredTools || null,
        observations: observations || null,
        safetyInfo: safetyInfo || null,
      },
    });

    return NextResponse.json(errorCode, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar código de erro' }, { status: 500 });
  }
}
