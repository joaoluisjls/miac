import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const machineId = searchParams.get('machineId');

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (machineId) where.machineId = machineId;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        machine: true,
        sector: true,
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar chamados' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { machineId, sectorId, problemType, description, errorCode, priority, photo, video } = body;

    if (!machineId || !sectorId || !problemType || !description) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Generate ticket number
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const ticketNumber = (lastTicket?.number || 0) + 1;

    const ticket = await prisma.ticket.create({
      data: {
        number: ticketNumber,
        machineId,
        sectorId,
        creatorId: (session.user as any).id,
        problemType,
        description,
        errorCode: errorCode || null,
        priority: priority || 'MEDIUM',
        photo: photo || null,
        video: video || null,
        status: 'NEW',
      },
      include: {
        machine: true,
        sector: true,
        creator: { select: { id: true, name: true } },
      },
    });

    // Create notifications for all technicians and admins
    const techUsers = await prisma.user.findMany({
      where: {
        role: { in: ['TECHNICIAN', 'ADMIN'] },
        active: true,
        id: { not: (session.user as any).id },
      },
    });

    await prisma.notification.createMany({
      data: techUsers.map((user) => ({
        userId: user.id,
        ticketId: ticket.id,
        type: 'NEW_TICKET',
        title: priority === 'CRITICAL' ? '🚨 CHAMADO CRÍTICO' : '🔔 Novo Chamado',
        message: `Máquina: ${ticket.machine.name} — ${problemType}`,
        read: false,
      })),
    });

    // Create history item
    await prisma.historyItem.create({
      data: {
        machineId,
        ticketId: ticket.id,
        type: 'TICKET',
        title: `Chamado #${ticket.number} aberto`,
        description,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    return NextResponse.json({ error: 'Erro ao criar chamado' }, { status: 500 });
  }
}
