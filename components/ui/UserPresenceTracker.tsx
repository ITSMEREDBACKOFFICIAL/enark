'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UserPresenceTracker() {
  useEffect(() => {
    const channel = supabase.channel('system_presence', {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        // Broadcast the count to the dashboard
        supabase.channel('presence_stats').send({
          type: 'broadcast',
          event: 'count',
          payload: { count: count || 1 },
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
