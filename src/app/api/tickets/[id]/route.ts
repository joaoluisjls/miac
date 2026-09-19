import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        machine: true,
        sector: true,
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        ticketParts: { include: { part: true } },
        historyItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar chamado' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { status, assignedToId, diagnosis, cause, solution, maintenanceTime } = body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { machine: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (cause) updateData.cause = cause;
    if (solution) updateData.solution = solution;
    if (maintenanceTime) updateData.maintenanceTime = maintenanceTime;

    const updated = await prisma.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        machine: true,
        sector: true,
        creator: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    // Create history item
    await prisma.historyItem.create({
      data: {
        machineId: ticket.machineId,
        ticketId: ticket.id,
        type: 'TICKET',
        title: status ? `Status alterado para ${status}` : 'Chamado atualizado',
        description: `Alterado por ${(session.user as any).name || 'Sistema'}`,
        userId: (session.user as any).id,
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: ticket.creatorId,
        ticketId: ticket.id,
        type: 'TICKET_STATUS_CHANGE',
        title: `Chamado #${ticket.number} atualizado`,
        message: status ? `Status: ${status}` : 'Seu chamado foi atualizado',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    return NextResponse.json({ error: 'Erro ao atualizar chamado' }, { status: 500 });
  }
}
