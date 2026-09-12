import Panel from '../panel';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BackupsPage() {
  if (!(await getUser())) redirect('/login?redirect=/backups');
  return <Panel initialView="backups" />;
}
