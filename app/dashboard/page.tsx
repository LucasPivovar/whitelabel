import Panel from '../panel';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!(await getUser())) redirect('/login?redirect=/dashboard');
  return <Panel initialView="overview" />;
}
