import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (ordem reversa por FK)
  await prisma.file.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.historyItem.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.preventiveMaintenance.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.part.deleteMany();
  await prisma.replacement.deleteMany();
  await prisma.component.deleteMany();
  await prisma.errorCode.deleteMany();
  await prisma.ticketPart.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Dados antigos limpos');

  // Criar senhas hasheadas
  const adminPass = await bcrypt.hash('admin123', 10);
  const techPass = await bcrypt.hash('tecnico123', 10);
  const operatorPass = await bcrypt.hash('operador123', 10);

  // Criar usuário ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@miac.com' },
    update: {},
    create: {
      name: 'Administrador MIAC',
      email: 'admin@miac.com',
      password: adminPass,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar técnicos
  const tech1 = await prisma.user.upsert({
    where: { email: 'carlos@miac.com' },
    update: {},
    create: {
      name: 'Carlos Silva',
      email: 'carlos@miac.com',
      password: techPass,
      role: 'TECHNICIAN',
    },
  });
  console.log('✅ Técnico criado:', tech1.email);

  const tech2 = await prisma.user.upsert({
    where: { email: 'ana@miac.com' },
    update: {},
    create: {
      name: 'Ana Oliveira',
      email: 'ana@miac.com',
      password: techPass,
      role: 'TECHNICIAN',
    },
  });
  console.log('✅ Técnico criado:', tech2.email);

  // Criar operadores
  const op1 = await prisma.user.upsert({
    where: { email: 'joao@miac.com' },
    update: {},
    create: {
      name: 'João Pereira',
      email: 'joao@miac.com',
      password: operatorPass,
      role: 'OPERATOR',
    },
  });
  console.log('✅ Operador criado:', op1.email);

  const op2 = await prisma.user.upsert({
    where: { email: 'maria@miac.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'maria@miac.com',
      password: operatorPass,
      role: 'OPERATOR',
    },
  });
  console.log('✅ Operador criado:', op2.email);

  // Criar setores
  const sectors = ['Produção', 'Montagem', 'Estamparia', 'Solda', 'Pintura', 'Expedição'];
  const sectorRecords: Record<string, any> = {};

  for (const sectorName of sectors) {
    const sector = await prisma.sector.upsert({
      where: { name: sectorName },
      update: {},
      create: { name: sectorName },
    });
    sectorRecords[sectorName] = sector;
  }
  console.log('✅ Setores criados:', sectors.length);

  // Criar máquinas
  const machineData = [
    { name: 'Prensa 01', code: 'PRN-001', sector: 'Produção', manufacturer: 'Schuler', model: 'SPKA 2500', status: 'OPERATING' },
    { name: 'Prensa 02', code: 'PRN-002', sector: 'Produção', manufacturer: 'Schuler', model: 'SPKA 1600', status: 'OPERATING' },
    { name: 'Prensa 03', code: 'PRN-003', sector: 'Estamparia', manufacturer: 'Bruderer', model: 'BSTA 25', status: 'MAINTENANCE' },
    { name: 'Prensa 04', code: 'PRN-004', sector: 'Estamparia', manufacturer: 'Bruderer', model: 'BSTA 40', status: 'STOPPED' },
    { name: 'CNC 01', code: 'CNC-001', sector: 'Produção', manufacturer: 'DMG Mori', model: 'CMX 800V', status: 'OPERATING' },
    { name: 'CNC 02', code: 'CNC-002', sector: 'Produção', manufacturer: 'DMG Mori', model: 'CMX 1100V', status: 'OPERATING' },
    { name: 'Dobradeira 01', code: 'DOB-001', sector: 'Montagem', manufacturer: 'Amada', model: 'HG 1303', status: 'OPERATING' },
    { name: 'Soldadora 01', code: 'SOL-001', sector: 'Solda', manufacturer: 'Lincoln', model: 'Power Wave S500', status: 'OPERATING' },
    { name: 'Linha de Pintura 01', code: 'PNT-001', sector: 'Pintura', manufacturer: 'Wagner', model: 'ColorMax', status: 'OPERATING' },
    { name: 'Transportador 01', code: 'TRA-001', sector: 'Expedição', manufacturer: 'Hytrol', model: 'EZLogic', status: 'OPERATING' },
  ];

  const machineRecords: Record<string, any> = {};

  for (const m of machineData) {
    const machine = await prisma.machine.create({
      data: {
        name: m.name,
        code: m.code,
        sectorId: sectorRecords[m.sector].id,
        manufacturer: m.manufacturer,
        model: m.model,
        status: m.status,
        year: 2020 + Math.floor(Math.random() * 5),
        location: `Área ${m.sector}`,
        installationDate: new Date(2020, 0, 1),
      },
    });
    machineRecords[m.name] = machine;
  }
  console.log('✅ Máquinas criadas:', machineData.length);

  // Criar componentes
  const componentsData = [
    { machine: 'Prensa 01', name: 'Rolamento Principal', code: 'ROL-001', manufacturer: 'SKF', installationDate: new Date(2024, 0, 15), usefulLifeMonths: 12 },
    { machine: 'Prensa 01', name: 'Correia Transmissão', code: 'COR-001', manufacturer: 'Gates', installationDate: new Date(2024, 6, 1), usefulLifeMonths: 18 },
    { machine: 'Prensa 02', name: 'Sensor de Posição', code: 'SEN-001', manufacturer: 'Keyence', installationDate: new Date(2025, 0, 10), usefulLifeMonths: 24 },
    { machine: 'Prensa 04', name: 'Rolamento Principal', code: 'ROL-004', manufacturer: 'SKF', installationDate: new Date(2023, 6, 1), usefulLifeMonths: 12 },
    { machine: 'CNC 01', name: 'Filtro Hidráulico', code: 'FLT-001', manufacturer: 'Parker', installationDate: new Date(2025, 3, 1), usefulLifeMonths: 6 },
    { machine: 'CNC 02', name: 'Spindle Motor', code: 'MOT-002', manufacturer: 'FANUC', installationDate: new Date(2024, 9, 15), usefulLifeMonths: 36 },
  ];

  for (const c of componentsData) {
    await prisma.component.create({
      data: {
        machineId: machineRecords[c.machine].id,
        name: c.name, code: c.code, manufacturer: c.manufacturer,
        installationDate: c.installationDate, usefulLifeMonths: c.usefulLifeMonths,
        quantity: 1,
      },
    });
  }
  console.log('✅ Componentes criados:', componentsData.length);

  // Criar códigos de erro
  const errorCodesData = [
    { code: 'ERR-204', machine: 'Prensa 04', name: 'Falha Sensor de Posição', description: 'Sensor de posição apresentou falha durante operação', probableCause: 'Sensor desalinhado ou com sujeira', solution: 'Limpar ou reposicionar sensor. Verificar conexão elétrica.', riskLevel: 'HIGH' },
    { code: 'ERR-101', machine: 'Prensa 01', name: 'Sobrecarga Motor', description: 'Motor principal apresentou sobrecarga', probableCause: 'Rolamento com desgaste ou lubrificação insuficiente', solution: 'Verificar rolamento e lubrificação. Substituir se necessário.', riskLevel: 'CRITICAL' },
    { code: 'ERR-305', machine: 'CNC 01', name: 'Erro Hidráulico', description: 'Sistema hidráulico com pressão abaixo do normal', probableCause: 'Vazamento na mangueira ou filtro obstruído', solution: 'Verificar conexões hidráulicas. Trocar filtro se obstruído.', riskLevel: 'MEDIUM' },
    { code: 'ERR-050', machine: 'CNC 02', name: 'Erro de Programa', description: 'Programa CNC com erro de compilação', probableCause: 'Programa corrompido ou incompatível', solution: 'Recarregar programa do backup. Verificar parâmetros.', riskLevel: 'LOW' },
  ];

  for (const ec of errorCodesData) {
    await prisma.errorCode.create({
      data: {
        code: ec.code, name: ec.name, description: ec.description,
        probableCause: ec.probableCause, solution: ec.solution,
        riskLevel: ec.riskLevel,
        machineId: machineRecords[ec.machine]?.id || null,
      },
    });
  }
  console.log('✅ Códigos de erro criados:', errorCodesData.length);

  // Criar peças
  const partsData = [
    { code: 'PEC-001', name: 'Rolamento 6205-2RS', category: 'Mecânica', currentStock: 15, minimumStock: 5, supplier: 'SKF' },
    { code: 'PEC-002', name: 'Correia B68', category: 'Mecânica', currentStock: 8, minimumStock: 3, supplier: 'Gates' },
    { code: 'PEC-003', name: 'Sensor Indutivo PR18', category: 'Elétrica', currentStock: 4, minimumStock: 3, supplier: 'Keyence' },
    { code: 'PEC-004', name: 'Filtro Hidráulico HF-250', category: 'Hidráulica', currentStock: 2, minimumStock: 3, supplier: 'Parker' },
    { code: 'PEC-005', name: 'Fusível 20A', category: 'Elétrica', currentStock: 50, minimumStock: 20, supplier: 'Schneider' },
    { code: 'PEC-006', name: 'Contator 25A', category: 'Elétrica', currentStock: 3, minimumStock: 2, supplier: 'Schneider' },
    { code: 'PEC-007', name: 'Lubrificante Industrial 20L', category: 'Lubrificação', currentStock: 6, minimumStock: 2, supplier: 'Mobil' },
  ];

  for (const p of partsData) {
    await prisma.part.create({ data: p });
  }
  console.log('✅ Peças criadas:', partsData.length);

  // Criar manutenção preventiva
  const preventiveData = [
    { machine: 'Prensa 01', title: 'Inspeção Rolamento Principal', periodicityMonths: 12, responsible: 'Equipe de Manutenção' },
    { machine: 'Prensa 02', title: 'Verificação Sensores', periodicityMonths: 6, responsible: 'Carlos Silva' },
    { machine: 'CNC 01', title: 'Troca Filtro Hidráulico', periodicityMonths: 6, responsible: 'Ana Oliveira' },
    { machine: 'Dobradeira 01', title: 'Lubrificação Geral', periodicityMonths: 3, responsible: 'Equipe de Manutenção' },
  ];

  for (const pm of preventiveData) {
    const nextExec = new Date();
    nextExec.setMonth(nextExec.getMonth() + (pm.periodicityMonths || 6));

    await prisma.preventiveMaintenance.create({
      data: {
        machineId: machineRecords[pm.machine].id,
        title: pm.title, periodicityMonths: pm.periodicityMonths,
        responsible: pm.responsible, nextExecution: nextExec, status: 'OK',
      },
    });
  }
  console.log('✅ Planos preventivos criados:', preventiveData.length);

  // Criar chamados de exemplo
  const ticketsData = [
    { machine: 'Prensa 04', creator: op1, priority: 'CRITICAL', problemType: 'MACHINE_STOPPED', description: 'Máquina parou durante ciclo. Apresentou código ERR-204 no painel.', errorCode: 'ERR-204', status: 'NEW' },
    { machine: 'Prensa 01', creator: op2, priority: 'HIGH', problemType: 'NOISE', description: 'Ruído anormal no rolamento principal durante operação.', status: 'IN_PROGRESS', assignedTo: tech1 },
    { machine: 'CNC 01', creator: op1, priority: 'MEDIUM', problemType: 'HYDRAULIC', description: 'Pressão hidráulica caiu durante usinagem.', errorCode: 'ERR-305', status: 'RESOLVED', assignedTo: tech2 },
    { machine: 'Prensa 02', creator: op2, priority: 'LOW', problemType: 'SENSOR', description: 'Sensor de proximidade intermitente.', status: 'IN_ANALYSIS', assignedTo: tech1 },
  ];

  let ticketNumber = 1;
  for (const t of ticketsData) {
    await prisma.ticket.create({
      data: {
        number: ticketNumber++,
        machineId: machineRecords[t.machine].id,
        sectorId: sectorRecords['Produção'].id,
        creatorId: t.creator.id,
        assignedToId: t.assignedTo?.id || null,
        problemType: t.problemType,
        description: t.description,
        errorCode: t.errorCode || null,
        priority: t.priority,
        status: t.status,
        resolvedAt: t.status === 'RESOLVED' ? new Date() : null,
      },
    });
  }
  console.log('✅ Chamados de exemplo criados:', ticketsData.length);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin:    admin@miac.com / admin123');
  console.log('   Técnico:  carlos@miac.com / tecnico123');
  console.log('   Operador: joao@miac.com / operador123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
