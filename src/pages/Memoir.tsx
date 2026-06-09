import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, FileText, Crown, LogIn, Shield, X, Check, ArrowLeft, Mic, Square, Loader2, Download, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserProfile from '../components/UserProfile';
import {
  getUserStories,
  saveStory,
  uploadAudio,
  polishText,
  speechToText,
  initUserStories,
  generatePDF,
  exportUserData,
  deleteAllUserData,
  type Story
} from '../services/storyService';
import { createOrder, initiatePayment, queryPaymentStatus, PRICING_PLANS, type Order } from '../services/orderService';

interface Question {
  id: number;
  chapter: string;
  text: string;
  tips?: string;
  followups: string[];
}

const QUESTIONS: Question[] = [
  { id: 1, chapter: "留传·起点", text: "如果能回到小时候住的地方，你最想再看一眼哪个角落？", tips: "试着回忆家里的老照片、老房子", followups: ["那个角落现在还在吗？", "如果它变了，你会觉得遗憾吗？"] },
  { id: 2, chapter: "留传·成长", text: "读书时，有没有一位老师让你至今难忘？", tips: "那位老师做过最让你感动的事是什么？", followups: ["那位老师做过最让你感动的事是什么？", "如果见到他/她，你想说什么？"] },
  { id: 3, chapter: "留传·闯荡", text: "你的第一份工作是怎么找到的？当时难吗？", tips: "那会儿一个月挣多少钱？", followups: ["那会儿一个月挣多少钱？", "最苦的时候怎么熬过来的？"] },
  { id: 4, chapter: "留传·遇见", text: "你和另一半第一次见面是什么场景？", tips: "他/她那时候给你最深的印象是什么？", followups: ["他/她那时候给你最深的印象是什么？", "如果回到那天，你会对自己说什么？"] },
  { id: 5, chapter: "留传·沉淀", text: "回头看，你这辈子做得最对的一个决定是什么？", tips: "这个决定带来了什么改变？", followups: ["这个决定带来了什么改变？", "如果再选一次，还会走同样的路吗？"] },
  { id: 6, chapter: "留传·寄语", text: "你最想对子女说的一句心里话是什么？", tips: "希望他们记住你什么？", followups: ["希望他们记住你什么？", "有没有一直想说却没开口的话？"] }
];

interface MemoirProps {
  onNavigate?: (page: string) => void;
  initialShowPricing?: boolean;
}

