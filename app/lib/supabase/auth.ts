import { getSupabaseClient } from './client';

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  return { data };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { error: error.message };

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username,
    });

    if (profileError) return { error: profileError.message };
  }

  return { data };
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) return { error: error.message };
  return { data };
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session;
}
