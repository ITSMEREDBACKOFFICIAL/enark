'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DynamicStyleInjector() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'main')
        .single();
      
      if (data) {
        setConfig(data);
        // Inject primary color into CSS variables
        if (data.primary_color) {
          document.documentElement.style.setProperty('--enark-red', data.primary_color);
        }
      }
    }
    fetchConfig();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('app_config_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' }, (payload) => {
        if (payload.new && payload.new.id === 'main') {
          const newConfig = payload.new;
          setConfig(newConfig);
          if (newConfig.primary_color) {
            document.documentElement.style.setProperty('--enark-red', newConfig.primary_color);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
