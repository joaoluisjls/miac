import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const machineStats = await prisma.machine.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalTickets = await prisma.ticket.count();
    const totalMachines = await prisma.machine.count();
    const activeComponents = await prisma.component.count();
    const allParts = await prisma.part.findMany();
    const lowStockParts = allParts.filter(p => p.currentStock <= p.minimumStock);

    // Pending preventive maintenances
    const now = new Date();
    const overduePM = await prisma.preventiveMaintenance.count({
      where: { nextExecution: { lt: now }, status: 'OVERDUE' },
    });
    const upcomingPM = await prisma.preventiveMaintenance.count({
      where: { nextExecution: { gte: now, lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } },
    });

    return NextResponse.json({
      tickets: {
        total: totalTickets,
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
      },
      machines: {
        total: totalMachines,
        byStatus: machineStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
      },
      components: { total: activeComponents },
      stock: { lowCount: lowStockParts.length },
      preventive: { overdue: overduePM, upcoming: upcomingPM },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
