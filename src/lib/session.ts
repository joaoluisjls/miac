import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { UserRole } from './constants';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (session.user as any).role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      redirect('/unauthorized');
    }
  }

  return session;
}

export async function getUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return {
    id: (session.user as any).id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as any).role as UserRole,
  };
}
