import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const parts = await prisma.part.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(parts);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar peças' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, category, manufacturer, model, currentStock, minimumStock, location, supplier, price, observations } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios' }, { status: 400 });
    }

    const part = await prisma.part.create({
      data: {
        code, name, category: category || null, manufacturer: manufacturer || null,
        model: model || null, currentStock: currentStock || 0, minimumStock: minimumStock || 0,
        location: location || null, supplier: supplier || null, price: price || null,
        observations: observations || null,
      },
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar peça' }, { status: 500 });
  }
}
