const WECHAT_PAY_MCHID = Deno.env.get('WECHAT_PAY_MCHID') || '';
const WECHAT_PAY_API_KEY = Deno.env.get('WECHAT_PAY_API_KEY') || '';
const WECHAT_PAY_APPID = Deno.env.get('WECHAT_PAY_APPID') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 生成订单号
function generateOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `LC${dateStr}${random}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, orderNo, planType, planName, price, openid } = body;

    // 创建支付订单
    if (action === 'create') {
      if (!planType || !price) {
        return new Response(
          JSON.stringify({ error: '缺少必要参数' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newOrderNo = generateOrderNo();
      
      // 这里应该调用微信支付 API 创建订单
      // 由于微信支付需要复杂的签名和证书，这里返回模拟数据
      // 实际项目中需要接入真实的微信支付 API
      
      return new Response(
        JSON.stringify({
          orderNo: newOrderNo,
          prepayId: `mock_${Date.now()}`,
          nonceStr: Math.random().toString(36).substring(2, 15),
          timeStamp: Math.floor(Date.now() / 1000).toString(),
          package: 'prepay_id=mock',
          signType: 'RSA',
          paySign: 'mock_sign',
          // 模拟支付二维码链接
          codeUrl: `https://api.meoo.host/pay/qrcode/${newOrderNo}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 查询支付状态
    if (action === 'query') {
      if (!orderNo) {
        return new Response(
          JSON.stringify({ error: '缺少订单号' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 模拟查询结果
      // 实际项目中需要调用微信支付查询 API
      return new Response(
        JSON.stringify({
          orderNo,
          status: 'pending', // pending, paid, failed
          paidAt: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 支付回调通知
    if (action === 'notify') {
      // 处理微信支付回调
      // 验证签名，更新订单状态
      return new Response(
        JSON.stringify({ code: 'SUCCESS', message: 'OK' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: '未知操作' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('支付处理错误:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
