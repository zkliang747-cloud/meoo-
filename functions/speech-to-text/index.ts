// 百度语音识别 API 配置
const BAIDU_APP_ID = Deno.env.get('BAIDU_APP_ID') || '';
const BAIDU_API_KEY = Deno.env.get('BAIDU_API_KEY') || '';
const BAIDU_SECRET_KEY = Deno.env.get('BAIDU_SECRET_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 获取百度语音 access_token
async function getBaiduAccessToken(): Promise<string> {
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_API_KEY}&client_secret=${BAIDU_SECRET_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('获取百度语音 access_token 失败');
  }

  const result = await response.json();
  return result.access_token;
}

// 将音频数据转换为 Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 检查百度语音配置是否完整
    if (!BAIDU_APP_ID || !BAIDU_API_KEY || !BAIDU_SECRET_KEY) {
      console.error('百度语音配置不完整');
      return new Response(
        JSON.stringify({
          error: '语音识别服务未配置，请联系管理员配置百度语音 API',
          code: 'BAIDU_CONFIG_MISSING'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: '请上传音频文件' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 读取音频文件为 ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();
    
    // 转换为 Base64
    const audioBase64 = arrayBufferToBase64(audioBuffer);

    // 获取 access_token
    const accessToken = await getBaiduAccessToken();

    // 调用百度语音识别 API
    const response = await fetch(
      `https://vop.baidu.com/server_api?cuid=${BAIDU_APP_ID}&token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'wav',
          rate: 16000,
          channel: 1,
          cuid: BAIDU_APP_ID,
          token: accessToken,
          speech: audioBase64,
          len: audioBuffer.byteLength,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('百度语音识别 API 错误:', errorText);
      return new Response(
        JSON.stringify({ error: '语音识别服务暂时不可用，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    
    // 百度语音识别返回结果
    // result.result 是识别结果数组
    const text = result.result ? result.result.join('') : '';
    
    if (result.err_no !== 0) {
      console.error('百度语音识别错误:', result);
      return new Response(
        JSON.stringify({ 
          error: result.err_msg || '语音识别失败',
          code: result.err_no 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('语音识别错误:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '服务器内部错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
