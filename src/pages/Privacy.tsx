import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Trash2 } from 'lucide-react';

interface PrivacyProps {
  onNavigate?: (page: 'landing') => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onNavigate }) => {
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
              <Shield size={32} />
            </div>
            <h1 className="text-[32px] font-bold text-[#3E2E21] mb-3" style={{ fontFamily: 'serif' }}>隐私政策</h1>
            <p className="text-[#8B7355]">最后更新：2025年1月</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E8DDD0] space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock size={20} className="text-[#FF6B4A]" />
                <h2 className="text-xl font-bold text-[#3E2E21]">数据所有权</h2>
              </div>
              <p className="text-[#5A4A42] leading-relaxed">
                在留传，您的故事完全属于您。我们仅作为技术平台帮助您记录和整理家庭回忆，
                所有录音、文字、照片的知识产权均归您和您的家人所有。
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye size={20} className="text-[#FF6B4A]" />
                <h2 className="text-xl font-bold text-[#3E2E21]">数据使用承诺</h2>
              </div>
              <ul className="space-y-3 text-[#5A4A42]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B4A] mt-1">•</span>
                  <span>我们永远不会将您的家庭故事用于AI模型训练</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B4A] mt-1">•</span>
                  <span>不会向任何第三方出售或分享您的个人数据</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B4A] mt-1">•</span>
                  <span>不会将您的内容用于商业广告或营销目的</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Trash2 size={20} className="text-[#FF6B4A]" />
                <h2 className="text-xl font-bold text-[#3E2E21]">数据删除</h2>
              </div>
              <p className="text-[#5A4A42] leading-relaxed">
                您可以随时删除您的账户和所有相关数据。删除后，所有录音、文字、照片将从我们的服务器永久移除，
                且无法恢复。您也可以在删除前一键导出所有内容备份。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">联系我们</h2>
              <p className="text-[#5A4A42] leading-relaxed">
                如果您对隐私政策有任何疑问，请通过以下方式联系我们：<br />
                邮箱：privacy@liuchuan.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
