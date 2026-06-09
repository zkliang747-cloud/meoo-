import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Phone, Send } from 'lucide-react';

interface ContactProps {
  onNavigate?: (page: 'landing') => void;
}

const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // 这里可以添加实际的表单提交逻辑
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFEFE5]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FCF9F6]/95 backdrop-blur-md border-b border-[#E8DDD0]">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onNavigate?.('landing')} className="text-[22px] font-bold text-[#3E2E21]" style={{ fontFamily: 'serif' }}>留传</button>
          <button onClick={() => onNavigate?.('landing')} className="flex items-center gap-2 text-[#FF6B4A] hover:underline">
            <ArrowLeft size={18} /> 返回首页
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <h1 className="text-[32px] font-bold text-[#3E2E21] mb-3" style={{ fontFamily: 'serif' }}>联系我们</h1>
            <p className="text-[#8B7355]">有任何问题？我们随时为您解答</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8DDD0]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A]">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#3E2E21]">电子邮件</h3>
                    <p className="text-[#8B7355] text-sm">hello@liuchuan.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8DDD0]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A]">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#3E2E21]">客服电话</h3>
                    <p className="text-[#8B7355] text-sm">400-888-9999</p>
                    <p className="text-[#8B7355] text-xs">工作日 9:00-18:00</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FF6B4A]/5 rounded-2xl p-6 border border-[#FF6B4A]/20">
                <h3 className="font-medium text-[#3E2E21] mb-2">快速响应承诺</h3>
                <p className="text-[#5A4A42] text-sm">
                  我们承诺在24小时内回复您的邮件，紧急问题请拨打客服电话。
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8DDD0]">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-500 mx-auto mb-4">
                    <Send size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#3E2E21] mb-2">消息已发送</h3>
                  <p className="text-[#8B7355]">我们会尽快回复您</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-[#FF6B4A] hover:underline"
                  >
                    发送新消息
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3E2E21] mb-1">您的姓名</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none"
                      placeholder="请输入姓名"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3E2E21] mb-1">电子邮箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none"
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3E2E21] mb-1">主题</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none"
                      required
                    >
                      <option value="">请选择</option>
                      <option value="general">一般咨询</option>
                      <option value="support">技术支持</option>
                      <option value="billing">订单问题</option>
                      <option value="feedback">产品建议</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3E2E21] mb-1">留言内容</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] focus:border-[#FF6B4A] focus:outline-none resize-none"
                      placeholder="请描述您的问题或建议..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF6B4A] text-white rounded-[28px] font-medium hover:bg-[#E85A3A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> 发送消息
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
