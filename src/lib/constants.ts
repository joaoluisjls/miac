export type UserRole = 'OPERATOR' | 'TECHNICIAN' | 'ADMIN';

export const ROLES = {
  OPERATOR: 'OPERATOR',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN',
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  OPERATOR: 'Operador',
  TECHNICIAN: 'Técnico',
  ADMIN: 'Administrador',
};

export const MACHINE_STATUSES = {
  OPERATING: { label: 'Operando', color: 'text-green-500', bg: 'bg-green-100', icon: '🟢' },
  MAINTENANCE: { label: 'Manutenção', color: 'text-yellow-500', bg: 'bg-yellow-100', icon: '🟡' },
  STOPPED: { label: 'Parada', color: 'text-red-500', bg: 'bg-red-100', icon: '🔴' },
  DEACTIVATED: { label: 'Desativada', color: 'text-gray-500', bg: 'bg-gray-100', icon: '⚫' },
} as const;

export const TICKET_STATUSES = {
  NEW: { label: 'Novo', color: 'text-blue-500', bg: 'bg-blue-100' },
  IN_ANALYSIS: { label: 'Em Análise', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  IN_PROGRESS: { label: 'Em Atendimento', color: 'text-orange-500', bg: 'bg-orange-100' },
  AWAITING_PART: { label: 'Aguardando Peça', color: 'text-purple-500', bg: 'bg-purple-100' },
  AWAITING_PRODUCTION: { label: 'Aguardando Produção', color: 'text-cyan-500', bg: 'bg-cyan-100' },
  RESOLVED: { label: 'Resolvido', color: 'text-green-500', bg: 'bg-green-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-gray-500', bg: 'bg-gray-100' },
} as const;

export const PRIORITY_LEVELS = {
  LOW: { label: 'Baixa', color: 'text-green-500', bg: 'bg-green-100', icon: '🟢' },
  MEDIUM: { label: 'Média', color: 'text-yellow-500', bg: 'bg-yellow-100', icon: '🟡' },
  HIGH: { label: 'Alta', color: 'text-orange-500', bg: 'bg-orange-100', icon: '🟠' },
  CRITICAL: { label: 'Crítica', color: 'text-red-500', bg: 'bg-red-100', icon: '🔴' },
} as const;

export const PROBLEM_TYPES = [
  { value: 'MACHINE_STOPPED', label: 'Máquina parada' },
  { value: 'ELECTRICAL', label: 'Falha elétrica' },
  { value: 'MECHANICAL', label: 'Falha mecânica' },
  { value: 'HYDRAULIC', label: 'Falha hidráulica' },
  { value: 'PNEUMATIC', label: 'Falha pneumática' },
  { value: 'SENSOR', label: 'Falha de sensor' },
  { value: 'NOISE', label: 'Ruído' },
  { value: 'LEAK', label: 'Vazamento' },
  { value: 'PANEL_ERROR', label: 'Erro no painel' },
  { value: 'SAFETY', label: 'Segurança' },
  { value: 'OTHER', label: 'Outro' },
] as const;

export const COMPONENT_ALERT_LEVELS = {
  NORMAL: { label: 'Normal', color: 'text-green-500', bg: 'bg-green-100', icon: '🟢' },
  ATTENTION: { label: 'Atenção', color: 'text-yellow-500', bg: 'bg-yellow-100', icon: '🟡' },
  PLAN_MAINTENANCE: { label: 'Planejar Manutenção', color: 'text-orange-500', bg: 'bg-orange-100', icon: '🟠' },
  URGENT: { label: 'Substituição Urgente', color: 'text-red-500', bg: 'bg-red-100', icon: '🔴' },
} as const;