const Memoir: React.FC<MemoirProps> = ({ onNavigate, initialShowPricing = false }) => {
  const { user, profile, isAuthenticated, isPaid, signOut, signIn, signUp } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stories, setStories] = useState<Story[]>([]);
  const [rawText, setRawText] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [showFollowup, setShowFollowup] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', phone: '' });
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const TOTAL = QUESTIONS.length;
  const FREE_LIMIT = 3;
  const currentQuestion = QUESTIONS[currentIdx];
  const canAccessQuestion = currentIdx < FREE_LIMIT || isPaid;

  // 加载用户故事
  useEffect(() => {
    if (isAuthenticated && user) {
      loadStories();
    }
  }, [isAuthenticated, user]);

  // 如果从首页点击"立即购买"跳转，自动打开定价弹窗
  useEffect(() => {
    if (initialShowPricing) {
      setShowPricing(true);
    }
  }, [initialShowPricing]);

  // 当前问题变化时更新文本
  useEffect(() => {
    const currentStory = stories.find(s => s.question_id === currentQuestion.id);
    setRawText(currentStory?.raw_text || '');
    setPolishedText(currentStory?.polished_text || '');
    setShowFollowup(false);
  }, [currentIdx, stories, currentQuestion.id]);

  const loadStories = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getUserStories(user.id);
      if (data.length === 0) {
        // 初始化故事
        await initUserStories(user.id, QUESTIONS);
        const newData = await getUserStories(user.id);
        setStories(newData);
      } else {
        setStories(data);
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      setError('加载数据失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentStory = async () => {
    if (!user) return;
    try {
      const currentStory = stories.find(s => s.question_id === currentQuestion.id);
      if (currentStory) {
        await saveStory({
          id: currentStory.id,
          user_id: user.id,
          question_id: currentQuestion.id,
          chapter: currentQuestion.chapter,
          question_text: currentQuestion.text,
          raw_text: rawText,
          polished_text: polishedText,
          is_completed: !!rawText.trim(),
        });
        // 刷新故事列表
        await loadStories();
      }
    } catch (err) {
      console.error('保存故事失败:', err);
    }
  };

  const startRecording = async () => {
    if (!canAccessQuestion) {
      setShowPricing(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordingStatus('正在识别...');

        try {
          // 语音识别（无需登录）
          const text = await speechToText(audioBlob);
          setRawText(text);
          setRecordingStatus('识别完成');

          // 如果已登录，上传音频并保存到数据库
          if (user && currentIdx < FREE_LIMIT) {
            const audioUrl = await uploadAudio(new File([audioBlob], 'recording.wav', { type: 'audio/wav' }), user.id);
            await saveCurrentStory();
          }
        } catch (err) {
          console.error('语音识别失败:', err);
          setRecordingStatus('识别失败，请重试');
        }

        // 停止所有轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('录音中...');
    } catch (err) {
      console.error('启动录音失败:', err);
      setError('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onPolish = async () => {
    if (!canAccessQuestion) {
      setShowPricing(true);
      return;
    }
    if (!rawText.trim()) {
      setError('请先录音或输入内容');
      return;
    }
    
    try {
      setIsPolishing(true);
      const result = await polishText(rawText, currentQuestion.chapter);
      setPolishedText(result);
      setShowFollowup(true);
      await saveCurrentStory();
    } catch (err) {
      console.error('AI润色失败:', err);
      setError('AI润色失败，请稍后重试');
    } finally {
      setIsPolishing(false);
    }
  };

  const goNext = async () => {
    await saveCurrentStory();
    if (currentIdx < TOTAL - 1) {
      if (currentIdx + 1 >= FREE_LIMIT && !isPaid) {
        setShowPricing(true);
        return;
      }
      setCurrentIdx(currentIdx + 1);
    } else {
      alert('已完成全部问题！');
    }
  };

  const goPrev = async () => {
    await saveCurrentStory();
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!loginForm.password.trim()) {
      setError('请输入密码');
      return;
    }
    if (loginForm.password.length < 6) {
      setError('密码至少需要6位');
      return;
    }
    try {
      await signIn(loginForm.username, loginForm.password);
      setShowLoginModal(false);
      setError('');
    } catch (err) {
      setError('登录失败，用户名或密码错误');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!registerForm.password.trim()) {
      setError('请输入密码');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('密码至少需要6位');
      return;
    }
    try {
      await signUp(registerForm.username, registerForm.password, registerForm.phone);
      await signIn(registerForm.username, registerForm.password);
      setShowRegisterModal(false);
      setError('');
    } catch (err) {
      setError('注册失败，用户名可能已被使用');
    }
  };

  const handlePayment = async (planId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (planId === 'free') {
      setShowPricing(false);
      return;
    }

    try {
      setIsLoading(true);
      const order = await createOrder(planId);
      const paymentResult = await initiatePayment(order.id);
      setSelectedPlan(planId);
      setCurrentOrderNo(paymentResult.orderNo);
      setShowPaymentModal(true);
      setShowPricing(false);
      // 开始轮询支付状态
      startPaymentCheck(paymentResult.orderNo);
    } catch (err) {
      console.error('创建订单失败:', err);
      setError('创建订单失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [currentOrderNo, setCurrentOrderNo] = useState<string | null>(null);
  const paymentCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const confirmPayment = async () => {
    if (!currentOrderNo) return;

    try {
      const result = await queryPaymentStatus(currentOrderNo);
      if (result.status === 'paid') {
        setPaymentStatus('paid');
        alert('支付成功！');
        setShowPaymentModal(false);
        // 刷新用户状态以更新付费状态
        window.location.hash = '#app';
        window.location.reload();
      } else {
        setPaymentStatus('pending');
        alert('订单处理中，请稍后再试');
      }
    } catch (err) {
      console.error('查询支付状态失败:', err);
      setPaymentStatus('failed');
    }
  };

  // 清理支付轮询
  useEffect(() => {
    return () => {
      if (paymentCheckInterval.current) {
        clearInterval(paymentCheckInterval.current);
      }
    };
  }, []);

  const startPaymentCheck = (orderNo: string) => {
    setCurrentOrderNo(orderNo);
    paymentCheckInterval.current = setInterval(async () => {
      try {
        const result = await queryPaymentStatus(orderNo);
        if (result.status === 'paid') {
          if (paymentCheckInterval.current) {
            clearInterval(paymentCheckInterval.current);
          }
          setPaymentStatus('paid');
          setShowPaymentModal(false);
          // 刷新页面以更新付费状态
          window.location.hash = '#app';
          window.location.reload();
        }
      } catch (err) {
        console.error('支付状态查询失败:', err);
      }
    }, 3000);
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfResult, setPdfResult] = useState<{ pdfUrl: string; htmlContent: string } | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const exportToPDF = async () => {
    if (!isPaid) {
      setShowPricing(true);
      return;
    }
    if (!user) return;

    try {
      setIsGeneratingPDF(true);
      const completedStories = stories.filter(s => s.is_completed);
      if (completedStories.length === 0) {
        setError('请先完成至少一个故事');
        return;
      }

      const result = await generatePDF(user.id, completedStories, `${profile?.username || '我'}的回忆录`);
      setPdfResult(result);
      setShowPDFModal(true);
    } catch (err) {
      console.error('PDF生成失败:', err);
      setError('PDF生成失败，请稍后重试');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f5f0' }}>
        <div className="flex items-center gap-2 text-[#8B7355]">
          <Loader2 className="animate-spin" size={24} />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 md:py-5 px-3 md:px-4" style={{ backgroundColor: '#f7f5f0' }}>
      {/* 顶部 */}
      <div className="max-w-[700px] mx-auto mb-3 md:mb-4 flex justify-between items-center">
        <button
          onClick={() => onNavigate?.('landing')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm"
          style={{ backgroundColor: '#FFFFFF', color: '#5C4B3A' }}
        >
          <ArrowLeft size={16} />返回首页
        </button>
        
        {isAuthenticated ? (
          <button
            onClick={() => setShowUserProfile(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#C6A43F' }}>
              {profile?.username?.charAt(0) || 'U'}
            </div>
            <span style={{ color: '#5C4B3A' }}>{profile?.username}</span>
            <User size={16} style={{ color: '#8B7355' }} />
          </button>
        ) : (
          <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#FFFFFF', color: '#5C4B3A' }}>
            <LogIn size={16} />登录
          </button>
        )}
      </div>

      {/* 付费横幅 */}
      {!isPaid && isAuthenticated && (
        <div className="max-w-[700px] mx-auto mb-3 md:mb-4 rounded-2xl p-3 md:p-4 text-white flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #FF6B4A 0%, #E85A3A 100%)' }}>
          <span className="text-sm">免费体验中（{Math.min(currentIdx + 1, FREE_LIMIT)}/{FREE_LIMIT}题）</span>
          <button onClick={() => setShowPricing(true)} className="px-4 py-2 bg-white rounded-full text-sm" style={{ color: '#FF6B4A' }}>升级</button>
        </div>
      )}

      {/* 主容器 */}
      <div className="max-w-[700px] mx-auto rounded-[24px] md:rounded-[32px] p-4 md:p-8 relative" style={{ backgroundColor: '#FCF9F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* 品牌 */}
        <div className="text-center mb-5 md:mb-8 pb-4 md:pb-5" style={{ borderBottom: '1px solid #E2D5C8' }}>
          <h1 className="text-[32px] md:text-[42px] font-medium tracking-[4px] mb-1 md:mb-2" style={{ color: '#3E2E21', fontFamily: 'Times New Roman, Songti SC, serif' }}>留传</h1>
          <div className="text-xs md:text-sm tracking-[2px]" style={{ color: '#8B7355' }}>留声成文 · 传家百年</div>
        </div>

        {/* 进度 */}
        <div className="rounded-[32px] md:rounded-[48px] p-2.5 md:p-3 px-3 md:px-5 mb-4 md:mb-6 flex justify-between items-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD0' }}>
          <span className="px-2.5 md:px-4 py-1 md:py-1.5 rounded-full font-medium text-xs md:text-sm" style={{ backgroundColor: '#FF6B4A10', color: '#FF6B4A' }}>{currentQuestion.chapter}</span>
          <span className="text-xs md:text-sm" style={{ color: '#8B7355' }}>第{currentIdx + 1} / {TOTAL}个故事</span>
        </div>

        {/* 问题卡片 */}
        <div className="rounded-[24px] md:rounded-[32px] p-4 md:p-7 mb-4 md:mb-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD0' }}>
          <div className="text-lg md:text-[24px] font-medium leading-relaxed mb-4 md:mb-7" style={{ color: '#3E2E21', fontFamily: 'Times New Roman, Songti SC, serif' }}>{currentQuestion.text}</div>
          {currentQuestion.tips && <div className="text-xs md:text-sm mb-3 md:mb-4" style={{ color: '#8B7355' }}>💡 提示：{currentQuestion.tips}</div>}

          {!canAccessQuestion ? (
            <div className="rounded-2xl p-6 text-center mb-4" style={{ backgroundColor: '#FCF9F6' }}>
              <div className="text-4xl mb-3">🔒</div>
              <p style={{ color: '#5C4B3A' }}>此题目需要解锁</p>
              <button onClick={() => setShowPricing(true)} className="px-6 py-2 rounded-full text-white mt-4" style={{ backgroundColor: '#FF6B4A' }}>立即解锁</button>
            </div>
          ) : (
            <>
              {/* 录音按钮 - 免费体验前3题无需登录 */}
              <div className="flex justify-center my-4 md:my-5">
                <button
                  onClick={toggleRecording}
                  disabled={currentIdx >= FREE_LIMIT && !isAuthenticated}
                  className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full flex flex-col items-center justify-center transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: isRecording ? '#FF6B4A' : '#FCF9F6',
                    boxShadow: isRecording ? '0 8px 30px rgba(255,107,74,0.4)' : '0 8px 20px rgba(0,0,0,0.05)',
                    border: isRecording ? '4px solid #FF6B4A' : '1px solid #E8DDD0'
                  }}
                >
                  {isRecording ? (
                    <>
                      <div className="flex gap-1 items-center justify-center h-8 md:h-12 mb-1 md:mb-2">
                        {[1,2,3,4,5].map((i) => (
                          <span
                            key={i}
                            className="w-1 md:w-1.5 rounded-full bg-white animate-pulse"
                            style={{
                              height: `${Math.random() * 24 + 6}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-white text-xs md:text-sm font-medium">点击停止</div>
                    </>
                  ) : (
                    <>
                      <Mic size={40} className="md:w-14 md:h-14 mb-1 md:mb-2" style={{ color: (currentIdx < FREE_LIMIT || isAuthenticated) ? '#5C4B3A' : '#8B7355' }} />
                      <div className="text-xs md:text-sm font-medium" style={{ color: (currentIdx < FREE_LIMIT || isAuthenticated) ? '#5C4B3A' : '#8B7355' }}>
                        {(currentIdx < FREE_LIMIT || isAuthenticated) ? '点击录音' : '请登录后录音'}
                      </div>
                    </>
                  )}
                </button>
              </div>
              
              {recordingStatus && (
                <div className="text-xs md:text-sm text-center mb-3 md:mb-4 font-medium" style={{ color: isRecording ? '#FF6B4A' : '#8B7355' }}>
                  {recordingStatus}
                </div>
              )}

              {/* 文本框 - 免费体验前3题无需登录 */}
              <div className="rounded-[20px] md:rounded-[24px] p-3 md:p-4 mb-3 md:mb-4" style={{ backgroundColor: '#FCF9F6' }}>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block" style={{ color: '#5C4B3A' }}>📝 识别文字</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={3}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-[16px] md:rounded-[20px] text-xs md:text-sm resize-none border outline-none focus:border-[#FF6B4A]"
                  style={{ borderColor: '#E8DDD0', backgroundColor: '#FFFFFF', color: '#3E2E21' }}
                  placeholder={(currentIdx < FREE_LIMIT || isAuthenticated) ? "录音后会自动显示..." : "请先登录..."}
                  disabled={currentIdx >= FREE_LIMIT && !isAuthenticated}
                />
              </div>

              {/* 润色结果 */}
              {polishedText && (
                <div className="rounded-[20px] md:rounded-[24px] p-3 md:p-4 mb-3 md:mb-4" style={{ backgroundColor: '#FFF9F0', borderLeft: '4px solid #FF6B4A' }}>
                  <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block flex items-center gap-1" style={{ color: '#5C4B3A' }}>
                    <Sparkles size={12} className="md:w-[14px] md:h-[14px]" style={{ color: '#FF6B4A' }} />
                    ✨ 润色之后
                  </label>
                  <div className="text-xs md:text-sm leading-relaxed" style={{ color: '#3E2E21' }}>{polishedText}</div>
                </div>
              )}

              {/* 追问 */}
              {showFollowup && (
                <div className="rounded-[20px] md:rounded-[24px] p-3 md:p-4 mt-3 md:mt-4" style={{ backgroundColor: '#FFF9F0' }}>
                  <div className="font-medium mb-2 md:mb-3 text-sm md:text-[15px]" style={{ color: '#FF6B4A' }}>🧡 我还想多听一点：</div>
                  {currentQuestion.followups.map((f, i) => (
                    <div key={i} className="text-xs md:text-sm mb-1.5 md:mb-2" style={{ color: '#5C4B3A' }}>• {f}</div>
                  ))}
                </div>
              )}

              {/* 导航按钮 */}
              <div className="flex justify-between mt-4 md:mt-6 gap-2 md:gap-3">
                <button 
                  onClick={goPrev} 
                  disabled={currentIdx === 0} 
                  className="flex items-center gap-1 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#E8DDD0', color: '#5C4B3A' }}
                >
                  <ChevronLeft size={14} className="md:w-4 md:h-4" />上一题
                </button>
                
                <button 
                  onClick={onPolish} 
                  disabled={isPolishing || !rawText.trim()}
                  className="flex items-center gap-1 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#FF6B4A' }}
                >
                  {isPolishing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} className="md:w-4 md:h-4" />
                  )}
                  {isPaid ? 'AI润色' : '润色'}
                </button>
                
                <button 
                  onClick={goNext} 
                  className="flex items-center gap-1 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium text-white"
                  style={{ backgroundColor: '#3E2E21' }}
                >
                  下一题<ChevronRight size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-4 md:mt-6">
          <button
            onClick={exportToPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#3E2E21' }}
          >
            {isGeneratingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} className="md:w-[18px] md:h-[18px]" />
            )}
            {isGeneratingPDF ? '生成中...' : (isPaid ? '生成PDF' : 'PDF(需升级)')}
          </button>
          <button 
            onClick={() => setShowPricing(true)} 
            className="flex items-center gap-1.5 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-medium border-2"
            style={{ borderColor: '#FF6B4A', color: '#FF6B4A' }}
          >
            <Crown size={14} className="md:w-4 md:h-4" />
            {isPaid ? '查看订单' : '升级'}
          </button>
        </div>

        <div className="text-center mt-6 md:mt-10 text-xs" style={{ color: '#8B7355' }}>📖 数据仅存本地 · 随时可导出</div>
      </div>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-[#8B7355]"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-[#3E2E21] mb-4">登录</h2>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">用户名</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] outline-none"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">密码</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] outline-none"
                  placeholder="请输入密码"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium">登录</button>
            </form>
            <div className="text-center mt-4">
              <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} className="text-[#FF6B4A] text-sm">还没有账号？立即注册</button>
            </div>
          </div>
        </div>
      )}

      {/* 注册弹窗 */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-[#8B7355]"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-[#3E2E21] mb-4">注册</h2>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">用户名</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] outline-none"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">手机号（可选）</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] outline-none"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">密码</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] outline-none"
                  placeholder="请设置密码"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium">注册</button>
            </form>
            <div className="text-center mt-4">
              <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} className="text-[#FF6B4A] text-sm">已有账号？立即登录</button>
            </div>
          </div>
        </div>
      )}

      {/* 定价弹窗 */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-medium text-[#5C4B3A]">选择方案</h2>
              <button onClick={() => setShowPricing(false)}><X size={24} style={{ color: '#9B8A78' }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.id} className="rounded-2xl p-4 md:p-5 border-2" style={{ backgroundColor: plan.id === 'digital' ? '#FEFAF5' : '#FFFFFF', borderColor: plan.id === 'digital' ? '#C6A43F' : '#E2D5C8' }}>
                  {plan.badge && <span className="px-3 py-1 text-white text-xs rounded-full" style={{ backgroundColor: '#C6A43F' }}>{plan.badge}</span>}
                  <div className="text-center my-4">
                    <h3 style={{ color: '#5C4B3A' }}>{plan.name}</h3>
                    <div className="text-3xl font-bold" style={{ color: '#5C4B3A' }}>¥{plan.price / 100}</div>
                  </div>
                  <ul className="space-y-2 mb-5 text-sm">
                    {plan.features.map((f, i) => <li key={i} className="flex gap-2" style={{ color: '#5C4B3A' }}><Check size={16} style={{ color: '#C6A43F' }} />{f}</li>)}
                  </ul>
                  <button 
                    onClick={() => handlePayment(plan.id)} 
                    className="w-full py-2.5 rounded-full font-medium text-white"
                    style={{ backgroundColor: plan.id === 'digital' ? '#C6A43F' : '#E2D5C8' }}
                  >
                    {plan.id === 'free' ? '免费开始' : '立即购买'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 支付弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-[#5C4B3A]">微信支付</h3>
              <button onClick={() => {
                setShowPaymentModal(false);
                if (paymentCheckInterval.current) {
                  clearInterval(paymentCheckInterval.current);
                }
              }}><X size={20} /></button>
            </div>
            <div className="text-center mb-4">
              <p className="text-[#9B8A78]">{PRICING_PLANS.find(p => p.id === selectedPlan)?.name}</p>
              <p className="text-3xl font-bold text-[#C6A43F]">¥{(PRICING_PLANS.find(p => p.id === selectedPlan)?.price || 0) / 100}</p>
            </div>
            <div className="rounded-2xl p-4 mb-4 text-center" style={{ backgroundColor: '#07c160' }}>
              <p className="text-white text-sm mb-3">请使用微信扫码支付</p>
              <div className="bg-white rounded-xl p-4 inline-block">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                  模拟支付二维码
                </div>
              </div>
            </div>
            <button onClick={confirmPayment} className="w-full py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#07c160' }}>我已完成支付</button>
          </div>
        </div>
      )}

      {/* PDF预览弹窗 */}
      {showPDFModal && pdfResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: '#E8DDD0' }}>
              <h3 className="text-[#5C4B3A] font-medium">回忆录预览</h3>
              <button onClick={() => setShowPDFModal(false)} className="text-[#8B7355] hover:text-[#5C4B3A]">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <iframe
                src={pdfResult.pdfUrl}
                className="w-full h-[600px] border rounded-xl"
                style={{ borderColor: '#E8DDD0' }}
                title="回忆录预览"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: '#E8DDD0' }}>
              <button
                onClick={() => setShowPDFModal(false)}
                className="px-6 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: '#E8DDD0', color: '#5C4B3A' }}
              >
                关闭
              </button>
              <a
                href={pdfResult.pdfUrl}
                download={`${profile?.username || '我'}的回忆录.html`}
                className="px-6 py-2 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: '#FF6B4A' }}
              >
                下载HTML
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 用户中心弹窗 */}
      {showUserProfile && (
        <UserProfile
          user={user}
          profile={profile}
          stories={stories}
          onLogout={signOut}
          onNavigate={onNavigate}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
};

export default Memoir;
