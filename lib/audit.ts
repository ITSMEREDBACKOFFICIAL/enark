import { supabase } from './supabase';

export async function logSystemAction(action: string, target: string = 'N/A', metadata: any = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('system_logs').insert([
      {
        action,
        target,
        staff_email: user?.email || 'SYSTEM_ROOT',
        metadata,
        status: 'SUCCESS'
      }
    ]);
  } catch (e) {
    console.error('System Logging Failure:', e);
  }
}
