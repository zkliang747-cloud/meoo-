import React, { useState, useEffect } from 'react';
import { User, Package, FileText, LogOut, ChevronRight, Crown, Check, Clock, X, Download, Trash2, AlertTriangle } from 'lucide-react';
import { getUserOrders, type Order } from '../services/orderService';
import { exportUserData, deleteAllUserData, type Story } from '../services/storyService';
import { supabase } from '../supabase/client';

interface UserProfileProps {
  user: any;
  profile: any;
  stories: Story[];
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, profile, stories, onLogout, onNavigate, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'stories' | 'settings'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 加载用户订单
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) {
      console.error('加载订单失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 计算完成进度
  const completedCount = stories.filter(s => s.is_completed).length;
  const totalCount = stories.length || 6;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><Check size={12} />已支付</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock size={12} />待支付</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><X size={12} />支付失败</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  // 导出数据
  const handleExport = async () => {
    if (!user) return;
    try {
      setExporting(true);
      const data = await exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `留传数据导出_${profile?.username || '用户'}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 删除账户
  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteAllUserData(user.id);
      await supabase.auth.admin.deleteUser(user.id);
      onLogout();
      onClose();
    } catch (err) {
      console.error('删除账户失败:', err);
      alert('删除账户失败，请联系客服');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-[#E8DDD0]">
          <h3 className="text-xl font-bold text-[#3E2E21]">我的</h3>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#3E2E21]">
            <X size={24} />
          </button>
        </div>

        {/* 用户信息卡片 */}
        <div className="p-6 bg-gradient-to-r from-[#FF6B4A] to-[#E85A3A] text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {profile?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-lg font-bold">{profile?.username || '用户'}</div>
              <div className="text-white/80 text-sm">{profile?.phone || user?.email}</div>
              {profile?.is_paid && (
                <div className="flex items-center gap-1 mt-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                  <Crown size={12} />
                  <span>{profile?.paid_plan || '付费用户'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-[#E8DDD0]">
          {[
            { id: 'overview', label: '概览', icon: User },
            { id: 'orders', label: '订单', icon: Package },
            { id: 'stories', label: '故事', icon: FileText },
            { id: 'settings', label: '设置', icon: LogOut },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A]'
                  : 'text-[#8B7355] hover:text-[#5C4B3A]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* 概览 */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 进度卡片 */}
              <div className="bg-[#FCF9F6] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#5C4B3A] font-medium">故事完成进度</span>
                  <span className="text-[#FF6B4A] font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-[#E8DDD0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B4A] rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-sm text-[#8B7355] mt-2">
                  已完成 {completedCount} / {totalCount} 个故事
                </div>
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FCF9F6] rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B4A]">{orders.length}</div>
                  <div className="text-sm text-[#8B7355]">订单数量</div>
                </div>
                <div className="bg-[#FCF9F6] rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B4A]">
                    {orders.filter(o => o.status === 'paid').length > 0 ? '已付费' : '免费版'}
                  </div>
                  <div className="text-sm text-[#8B7355]">账户状态</div>
                </div>
              </div>

              {/* 快捷操作 */}
              <button
                onClick={() => onNavigate?.('app')}
                className="w-full py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E85A3A] transition-colors"
              >
                继续录制故事
              </button>
            </div>
          )}

          {/* 订单 */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-[#8B7355]">加载中...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-[#8B7355]">暂无订单</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-[#FCF9F6] rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-[#3E2E21]">{order.plan_name}</div>
                        <div className="text-xs text-[#8B7355]">订单号: {order.order_no}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#8B7355]">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="font-bold text-[#FF6B4A]">¥{order.price / 100}</span>
                    </div>
                    {order.pdf_url && (
                      <a
                        href={order.pdf_url}
                        download
                        className="mt-2 flex items-center gap-1 text-sm text-[#FF6B4A] hover:underline"
                      >
                        <Download size={14} />
                        下载PDF
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 故事 */}
          {activeTab === 'stories' && (
            <div className="space-y-3">
              {stories.length === 0 ? (
                <div className="text-center py-8 text-[#8B7355]">暂无故事记录</div>
              ) : (
                stories.map((story) => (
                  <div key={story.id} className="bg-[#FCF9F6] rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-[#FF6B4A] font-medium">{story.chapter}</div>
                        <div className="text-[#3E2E21] text-sm mt-1 line-clamp-2">{story.question_text}</div>
                      </div>
                      {story.is_completed ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <Clock size={20} className="text-[#E8DDD0]" />
                      )}
                    </div>
                    {story.polished_text && (
                      <div className="mt-2 text-xs text-[#8B7355] line-clamp-2">
                        {story.polished_text}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 设置 */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full py-3 bg-[#FCF9F6] text-[#5C4B3A] rounded-xl font-medium hover:bg-[#E8DDD0] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {exporting ? '导出中...' : '导出我的数据'}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                删除账户和所有数据
              </button>

              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full py-3 bg-[#E8DDD0] text-[#5C4B3A] rounded-xl font-medium hover:bg-[#D4C4B5] transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                退出登录
              </button>
            </div>
          )}
        </div>

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle size={32} />
                <h4 className="text-lg font-bold">确认删除账户？</h4>
              </div>
              <p className="text-[#5C4B3A] mb-6">
                此操作将永久删除您的账户和所有数据，包括故事、订单记录等。此操作不可恢复。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-[#E8DDD0] text-[#5C4B3A] rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
