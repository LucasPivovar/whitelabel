'use client';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ShieldCheck, Building2, LogOut } from '@/components/icons';
import type { Tenant } from '@/lib/model';
export default function RoleToolbar({
  role,
  tenantId,
  tenants,
  onChange,
}: {
  role: 'admin' | 'tenant';
  tenantId: string;
  tenants: Tenant[];
  onChange: (id: string) => void;
}) {
  const router = useRouter();
  const active = tenants.filter((t) => t.status === 'active');
  return (
    <div className="role-toolbar">
      <Tabs
        className="role-tabs"
        value={tenantId ? 'tenant' : 'admin'}
        onValueChange={(v) => {
          if (v === 'admin' && role === 'admin') onChange('');
          else if (v === 'tenant' && active.length)
            onChange(tenantId || active[0].id);
        }}
      >
        <TabsList>
          <TabsTrigger value="admin" disabled={role !== 'admin'}>
            <ShieldCheck size={14} />
            Super admin
          </TabsTrigger>
          <TabsTrigger value="tenant" disabled={!active.length}>
            <Building2 size={14} />
            Tenant
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {tenantId && (
        <Select value={tenantId} onValueChange={(v) => v && onChange(v)}>
          <SelectTrigger
            className="tenant-switcher"
            aria-label="Selecionar operação"
          >
            <SelectValue>{tenants.find(t=>t.id===tenantId)?.name||'Selecionar operação'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {active.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <button
        className="icon-button logout-button"
        title="Sair"
        aria-label="Sair"
        onClick={async () => {
          const response = await fetch('/api/auth/logout', { method: 'POST' });
          if (response.ok) {
            router.replace('/login');
            router.refresh();
          }
        }}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
