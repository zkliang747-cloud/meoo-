import { supabase, getSupabaseUrl } from '../supabase/client';

// 发送短信验证码
export async function sendSMSCode(phone: string): Promise<{ success: boolean; message: string; code?: string }> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/send-sms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'send',
      phone,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || '发送验证码失败');
  }

  return result;
}

// 验证短信验证码
export async function verifySMSCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/send-sms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'verify',
      phone,
      code,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || '验证码错误');
  }

  return result;
}
