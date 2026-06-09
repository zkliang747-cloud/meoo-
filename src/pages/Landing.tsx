import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star, Check, ArrowRight, Mic, BookOpen, MessageCircle, Gift, Shield, Download, Trash2, HelpCircle, Menu, X, Play, Smartphone, Sparkles, Users, Lock } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "静水流深",
    quote: "妈妈从来不愿意写东西，却愿意开口讲自己的故事。听她说起年轻时的辛苦与遗憾，我才真正听懂了她。",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jing&backgroundColor=f5ede8"
  },
  {
    name: "山海可平",
    quote: "25分钟的对话，重新认识了我的父亲。原声留存下来，是孩子以后永远能听到的祖辈声音。",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shan&backgroundColor=f5ede8&gender=male"
  },
  {
    name: "晚风微凉",
    quote: "子女留言的功能太治愈了——几十年没说出口的感谢，终于好好讲给爸妈听。",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wan&backgroundColor=f5ede8"
  },
];

// 试听金句示例
const SAMPLE_QUOTES = [
  {
    id: 1,
    chapter: "留传·起点",
    question: "如果能回到小时候住的地方，你最想再看一眼哪个角落？",
    rawText: "嗯...我想想啊，应该是那个老院子吧，院子里有棵大槐树，夏天的时候特别凉快，我和小伙伴们经常在树下玩。",
    polishedText: "若时光能倒流，我最想回到那座老院子。院中的大槐树见证了我的童年，夏日里浓荫蔽日，我和伙伴们在树下追逐嬉戏，那是记忆里最清凉的夏天。",
    audioUrl: null,
  },
  {
    id: 2,
    chapter: "留传·遇见",
    question: "你和另一半第一次见面是什么场景？",
    rawText: "哎呀，那是很久以前的事了。是在一个朋友的婚礼上，她穿了一条红色的裙子，特别好看，我当时就记住了。",
    polishedText: "初见她时，是在一场友人的婚礼上。她身着一袭红裙，在人群中格外耀眼。那一刻，时间仿佛静止，我只记得那抹红色，和心跳加速的感觉。",
    audioUrl: null,
  },
  {
    id: 3,
    chapter: "留传·沉淀",
    question: "回头看，你这辈子做得最对的一个决定是什么？",
    rawText: "我觉得是选择留在家乡吧。虽然外面机会多，但是能陪着父母老去，看着孩子长大，我觉得很值得。",
    polishedText: "回首往事，最庆幸的决定是留在家乡。虽错失了外面的繁华，但能陪伴父母安享晚年，见证孩子成长，这份平淡中的幸福，是任何成就都无法替代的。",
    audioUrl: null,
  },
];

const FAQS = [
  { 
    q: "包含什么？多久能拿到书？", 
    a: "标准套餐包括30个精选问题（带固定追问）、无限次录音、AI润色、子女留言、照片上传。完成后可立即生成有声H5和PDF；实体书在您确认内容后15个工作日内印刷寄出。"
  },
  { 
    q: "父母不会用智能手机怎么办？", 
    a: "不需要下载APP，我们通过微信链接发送问题。老人点开链接，按住说话即可。我们提供1分钟视频教程，子女也可代为录入。"
  },
  { 
    q: "可以编辑AI生成的文稿吗？", 
    a: "可以。AI初稿生成后，子女可以在线修改文字、增删段落。每段故事下方都支持手动编辑。"
  },
  { 
    q: "录音和文稿可以保存多久？", 
    a: "付费用户享有终身云端存档权益，不限次数下载、回放、导出。即使不再续费，您已生成的内容也永久保留。"
  },
  { 
    q: "隐私安全吗？", 
    a: "所有数据仅您和家人可见，加密存储。我们永不公开、永不用于AI训练。您可以随时导出或一键删除。"
  },
];

const STEPS = [
  { icon: <HelpCircle size={28} />, title: "智能提问", desc: "我们发送30个精选问题，每个问题带1-2个固定追问。" },
  { icon: <Mic size={28} />, title: "语音讲述", desc: "父母点击链接，按住说话，无需打字，无需下载APP。" },
  { icon: <MessageCircle size={28} />, title: "子女回响", desc: "子女可对每一段故事添加文字或语音留言，双向治愈。" },
  { icon: <BookOpen size={28} />, title: "生成传家书", desc: "全部完成后，一键生成有声H5+PDF，也可印刷精装实体书。" },
];

