// ============================================
// SUPABASE CLIENT & MANAGER
// ============================================
const SUPABASE_URL = 'https://oldnutqeqvhqwsynjmth.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZG51dHFlcXZocXdzeW5qbXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjEyNjksImV4cCI6MjA4Njc5NzI2OX0.ihYsM-tyLstRhZlKQEgs1PBvpgz3z71KKmGbCp3KDg8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// SUPABASE MANAGER
// ============================================
class SupabaseManager {
  constructor() {
    this.currentUser = null;
    this._authCallbacks = [];
    this._profileCache = null;
    this._profileSaveTimeout = null;

    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      this._profileCache = null;
      this._authCallbacks.forEach(cb => {
        try { cb(event, session); } catch (e) { console.warn('Auth callback error:', e); }
      });
    });

    // Check existing session
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) {
        this.currentUser = data.session.user;
      }
    });
  }

  // ---- Auth ----

  onAuthStateChange(callback) {
    this._authCallbacks.push(callback);
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  async signUp(email, password, displayName) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName || '' }
      }
    });
    if (error) throw error;
    // Update display name in profile if auto-created
    if (data.user && displayName) {
      await supabaseClient
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', data.user.id);
    }
    return data;
  }

  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email, password
    });
    if (error) throw error;
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    this.currentUser = null;
    this._profileCache = null;
  }

  // ---- Profile ----

  async getProfile() {
    if (!this.currentUser) return null;
    if (this._profileCache) return this._profileCache;

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();

    if (error) {
      console.warn('Profile load error:', error);
      return null;
    }
    this._profileCache = data;
    return data;
  }

  async updateProfile(updates) {
    if (!this.currentUser) return;
    // Debounce profile saves
    if (this._profileSaveTimeout) clearTimeout(this._profileSaveTimeout);
    // Merge with cache
    if (this._profileCache) {
      Object.assign(this._profileCache, updates);
    }
    this._profileSaveTimeout = setTimeout(async () => {
      try {
        const { error } = await supabaseClient
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', this.currentUser.id);
        if (error) console.warn('Profile update error:', error);
      } catch (e) {
        console.warn('Profile update failed:', e);
      }
    }, 1000);
  }

  // ---- Game Progress ----

  async saveProgress(gameData) {
    if (!this.currentUser) return null;
    try {
      const { data, error } = await supabaseClient
        .from('game_progress')
        .upsert({
          user_id: this.currentUser.id,
          ...gameData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) {
        console.warn('Save progress error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Save progress failed:', e);
      return null;
    }
  }

  async loadProgress() {
    if (!this.currentUser) return null;
    try {
      const { data, error } = await supabaseClient
        .from('game_progress')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        console.warn('Load progress error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Load progress failed:', e);
      return null;
    }
  }

  async deleteProgress() {
    if (!this.currentUser) return;
    try {
      await supabaseClient
        .from('game_progress')
        .delete()
        .eq('user_id', this.currentUser.id);
    } catch (e) {
      console.warn('Delete progress failed:', e);
    }
  }

  // ---- Leaderboard ----

  async submitScore(scoreData) {
    if (!this.currentUser) {
      console.warn('Submit score: not logged in');
      return null;
    }
    try {
      const profile = await this.getProfile();
      const displayName = profile?.display_name || this.currentUser.email?.split('@')[0] || 'Player';

      const insertData = {
        user_id: this.currentUser.id,
        display_name: displayName,
        character_type: scoreData.character_type,
        game_difficulty: scoreData.game_difficulty,
        quiz_difficulty: scoreData.quiz_difficulty,
        total_time: scoreData.total_time,
        total_deaths: scoreData.total_deaths,
      };
      const { data, error } = await supabaseClient
        .from('leaderboard_entries')
        .insert(insertData)
        .select()
        .single();
      if (error) {
        console.error('Submit score error:', error.message, error.details, error.code);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Submit score exception:', e);
      return null;
    }
  }

  async getLeaderboard(limit) {
    try {
      const { data, error } = await supabaseClient
        .rpc('get_leaderboard', { limit_count: limit || 50 });
      if (error) {
        console.warn('Leaderboard load error:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (e) {
      console.warn('Leaderboard load failed:', e);
      return { data: null, error: e };
    }
  }

  // ---- Quiz Results ----

  async saveQuizResult(quizData) {
    if (!this.currentUser) return;
    try {
      await supabaseClient
        .from('quiz_results')
        .insert({
          user_id: this.currentUser.id,
          ...quizData
        });
    } catch (e) {
      // Quiz results are analytics — silent fail
    }
  }
}

// Global instance
window.supabaseManager = new SupabaseManager();
