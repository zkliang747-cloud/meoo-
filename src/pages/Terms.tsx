import React from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';

interface TermsProps {
  onNavigate?: (page: 'landing') => void;
}

const Terms: React.FC<TermsProps> = ({ onNavigate }) => {
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
              <FileText size={32} />
            </div>
            <h1 className="text-[32px] font-bold text-[#3E2E21] mb-3" style={{ fontFamily: 'serif' }}>服务条款</h1>
            <p className="text-[#8B7355]">最后更新：2025年1月</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E8DDD0] space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">1. 服务概述</h2>
              <p className="text-[#5A4A42] leading-relaxed">
                留传是一个家庭回忆录记录平台，通过AI技术帮助用户将口述故事整理成文字，
                并生成有声H5和实体书。我们致力于帮助每个家庭留下可以传家的人生故事。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">2. 用户责任</h2>
              <ul className="space-y-3 text-[#5A4A42]">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#FF6B4A] mt-1 flex-shrink-0" />
                  <span>您保证所提供的内容不侵犯任何第三方的知识产权</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#FF6B4A] mt-1 flex-shrink-0" />
                  <span>您保证所记录的内容真实、合法，不含有违法违规信息</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#FF6B4A] mt-1 flex-shrink-0" />
                  <span>您理解并同意，家庭故事的内容由您自行负责</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">3. 退款政策</h2>
              <p className="text-[#5A4A42] leading-relaxed">
                我们提供30天无理由退款保障。如果您对服务不满意，可以在购买后30天内申请全额退款。
                电子版退款需满足未生成完整内容的条件。实体书一旦开始印刷，将无法退款。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">4. 知识产权</h2>
              <p className="text-[#5A4A42] leading-relaxed">
                您保留对您所创作内容的全部知识产权。我们仅获得为您提供服务所必需的使用权限。
                我们不会将您的内容用于任何商业目的，也不会将其用于AI模型训练。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2E21] mb-4">5. 服务变更</h2>
              <p className="text-[#5A4A42] leading-relaxed">
                我们保留随时修改或终止服务的权利。如服务发生重大变更，我们将提前通知您。
                已购买的服务权益不受影响。
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
