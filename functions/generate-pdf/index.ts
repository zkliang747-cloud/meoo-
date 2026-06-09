import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 生成精美的PDF HTML模板
function generateMemoirHTML(title: string, stories: any[], username: string): string {
  const completedStories = stories.filter(s => s.polished_text || s.raw_text);

  const storiesHTML = completedStories.map((story, index) => `
    <div class="story-item">
      <div class="chapter-badge">${story.chapter}</div>
      <h2 class="question">${story.question_text}</h2>
      <div class="content">
        ${story.polished_text || story.raw_text}
      </div>
    </div>
  `).join('');

  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
      line-height: 1.8;
      color: #3E2E21;
      background: #FFF;
    }

    /* 封面 */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 40px;
      background: linear-gradient(135deg, #FFF8F0 0%, #FFEFE5 100%);
      border-bottom: 3px solid #C6A43F;
    }

    .cover-decoration {
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #C6A43F, transparent);
      margin: 30px 0;
    }

    .cover h1 {
      font-size: 42px;
      font-weight: 700;
      color: #3E2E21;
      margin-bottom: 20px;
      letter-spacing: 8px;
    }

    .cover .subtitle {
      font-size: 18px;
      color: #8B7355;
      margin-bottom: 40px;
    }

    .cover .author {
      font-size: 16px;
      color: #5C4B3A;
      margin-top: 60px;
    }

    .cover .date {
      font-size: 14px;
      color: #8B7355;
      margin-top: 10px;
    }

    /* 内容页 */
    .content-page {
      max-width: 700px;
      margin: 0 auto;
      padding: 60px 40px;
    }

    .story-item {
      margin-bottom: 50px;
      padding-bottom: 40px;
      border-bottom: 1px solid #E8DDD0;
    }

    .story-item:last-child {
      border-bottom: none;
    }

    .chapter-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #FF6B4A;
      color: white;
      font-size: 13px;
      font-weight: 600;
      border-radius: 20px;
      margin-bottom: 16px;
    }

    .question {
      font-size: 20px;
      font-weight: 600;
      color: #3E2E21;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .content {
      font-size: 16px;
      color: #5C4B3A;
      text-indent: 2em;
      text-align: justify;
    }

    .content p {
      margin-bottom: 1em;
    }

    /* 页脚 */
    .footer {
      text-align: center;
      padding: 40px;
      background: #FCF9F6;
      border-top: 1px solid #E8DDD0;
      margin-top: 60px;
    }

    .footer-logo {
      font-size: 24px;
      font-weight: 700;
      color: #3E2E21;
      margin-bottom: 10px;
    }

    .footer-text {
      font-size: 13px;
      color: #8B7355;
    }

    /* 打印优化 */
    @media print {
      .cover {
        page-break-after: always;
      }

      .story-item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- 封面 -->
  <div class="cover">
    <div class="cover-decoration"></div>
    <h1>${title}</h1>
    <div class="subtitle">留声成文 · 传家百年</div>
    <div class="cover-decoration"></div>
    <div class="author">讲述者：${username}</div>
    <div class="date">成书日期：${currentDate}</div>
  </div>

  <!-- 内容 -->
  <div class="content-page">
    ${storiesHTML}
  </div>

  <!-- 页脚 -->
  <div class="footer">
    <div class="footer-logo">留传</div>
    <div class="footer-text">
      本回忆录由「留传」平台生成<br>
      扫描二维码可收听原声讲述
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, stories, title } = body;

    if (!userId || !stories || !Array.isArray(stories)) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取用户信息
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    const username = profile?.username || '我';
    const memoirTitle = title || `${username}的回忆录`;

    // 生成HTML内容
    const htmlContent = generateMemoirHTML(memoirTitle, stories, username);

    // 上传到存储桶
    const fileName = `memoirs/${userId}/${Date.now()}_memoir.html`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('pdfs')
      .upload(fileName, new Blob([htmlContent], { type: 'text/html' }), {
        contentType: 'text/html',
      });

    if (uploadError) {
      console.error('上传PDF失败:', uploadError);
      return new Response(
        JSON.stringify({ error: '生成PDF失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('pdfs')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        pdfUrl: publicUrl,
        htmlContent,
        message: 'PDF生成成功',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('PDF生成错误:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