const COLUMNS = [
  { id: 1, name: "留传·起点", subtitle: "童年与故乡", example: "你的童年是在哪里度过的？" },
  { id: 2, name: "留传·成长", subtitle: "青春与求学", example: "学生时代最难忘的一位老师是谁？" },
  { id: 3, name: "留传·闯荡", subtitle: "工作与奋斗", example: "第一份工作是怎么找到的？" },
  { id: 4, name: "留传·遇见", subtitle: "爱情与婚姻", example: "和另一半第一次见面是什么场景？" },
  { id: 5, name: "留传·信物", subtitle: "老照片与旧物", example: "家里最珍贵的老物件是什么？" },
  { id: 6, name: "留传·沉淀", subtitle: "中年感悟", example: "这辈子做得最对的一个决定是什么？" },
  { id: 7, name: "留传·寄语", subtitle: "给子孙的话", example: "最想对孙辈说的一句心里话？" },
  { id: 8, name: "留传·秘密", subtitle: "从未说出口的事", example: "有什么从未告诉过家人的秘密？" },
];

const PRICING = [
  {
    id: "free",
    name: "免费体验",
    price: 0,
    features: ["3个精选问题", "语音录制", "基础AI润色", "有声H5预览"],
    popular: false
  },
  {
    id: "digital",
    name: "记忆集·电子版",
    price: 49,
    features: ["30问+固定追问", "AI润色", "子女留言", "照片上传", "有声H5+PDF"],
    popular: false
  },
  {
    id: "book",
    name: "记忆集·实体书",
    price: 149,
    features: ["电子版所有权益", "精装彩色实体书一本", "最多200页", "全国包邮"],
    popular: true
  },
  {
    id: "gift",
    name: "送礼卡",
    price: 169,
    features: ["购买后赠送给父母", "对方无需支付", "实体书直接寄给长辈", "精美礼品包装"],
    popular: false
  },
];

// 新配色方案：温暖活力版
const COLORS = {
  primary: '#FF6B4A',      // 珊瑚橙主色
  primaryDark: '#E85A3A',  // 深珊瑚
  secondary: '#4ECDC4',    // 薄荷绿点缀
  accent: '#FFE66D',       // 阳光黄强调
  bgWarm: '#FFF9F0',       // 奶油白背景
  textDark: '#2D2420',     // 深棕文字
  textMedium: '#5A4A42',   // 中棕文字
  textLight: '#8B7B73',    // 浅棕辅助
};

const FEATURES = [
  { icon: <Mic size={20} />, title: "低门槛", desc: "无需打字，按住说话即可记录" },
  { icon: <Sparkles size={20} />, title: "AI润色", desc: "智能整理口语，保留原汁原味" },
  { icon: <MessageCircle size={20} />, title: "子女留言", desc: "每段故事下可加文字/语音回响" },
  { icon: <BookOpen size={20} />, title: "传家交付", desc: "有声H5+PDF+精装实体书" },
];

interface LandingProps {
  onNavigate?: (page: 'privacy' | 'terms' | 'contact' | 'app', openPricing?: boolean) => void;
}

