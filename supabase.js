// Supabase Configuration
const SUPABASE_URL = 'https://lxuebhvwykqblyrgqsfz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWViaHZ3eWtxYmx5cmdxc2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTE2MjEsImV4cCI6MjA3ODUyNzYyMX0.VhDznZhGDmvK3NTmPYKxZkbsL3K3n4qnlhf7eBiyBx4';

// Initialize Supabase client
const _supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Legacy supabase object for backward compatibility
const supabase = {
  auth: {
    async signUp(email, password, options = {}) {
      return await _supabase.auth.signUp({ email, password, options });
    },
    async signInWithPassword({ email, password }) {
      return await _supabase.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      const result = await _supabase.auth.signOut();
      // Clear localStorage on signout
      localStorage.removeItem('supabase_user');
      localStorage.removeItem('supabase_token');
      return result;
    },
    getUser() {
      return JSON.parse(localStorage.getItem('supabase_user') || 'null');
    }
  }
};

// Check if user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem('supabase_token');
  const user = localStorage.getItem('supabase_user');
  return token && user;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('supabase_user') || 'null');
}

// Sign up user without email confirmation
async function signUpUser(email, password, userData = {}) {
  const { data, error } = await _supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: undefined,
      skipConfirmation: true
    }
  });
  
  return { data, error };
}

// Check if user is admin
function isAdmin() {
  const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');
  return user.user_metadata?.role === 'admin';
}

// Fetch cars from Supabase
async function fetchCarsFromSupabase() {
  try {
    const { data, error } = await _supabase
      .from('cars')
      .select('*')
      .eq('is_available', true);

    if (error) throw error;

    return data.map(car => ({
      id: car.id,
      name: car.model,
      category: car.category,
      price: parseFloat(car.price_per_day),
      transmission: car.transmission,
      seats: car.seats,
      fuel: car.fuel_type,
      color: car.color,
      regNo: car.car_reg_no,
      img: `cars/${car.model.toLowerCase().replace(/\s+/g, '')}.jpg`
    }));
  } catch (error) {
    console.error('Error fetching cars:', error);
    return [];
  }
}

// Save booking to Supabase and mark car as unavailable
async function saveBookingToSupabase(bookingData) {
  try {
    const { data, error } = await _supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) throw error;

    // Mark car as unavailable
    await _supabase
      .from('cars')
      .update({ is_available: false })
      .eq('id', bookingData.car_id);

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error saving booking:', error);
    return { success: false, error: error.message };
  }
}

// Return car and mark as available
async function returnCar(bookingId) {
  try {
    const { data: booking } = await _supabase
      .from('bookings')
      .select('car_id')
      .eq('id', bookingId)
      .single();

    if (!booking) throw new Error('Booking not found');

    // Mark car as available
    await _supabase
      .from('cars')
      .update({ is_available: true })
      .eq('id', booking.car_id);

    // Update booking status to completed
    await _supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    return { success: true };
  } catch (error) {
    console.error('Error returning car:', error);
    return { success: false, error: error.message };
  }
}

// Function to handle login for unconfirmed users
async function loginWithoutConfirmation(email, password) {
  // First try normal login
  const { data, error } = await _supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error && error.message.includes('Email not confirmed')) {
    // If email not confirmed, try to sign up again to get session
    const { data: signupData, error: signupError } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        skipConfirmation: true
      }
    });
    
    if (signupData.session) {
      // Store session data in localStorage
      localStorage.setItem('supabase_user', JSON.stringify(signupData.user));
      localStorage.setItem('supabase_token', signupData.session.access_token);
      return { data: signupData, error: null };
    }
  } else if (data.session) {
    // Store session data for successful login
    localStorage.setItem('supabase_user', JSON.stringify(data.user));
    localStorage.setItem('supabase_token', data.session.access_token);
  }
  
  return { data, error };
}

// Export the Supabase client
window.supabase = _supabase;
window.loginWithoutConfirmation = loginWithoutConfirmation;
