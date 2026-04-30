'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MaintenanceMode from "./MaintenanceMode";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    async function checkMaintenance() {
      // Never show maintenance on the command page or login
      if (pathname?.startsWith('/command') || pathname?.startsWith('/login')) {
        setIsMaintenance(false);
        return;
      }

      const { data } = await supabase
        .from('app_config')
        .select('is_maintenance_mode')
        .eq('id', 'main')
        .single();
      
      if (data?.is_maintenance_mode) {
        setIsMaintenance(true);
      } else {
        setIsMaintenance(false);
      }
    }
    checkMaintenance();
  }, [pathname]);

  if (isMaintenance) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}