const SAMPLE_QUESTIONS = [
  { category: "留传·起点", subtitle: "童年与故乡", questions: ["你的童年是在哪里度过的？", "小时候家里最难忘的味道是什么？", "童年最要好的玩伴是谁？"] },
  { category: "留传·成长", subtitle: "青春与求学", questions: ["学生时代最难忘的一位老师是谁？", "你小时候的梦想是什么？", "青春岁月里最骄傲的一件事是什么？"] },
  { category: "留传·闯荡", subtitle: "工作与奋斗", questions: ["第一份工作是怎么找到的？", "职业生涯中最艰难的时刻是什么？", "工作中最让你自豪的成就是什么？"] },
  { category: "留传·遇见", subtitle: "爱情与婚姻", questions: ["和另一半第一次见面是什么场景？", "求婚/被求婚时发生了什么？", "婚姻生活中最温暖的瞬间是什么？"] },
  { category: "留传·信物", subtitle: "老照片与旧物", questions: ["家里最珍贵的老物件是什么？", "哪张照片承载了你最深刻的记忆？", "如果只能保留一件东西，你会选什么？"] },
  { category: "留传·沉淀", subtitle: "中年感悟", questions: ["这辈子做得最对的一个决定是什么？", "如果可以重来，你会改变什么？", "中年以后，你对生活有了什么新理解？"] },
  { category: "留传·寄语", subtitle: "给子孙的话", questions: ["最想对孙辈说的一句心里话？", "你希望家族传承什么样的精神？", "对年轻一代的人生建议是什么？"] },
  { category: "留传·秘密", subtitle: "从未说出口的事", questions: ["有什么从未告诉过家人的秘密？", "这辈子最遗憾的一件事是什么？", "如果时光倒流，你最想弥补什么？"] },
];

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showSampleQuotes, setShowSampleQuotes] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ phone: '', password: '', name: '' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFEFE5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FCF9F6]/95 backdrop-blur-md border-b border-[#E8DDD0]">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-[22px] font-bold text-[#3E2E21]" style={{ fontFamily: 'serif' }}>留传</div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8B7355]">
            <a href="#how-it-works" className="hover:text-[#FF6B4A] transition-colors">如何使用</a>
            <a href="#columns" className="hover:text-[#FF6B4A] transition-colors">栏目介绍</a>
            <a href="#pricing" className="hover:text-[#FF6B4A] transition-colors">定价</a>
            <a href="#faq" className="hover:text-[#FF6B4A] transition-colors">常见问题</a>
          </div>
          
          <div className="hidden md:block">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 bg-[#FF6B4A] text-white rounded-[28px] text-sm font-medium hover:bg-[#E85A3A] transition-colors"
            >
              注册登录
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} className="text-[#3E2E21]" /> : <Menu size={24} className="text-[#3E2E21]" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FCF9F6] border-t border-[#E8DDD0] px-6 py-4">
            <div className="flex flex-col gap-4 text-[#5C4B3A]">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>如何使用</a>
              <a href="#columns" onClick={() => setMobileMenuOpen(false)}>栏目介绍</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>定价</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>常见问题</a>
              <button
                onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="px-5 py-2.5 bg-[#FF6B4A] text-white rounded-[28px] text-sm font-medium w-full"
              >
                注册登录
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 md:pt-24 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <h1 className="text-[28px] md:text-[48px] font-bold leading-tight mb-4 md:mb-6 text-[#3E2E21]" style={{ fontFamily: 'serif' }}>
                留声成文，<br />传家百年
              </h1>

              <p className="text-base md:text-lg text-[#5C4B3A] mb-6 md:mb-8 leading-relaxed">
                不用动笔，只需说话。30个走心问题，帮父母轻松讲完一生故事。AI润色成文，最终生成一本可扫码听原声的传家书。
              </p>
              
              <div className="flex flex-row items-start gap-2 md:gap-3 mb-6 md:mb-8 flex-wrap">
                <button
                  onClick={() => onNavigate?.('app')}
                  className="px-6 py-3 bg-[#FF6B4A] text-white rounded-[28px] text-sm font-medium hover:bg-[#E85A3A] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B4A]/20"
                >
                  免费体验
                </button>
                <button
                  onClick={() => onNavigate?.('app', true)}
                  className="px-6 py-3 bg-[#FF6B4A] text-white rounded-[28px] text-sm font-medium hover:bg-[#E85A3A] transition-all flex items-center gap-2 shadow-lg shadow-[#FF6B4A]/20"
                >
                  <Mic size={16} /> 立即购买
                </button>
                <button
                  onClick={() => setShowSampleQuotes(true)}
                  className="px-6 py-3 bg-transparent border-2 border-[#FF6B4A] text-[#FF6B4A] rounded-[28px] text-sm font-medium hover:bg-[#FF6B4A]/5 transition-all flex items-center gap-2"
                >
                  <Play size={16} /> 试听金句
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B7355] mb-6">
                <div className="flex items-center gap-1.5">
                  <Check size={16} className="text-[#FF6B4A]" />
                  <span>无需下载APP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={16} className="text-[#FF6B4A]" />
                  <span>90岁老人也会用</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={16} className="text-[#FF6B4A]" />
                  <span>不满意可重录</span>
                </div>
              </div>

            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#D4A574]/30 to-[#FF6B4A]/20 p-3">
                <div className="w-full h-full rounded-[20px] bg-white shadow-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop" 
                    alt="老人阅读书籍"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Recording Wave Animation */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-[#E8DDD0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-5">
                      {[1,2,3,4,5].map((i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[#FF6B4A] rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.random() * 16 + 4}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#3E2E21]">正在录音</div>
                    <div className="text-xs text-[#8B7355]">点击即可说话</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Value Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>普通人的家族数字档案馆</h2>
            <p className="text-[#8B7355] text-base md:text-lg">帮每一个家庭，留下可以传家的人生故事。</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left: H5 Demo */}
            <div className="relative mx-auto lg:mx-0 hidden md:block">
              <div className="w-[280px] mx-auto bg-[#3E2E21] rounded-[40px] p-3 shadow-2xl">
                <div className="bg-[#FCF9F6] rounded-[32px] overflow-hidden">
                  {/* Phone Header */}
                  <div className="bg-[#FF6B4A] text-white p-4 text-center">
                    <div className="text-sm font-medium">留传 · 父亲的故事</div>
                  </div>
                  {/* Story List */}
                  <div className="p-4 space-y-3">
                    <div className="bg-white rounded-xl p-3 border border-[#E8DDD0]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center">
                          <Play size={14} className="text-[#FF6B4A]" />
                        </div>
                        <span className="text-xs text-[#8B7355]">留传·起点</span>
                      </div>
                      <div className="text-sm text-[#3E2E21] font-medium">童年与故乡</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#E8DDD0]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center">
                          <Play size={14} className="text-[#FF6B4A]" />
                        </div>
                        <span className="text-xs text-[#8B7355]">留传·成长</span>
                      </div>
                      <div className="text-sm text-[#3E2E21] font-medium">青春与求学</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#E8DDD0] opacity-50">
                      <div className="text-xs text-[#8B7355] text-center">更多故事...</div>
                    </div>
                  </div>
                  {/* QR Code Hint */}
                  <div className="p-4 bg-[#F5EDE8] text-center">
                    <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-[#3E2E21]' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-[#8B7355]">扫码听原声</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4 text-sm text-[#8B7355]">
                <Smartphone size={16} className="inline mr-1" />
                生成有声H5，微信一键分享
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {FEATURES.map((feature, i) => (
                <div key={i} className="p-3 md:p-5 rounded-xl bg-[#FCF9F6] border border-[#E8DDD0] hover:border-[#FF6B4A] transition-colors">
                  <div className="text-[#FF6B4A] mb-3">{feature.icon}</div>
                  <h3 className="font-medium text-[#3E2E21] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#8B7355]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <button className="inline-flex items-center gap-2 text-[#FF6B4A] font-medium hover:underline">
              <BookOpen size={18} /> 了解详细流程 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20 px-4 md:px-6 bg-[#F5EDE8]">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>四个步骤，轻松留传</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-sm">
                <div className="text-xs text-[#FF6B4A] font-medium mb-3">0{i + 1}</div>
                <div className="w-14 h-14 rounded-xl bg-[#FCF9F6] flex items-center justify-center text-[#FF6B4A] mb-4 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-lg font-medium text-[#3E2E21] mb-2">{step.title}</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 text-sm text-[#8B7355]">
            整个过程中，父母只需要做一件事——开口说话。剩下的，交给我们。
          </div>
        </div>
      </section>

      {/* Eight Columns */}
      <section id="columns" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>八大人生篇章，一部完整传记</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="p-3 md:p-5 rounded-xl bg-[#FCF9F6] border border-[#E8DDD0] hover:border-[#FF6B4A] hover:shadow-md transition-all cursor-pointer">
                <div className="text-sm font-medium text-[#FF6B4A] mb-1">{col.name}</div>
                <div className="text-xs text-[#8B7355] mb-2">{col.subtitle}</div>
                <div className="text-sm text-[#5C4B3A]">"{col.example}"</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setShowQuestionsModal(true)}
              className="text-[#FF6B4A] font-medium hover:underline flex items-center gap-1 mx-auto"
            >
              查看完整30问示例 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#FCF9F6]">
        <div className="max-w-[1120px] mx-auto">
{/* Share Your Story Title */}
          <div className="mb-6 md:mb-10 text-center">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>分享您的故事</h2>
            <p className="text-[#8B7355] text-base md:text-lg">您也有故事想要分享吗？</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E8DDD0]">
                <div className="text-[#3E2E21] leading-relaxed mb-6">"{item.quote}"</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-[#3E2E21] text-sm">{item.name}</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-[#FF6B4A] bg-[#FF6B4A]/10 px-3 py-1.5 rounded-full">
                    <Play size={12} /> 原声片段
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Share Link */}
          <div className="mt-10 text-center">
            <button className="inline-flex items-center gap-2 text-[#FF6B4A] font-medium hover:underline">
              <ArrowRight size={16} /> 分享您的故事
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>为记忆定价，为传家买单</h2>
            <p className="text-[#8B7355] text-base md:text-lg">电子版49元，实体书149元，送礼卡169元</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto items-stretch">
            {PRICING.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-4 md:p-6 border-2 border-[#E8DDD0] bg-white transition-all flex flex-col"
              >
                <h3 className="text-lg font-medium text-[#3E2E21] mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-[#FF6B4A] mb-4">¥{plan.price}</div>
                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#5C4B3A]">
                      <Check size={14} className="text-[#FF6B4A]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-[28px] font-medium transition-colors bg-[#FF6B4A] text-white hover:bg-[#E85A3A]">
                  {plan.id === 'free' ? '立即体验' : '立即购买'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 text-sm text-[#8B7355]">
            30天无理由退款（电子版需未生成完整内容） · 所有数据归用户所有，可一键导出/删除
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#F5EDE8]">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>您的故事，只属于您</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="bg-white rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] mx-auto mb-2 md:mb-4">
                <Lock size={20} className="md:w-7 md:h-7" />
              </div>
              <h3 className="font-medium text-[#3E2E21] mb-1 md:mb-2 text-sm md:text-base">数据归用户所有</h3>
              <p className="text-xs md:text-sm text-[#8B7355]">永不用于AI训练</p>
            </div>
            <div className="bg-white rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] mx-auto mb-2 md:mb-4">
                <Download size={20} className="md:w-7 md:h-7" />
              </div>
              <h3 className="font-medium text-[#3E2E21] mb-1 md:mb-2 text-sm md:text-base">一键导出</h3>
              <p className="text-xs md:text-sm text-[#8B7355]">所有录音、文字、照片</p>
            </div>
            <div className="bg-white rounded-2xl p-3 md:p-6 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] mx-auto mb-2 md:mb-4">
                <Trash2 size={20} className="md:w-7 md:h-7" />
              </div>
              <h3 className="font-medium text-[#3E2E21] mb-1 md:mb-2 text-sm md:text-base">随时删除</h3>
              <p className="text-xs md:text-sm text-[#8B7355]">不留痕迹</p>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-[#8B7355]">
            我们承诺不向第三方分享任何家庭内容。
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#3E2E21] text-center mb-8 md:mb-12" style={{ fontFamily: 'serif' }}>常见问题</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className="border border-[#E8DDD0] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-[#FCF9F6] hover:bg-[#F5EDE8] transition-colors"
                >
                  <span className="font-medium text-[#3E2E21]">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-[#FF6B4A]" /> : <ChevronDown size={20} className="text-[#8B7355]" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 py-5 text-[#5C4B3A] text-sm leading-relaxed bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#FF6B4A]">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold text-white mb-3 md:mb-4" style={{ fontFamily: 'serif' }}>今天就开始，为父母留传一生故事</h2>
          <p className="text-white/80 text-base md:text-lg mb-8 md:mb-10">
            时间不等人，父母的声音值得被永远记住。
          </p>
          <button className="px-10 py-5 bg-white text-[#FF6B4A] rounded-[28px] text-lg font-medium hover:bg-[#FCF9F6] transition-all flex items-center gap-2 mx-auto shadow-lg">
            <Mic size={20} /> 立即购买 ¥149 <ArrowRight size={20} />
          </button>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm mt-8">
            <span>不满意可重录</span>
            <span>·</span>
            <span>全国包邮</span>
            <span>·</span>
            <span>永久云端存档</span>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-[#8B7355] hover:text-[#3E2E21]"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#3E2E21] mb-2" style={{ fontFamily: 'serif' }}>欢迎回来</h2>
              <p className="text-[#8B7355] text-sm">登录您的留传账号</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">手机号</label>
                <input
                  type="tel"
                  value={loginForm.phone}
                  onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none text-[#3E2E21]"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">密码</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none text-[#3E2E21]"
                  placeholder="请输入密码"
                />
              </div>
              <button
                onClick={() => { setShowLoginModal(false); onNavigate?.('app'); }}
                className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E85A3A] transition-colors"
              >
                登录
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                className="text-[#FF6B4A] text-sm hover:underline"
              >
                还没有账号？立即注册
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-[#8B7355] hover:text-[#3E2E21]"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#3E2E21] mb-2" style={{ fontFamily: 'serif' }}>创建账号</h2>
              <p className="text-[#8B7355] text-sm">开启您的家族记忆之旅</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">姓名</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none text-[#3E2E21]"
                  placeholder="请输入您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">手机号</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none text-[#3E2E21]"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5C4B3A] mb-2">密码</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none text-[#3E2E21]"
                  placeholder="请设置密码"
                />
              </div>
              <button
                onClick={() => { setShowRegisterModal(false); onNavigate?.('app'); }}
                className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E85A3A] transition-colors"
              >
                注册
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                className="text-[#FF6B4A] text-sm hover:underline"
              >
                已有账号？立即登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden relative">
            <div className="sticky top-0 bg-white border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#3E2E21]" style={{ fontFamily: 'serif' }}>30个精选问题</h2>
                <p className="text-sm text-[#8B7355]">八大人生篇章，每个篇章3-4个核心问题</p>
              </div>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="text-[#8B7355] hover:text-[#3E2E21] p-2"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {SAMPLE_QUESTIONS.map((section, idx) => (
                  <div key={idx} className="border border-[#E8DDD0] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-[#FF6B4A]">{section.category}</span>
                      <span className="text-xs text-[#8B7355]">· {section.subtitle}</span>
                    </div>
                    <ul className="space-y-2">
                      {section.questions.map((q, qIdx) => (
                        <li key={qIdx} className="text-sm text-[#3E2E21] flex items-start gap-2">
                          <span className="text-[#FF6B4A] font-medium">{qIdx + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[#E8DDD0] px-6 py-4">
              <button
                onClick={() => { setShowQuestionsModal(false); onNavigate?.('app'); }}
                className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E85A3A] transition-colors"
              >
                开始体验这些问题
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 试听金句弹窗 */}
      {showSampleQuotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#E8DDD0]">
              <h3 className="text-xl font-bold text-[#3E2E21]">试听金句 · AI润色效果展示</h3>
              <button onClick={() => setShowSampleQuotes(false)} className="text-[#8B7355] hover:text-[#3E2E21]">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* 示例选择器 */}
              <div className="flex gap-2 mb-6">
                {SAMPLE_QUOTES.map((quote, idx) => (
                  <button
                    key={quote.id}
                    onClick={() => setCurrentQuoteIndex(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      currentQuoteIndex === idx
                        ? 'bg-[#FF6B4A] text-white'
                        : 'bg-[#FCF9F6] text-[#5C4B3A] hover:bg-[#E8DDD0]'
                    }`}
                  >
                    {quote.chapter}
                  </button>
                ))}
              </div>

              {/* 当前示例 */}
              <div className="space-y-6">
                <div className="bg-[#FCF9F6] rounded-2xl p-5">
                  <div className="text-sm text-[#FF6B4A] font-medium mb-2">{SAMPLE_QUOTES[currentQuoteIndex].chapter}</div>
                  <div className="text-lg text-[#3E2E21] font-medium mb-4">{SAMPLE_QUOTES[currentQuoteIndex].question}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 原始录音转文字 */}
                  <div className="bg-[#FFF9F0] rounded-2xl p-5 border-l-4 border-[#E8DDD0]">
                    <div className="flex items-center gap-2 text-sm text-[#8B7355] mb-3">
                      <Mic size={16} />
                      <span>原始口述</span>
                    </div>
                    <p className="text-[#5C4B3A] text-sm leading-relaxed">
                      {SAMPLE_QUOTES[currentQuoteIndex].rawText}
                    </p>
                  </div>

                  {/* AI润色后 */}
                  <div className="bg-[#FFF9F0] rounded-2xl p-5 border-l-4 border-[#FF6B4A]">
                    <div className="flex items-center gap-2 text-sm text-[#FF6B4A] mb-3">
                      <Sparkles size={16} />
                      <span>AI润色后</span>
                    </div>
                    <p className="text-[#3E2E21] text-sm leading-relaxed">
                      {SAMPLE_QUOTES[currentQuoteIndex].polishedText}
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm text-[#8B7355]">
                  左右滑动或点击上方标签切换不同示例
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E8DDD0] bg-[#FCF9F6]">
              <button
                onClick={() => { setShowSampleQuotes(false); onNavigate?.('app'); }}
                className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E85A3A] transition-colors"
              >
                开始录制我的故事
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 md:px-6 bg-[#3E2E21]">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-[22px] font-bold text-white" style={{ fontFamily: 'serif' }}>留传</div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors">常见问题</a>
              <button onClick={() => onNavigate?.('privacy')} className="hover:text-white transition-colors">隐私政策</button>
              <button onClick={() => onNavigate?.('terms')} className="hover:text-white transition-colors">服务条款</button>
              <button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors">联系我们</button>
            </div>
          </div>
          <div className="text-center text-sm text-white/40">
            © 2025 留传 · 普通人的家族数字档案馆
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
