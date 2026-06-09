import React, { useState } from 'react';
import Memoir from './pages/Memoir';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

type PageType = 'landing' | 'app' | 'privacy' | 'terms' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [showPricingOnApp, setShowPricingOnApp] = useState(false);

  const handleNavigate = (page: PageType, openPricing?: boolean) => {
    setCurrentPage(page);
    if (openPricing) {
      setShowPricingOnApp(true);
    }
  };

  // 页面路由
  if (currentPage === 'privacy') {
    return <Privacy onNavigate={(page) => setCurrentPage(page as PageType)} />;
  }
  if (currentPage === 'terms') {
    return <Terms onNavigate={(page) => setCurrentPage(page as PageType)} />;
  }
  if (currentPage === 'contact') {
    return <Contact onNavigate={(page) => setCurrentPage(page as PageType)} />;
  }
  if (currentPage === 'app') {
    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <Memoir
          onNavigate={(page) => setCurrentPage(page as PageType)}
          initialShowPricing={showPricingOnApp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Landing
        onNavigate={(page, openPricing) => handleNavigate(page as PageType, openPricing)}
      />
      {/* 浮动按钮进入应用 */}
      <button
        onClick={() => setCurrentPage('app')}
        className="fixed bottom-8 right-8 px-6 py-3 bg-[#FF6B4A] text-white rounded-full font-medium shadow-lg hover:bg-[#E85A3A] transition-colors z-50"
      >
        开始记录
      </button>
    </div>
  );
}

export default App;
