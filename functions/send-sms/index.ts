import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { phone, action } = body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: '请输入正确的手机号' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 发送验证码
    if (action === 'send') {
      // 检查发送频率（1分钟内只能发一次）
      const { data: lastCode } = await supabaseAdmin
        .from('sms_codes')
        .select('created_at')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastCode) {
        const lastSent = new Date(lastCode.created_at).getTime();
        const now = Date.now();
        if (now - lastSent < 60000) {
          return new Response(
            JSON.stringify({ error: '请稍后再试（60秒限制）' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟过期

      // 保存验证码到数据库
      const { error: insertError } = await supabaseAdmin
        .from('sms_codes')
        .insert({
          phone,
          code,
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      if (insertError) {
        console.error('保存验证码失败:', insertError);
        return new Response(
          JSON.stringify({ error: '发送失败，请重试' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // TODO: 调用真实短信服务发送验证码
      // 这里返回验证码用于测试（生产环境应该通过短信发送）
      console.log(`验证码已生成: ${phone} -> ${code}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: '验证码已发送',
          // 测试模式下返回验证码，生产环境请删除
          code: code,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 验证验证码
    if (action === 'verify') {
      const { code } = body;

      if (!code || code.length !== 6) {
        return new Response(
          JSON.stringify({ error: '请输入6位验证码' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: smsCode, error: queryError } = await supabaseAdmin
        .from('sms_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (queryError || !smsCode) {
        return new Response(
          JSON.stringify({ error: '验证码错误或已过期' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 标记验证码为已使用
      await supabaseAdmin
        .from('sms_codes')
        .update({ used: true })
        .eq('id', smsCode.id);

      return new Response(
        JSON.stringify({ success: true, message: '验证成功' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: '未知操作' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('短信服务错误:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
