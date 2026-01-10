// Supabase Configuration
const SUPABASE_URL = 'https://atfaviwwbegsvzhsdswl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0ZmF2aXd3YmVnc3Z6aHNkc3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzYwNzcsImV4cCI6MjA4MzYxMjA3N30.McacEXDepEeQSmwvFaE--PU-gkDj2yTrCRuau_jst1s';

// Wait for Supabase library to load, then initialize
(function() {
  // Store the library reference
  const supabaseLib = window.supabase;
  
  if (!supabaseLib || !supabaseLib.createClient) {
    console.error('Supabase library not loaded!');
    return;
  }
  
  // Initialize Supabase client
  const _supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Export the client globally
  window.supabase = _supabase;
  window._supabase = _supabase; // Also export as _supabase for compatibility

  // Helper functions
  window.isAuthenticated = function() {
    const token = localStorage.getItem('supabase_token');
    const user = localStorage.getItem('supabase_user');
    return token && user;
  };
  
  window.getCurrentUser = function() {
    return JSON.parse(localStorage.getItem('supabase_user') || 'null');
  };
  
  window.signUpUser = async function(email, password, userData = {}) {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: undefined
      }
    });
    return { data, error };
  };
  
  window.saveBookingToSupabase = async function(bookingData) {
    try {
      const { data, error } = await _supabase
        .from('bookings')
        .insert([bookingData])
        .select();
  
      if (error) throw error;
  
      await _supabase
        .from('cars')
        .update({ is_available: false })
        .eq('id', bookingData.car_id);
  
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error saving booking:', error);
      return { success: false, error: error.message };
    }
  };
  
  console.log('Supabase client initialized successfully');
})();
