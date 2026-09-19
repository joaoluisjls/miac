import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    const where: any = {};
    if (machineId) where.machineId = machineId;

    const components = await prisma.component.findMany({
      where,
      include: { machine: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(components);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar componentes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { machineId, name, code, manufacturer, model, serialNumber, installationDate, usefulLifeMonths, quantity, location, supplier, observations } = body;

    if (!machineId || !name || !installationDate) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    const component = await prisma.component.create({
      data: {
        machineId, name, installationDate: new Date(installationDate),
        code: code || null, manufacturer: manufacturer || null, model: model || null,
        serialNumber: serialNumber || null, usefulLifeMonths: usefulLifeMonths || null,
        quantity: quantity || 1, location: location || null,
        supplier: supplier || null, observations: observations || null,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar componente' }, { status: 500 });
  }
}
