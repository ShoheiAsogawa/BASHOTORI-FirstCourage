import { supabase } from './supabase';

export type UserRole = 'readonly' | 'admin' | null;

/**
 * 現在のユーザーのロールを取得
 */
export async function getUserRole(): Promise<UserRole> {
  const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
  if (!user) return null;
  
  // ユーザーメタデータからロールを取得
  const role = user.user_metadata?.role;
  if (role === 'admin' || role === 'readonly') {
    return role;
  }
  
  // デフォルトは読み取り専用
  return 'readonly';
}

/**
 * 現在のユーザーが管理者かどうかを判定
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * 現在のユーザーが読み取り専用かどうかを判定
 */
export async function isReadOnly(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'readonly';
}

