const MEOO_AI_BASE_URL = 'https://api.meoo.host';
const MEOO_PROJECT_SERVICE_AK = Deno.env.get('MEOO_PROJECT_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, chapter } = body;

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: '请输入需要润色的内容' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `你是一位专业的回忆录编辑，擅长将口语化的讲述改写成优美、流畅、富有情感的文字。

要求：
1. 保持原意和情感，不要改变讲述者的本意
2. 适当润色，让文字更通顺、更有文学性
3. 保留讲述者的个人风格和语气
4. 根据章节主题「${chapter || '人生故事'}」调整文风
5. 输出一段完整的文字，不要分点
6. 字数控制在200-400字之间`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请润色以下内容：\n\n${text}` }
    ];

    // 调用 Meoo AI
    const response = await fetch(
      `${MEOO_AI_BASE_URL}/meoo-ai/compatible-mode/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MEOO_PROJECT_SERVICE_AK}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3.6-plus',
          messages,
          stream: false
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(
        JSON.stringify({ error: 'AI服务暂时不可用，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const polishedText = result.choices?.[0]?.message?.content || text;

    return new Response(
      JSON.stringify({ polishedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
