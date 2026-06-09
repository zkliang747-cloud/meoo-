import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  phone: string | null;
  avatar_url: string | null;
  is_paid: boolean;
  paid_plan: string | null;
  paid_at: string | null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('获取用户信息失败:', error);
      return;
    }
    
    setProfile(data as Profile);
  };

  const signUp = async (username: string, password: string, phone?: string) => {
    const email = `${username}@meoo.local`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
        },
      },
    });
    
    if (error) throw error;
    return data;
  };

  const signIn = async (username: string, password: string) => {
    const email = `${username}@meoo.local`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('用户未登录');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data as Profile);
    return data;
  };

  return {
    session,
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isPaid: profile?.is_paid ?? false,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
