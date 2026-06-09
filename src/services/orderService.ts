import { supabase, getSupabaseUrl } from '../supabase/client';

export interface Order {
  id: string;
  user_id: string;
  order_no: string;
  plan_type: string;
  plan_name: string;
  price: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: string | null;
  transaction_id: string | null;
  pdf_url: string | null;
  book_shipped: boolean;
  book_tracking_no: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  disabledFeatures?: string[];
  badge?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: '免费体验',
    price: 0,
    features: ['回答前 3 个问题', '基础语音识别'],
    disabledFeatures: ['AI 润色', '生成 PDF'],
  },
  {
    id: 'digital',
    name: '记忆集·电子版',
    price: 4900, // 分
    badge: '最受欢迎',
    features: ['全部 30 个问题', 'AI 智能润色', '生成精美 PDF', '子女留言'],
  },
  {
    id: 'book',
    name: '记忆集·实体书',
    price: 14900, // 分
    badge: '传家之选',
    features: ['电子版全部功能', '精装实体书一本', '全国包邮', '精美包装'],
  },
];

// 创建订单
export async function createOrder(planType: string): Promise<Order> {
  const plan = PRICING_PLANS.find((p) => p.id === planType);
  if (!plan) {
    throw new Error('无效的套餐类型');
  }

  const orderNo = generateOrderNo();

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      order_no: orderNo,
      plan_type: planType,
      plan_name: plan.name,
      price: plan.price,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('创建订单失败:', error);
    throw new Error(`创建订单失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建订单失败：未返回数据');
  }

  return data as Order;
}

// 获取用户的所有订单
export async function getUserOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取订单失败:', error);
    throw new Error(`获取订单失败: ${error.message}`);
  }

  return (data || []) as Order[];
}

// 获取单个订单
export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('获取订单失败:', error);
    throw new Error(`获取订单失败: ${error.message}`);
  }

  return data as Order | null;
}

// 发起支付
export async function initiatePayment(orderId: string): Promise<{
  orderNo: string;
  codeUrl: string;
}> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'create',
      orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '发起支付失败');
  }

  return await response.json();
}

// 查询支付状态
export async function queryPaymentStatus(orderNo: string): Promise<{
  status: string;
  paidAt: string | null;
}> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${getSupabaseUrl()}/functions/v1/payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'query',
      orderNo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '查询支付状态失败');
  }

  return await response.json();
}

// 生成订单号
function generateOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `LC${dateStr}${random}`;
}

// 检查用户是否有付费订单
export async function checkUserPayment(): Promise<boolean> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .maybeSingle();

  if (error) {
    console.error('检查支付状态失败:', error);
    return false;
  }

  return !!data;
}
