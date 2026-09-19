import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: params.id },
      include: {
        sector: true,
        components: true,
        errorCodes: true,
        tickets: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 });
    }

    return NextResponse.json(machine);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar máquina' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { name, code, sectorId, manufacturer, model, serialNumber, year, location, status, observations } = body;

    if (!name || !sectorId) {
      return NextResponse.json({ error: 'Nome e setor são obrigatórios' }, { status: 400 });
    }

    const machine = await prisma.machine.create({
      data: {
        name, sectorId, code: code || null, manufacturer: manufacturer || null,
        model: model || null, serialNumber: serialNumber || null,
        year: year ? parseInt(year) : null, location: location || null,
        status: status || 'OPERATING', observations: observations || null,
      },
      include: { sector: true },
    });

    return NextResponse.json(machine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar máquina' }, { status: 500 });
  }
}
