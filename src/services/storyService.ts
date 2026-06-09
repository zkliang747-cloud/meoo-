import { supabase, getSupabaseUrl } from '../supabase/client';

export interface Story {
  id: string;
  user_id: string;
  question_id: number;
  chapter: string;
  question_text: string;
  raw_text: string | null;
  polished_text: string | null;
  audio_url: string | null;
  photos: string[] | null;
  followups: Record<string, string> | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  chapter: string;
  text: string;
  tips?: string;
  followups: string[];
}

// 获取用户的所有故事
export async function getUserStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('question_id', { ascending: true });

  if (error) {
    console.error('获取故事失败:', error);
    throw new Error(`获取故事失败: ${error.message}`);
  }

  return (data || []) as Story[];
}

// 获取单个故事
export async function getStory(storyId: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error) {
    console.error('获取故事失败:', error);
    throw new Error(`获取故事失败: ${error.message}`);
  }

  return data as Story | null;
}

// 创建或更新故事
export async function saveStory(story: Partial<Story>): Promise<Story> {
  const storyData = {
    ...story,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('stories')
    .upsert(storyData as any)
    .select()
    .single();

  if (error) {
    console.error('保存故事失败:', error);
    throw new Error(`保存故事失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('保存故事失败：未返回数据');
  }

  return data as Story;
}

// 更新故事
export async function updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storyId)
    .select()
    .single();

  if (error) {
    console.error('更新故事失败:', error);
    throw new Error(`更新故事失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新故事失败：未返回数据');
  }

  return data as Story;
}

// 删除故事
export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) {
    console.error('删除故事失败:', error);
    throw new Error(`删除故事失败: ${error.message}`);
  }
}

// 上传音频文件
export async function uploadAudio(file: File, userId: string): Promise<string> {
  const fileName = `${userId}/${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from('audio')
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (error) {
    console.error('上传音频失败:', error);
    throw new Error(`上传音频失败: ${error.message}`);
  }

  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(fileName);

  return publicUrl;
}

// 上传照片
export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const fileName = `${userId}/${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from('photos')
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (error) {
    console.error('上传照片失败:', error);
    throw new Error(`上传照片失败: ${error.message}`);
  }

  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  return publicUrl;
}

// AI 润色
export async function polishText(text: string, chapter: string): Promise<string> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/ai-polish`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, chapter }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI润色失败');
  }

  const result = await response.json();
  return result.polishedText;
}

// 语音识别
export async function speechToText(audioBlob: Blob): Promise<string> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/speech-to-text`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '语音识别失败');
  }

  const result = await response.json();
  return result.text;
}

// 初始化用户故事（创建所有问题的空记录）
export async function initUserStories(userId: string, questions: Question[]): Promise<void> {
  const stories = questions.map((q) => ({
    user_id: userId,
    question_id: q.id,
    chapter: q.chapter,
    question_text: q.text,
    raw_text: null,
    polished_text: null,
    audio_url: null,
    photos: [],
    followups: {},
    is_completed: false,
  }));

  const { error } = await supabase
    .from('stories')
    .upsert(stories, { onConflict: 'user_id,question_id' });

  if (error) {
    console.error('初始化故事失败:', error);
    throw new Error(`初始化故事失败: ${error.message}`);
  }
}

// 生成 PDF
export async function generatePDF(userId: string, stories: Story[], title: string): Promise<{ pdfUrl: string; htmlContent: string }> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/generate-pdf`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, stories, title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'PDF 生成失败');
  }

  return await response.json();
}

// 导出所有数据
export async function exportUserData(userId: string): Promise<{
  stories: Story[];
  exportDate: string;
}> {
  const stories = await getUserStories(userId);

  return {
    stories,
    exportDate: new Date().toISOString(),
  };
}

// 删除所有用户数据
export async function deleteAllUserData(userId: string): Promise<void> {
  // 删除所有故事
  const { error: storiesError } = await supabase
    .from('stories')
    .delete()
    .eq('user_id', userId);

  if (storiesError) {
    console.error('删除故事失败:', storiesError);
    throw new Error(`删除故事失败: ${storiesError.message}`);
  }

  // 删除存储的文件（音频、照片）
  const { data: audioFiles } = await supabase.storage.from('audio').list(userId);
  if (audioFiles && audioFiles.length > 0) {
    await supabase.storage.from('audio').remove(audioFiles.map(f => `${userId}/${f.name}`));
  }

  const { data: photoFiles } = await supabase.storage.from('photos').list(userId);
  if (photoFiles && photoFiles.length > 0) {
    await supabase.storage.from('photos').remove(photoFiles.map(f => `${userId}/${f.name}`));
  }
}
