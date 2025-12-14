const bookingForm = document.getElementById("bookingForm");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const selectedBrandEl = document.getElementById("selectedBrand");
const selectedCarEl = document.getElementById("selectedCar");
let bookingPageCars = [];

function showModal(title, message, type = 'info') {
  const modal = document.createElement('div');
  modal.className = 'alert-modal';
  modal.innerHTML = `
    <div class="alert-overlay"></div>
    <div class="alert-box alert-${type}">
      <div class="alert-header">
        <h3>${title}</h3>
        <button class="alert-close">&times;</button>
      </div>
      <div class="alert-body">
        <p>${message}</p>
      </div>
      <div class="alert-footer">
        <button class="alert-btn">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('.alert-close');
  const okBtn = modal.querySelector('.alert-btn');
  const overlay = modal.querySelector('.alert-overlay');
  
  const close = () => modal.remove();
  closeBtn.addEventListener('click', close);
  okBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
}

function bookCar(carId, carModel, pricePerDay) {
  localStorage.setItem('selectedCar', JSON.stringify({ id: carId, model: carModel, price_per_day: pricePerDay }));
  window.location.href = 'booking.html';
}

function updatePrice(brand) {
  const modelSelect = document.getElementById(`model-${brand}`);
  const priceDisplay = document.getElementById(`price-${brand}`);
  const imageElement = document.querySelector(`#brand-${brand} .car-image img`);
  const selectedOption = modelSelect.options[modelSelect.selectedIndex];
  
  if (selectedOption.value) {
    const price = parseFloat(selectedOption.dataset.price);
    const carName = selectedOption.text.split(' - ')[0].toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    const carImage = `cars/${brand.toLowerCase()}/${brand.toLowerCase()}${carName}.jpg`;
    imageElement.src = carImage;
    imageElement.onerror = function() {
      this.src = `https://via.placeholder.com/300x200?text=${selectedOption.text.split(' - ')[0]}`;
    };
    priceDisplay.innerHTML = `
      <div class="car-price-label">Price</div>
      ₹${price.toLocaleString()}/day
    `;
  } else {
    const brandLogo = `cars/brandLogos/${brand.toLowerCase()}.png`;
    imageElement.src = brandLogo;
    imageElement.onerror = function() {
      this.src = `https://via.placeholder.com/300x200?text=${brand}`;
    };
    const allCars = Array.from(modelSelect.options).slice(1).map(opt => parseFloat(opt.dataset.price));
    const lowestPrice = Math.min(...allCars);
    priceDisplay.innerHTML = `
      <div class="car-price-label">Starting from</div>
      ₹${lowestPrice.toLocaleString()}/day
    `;
  }
}

function selectBrandModel(brand) {
  const modelSelect = document.getElementById(`model-${brand}`);
  const selectedCarId = modelSelect.value;
  
  if (!selectedCarId) {
    showModal('Select Model', 'Please select a model first', 'warning');
    return;
  }
  
  localStorage.setItem('selectedBrand', brand);
  window.location.href = "booking.html";
}

// ---------- DATE LIMITS ----------
if (startDateInput) {
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  startDateInput.value = today;
  endDateInput.min = today;
  endDateInput.value = today;
}

// ---------- BOOKING SUMMARY ----------
function updateBookingSummary() {
  if (!selectedCarEl || !startDateInput || !endDateInput) return;

  const selectedCarId = selectedCarEl.value;
  const car = bookingPageCars.find(c => c.id == selectedCarId);
  const summaryVehicle = document.getElementById("summaryVehicle");
  const summaryDays = document.getElementById("summaryDays");
  const summaryTotal = document.getElementById("summaryTotal");

  if (!car) return;

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  const total = days * car.price_per_day;

  if (summaryVehicle) summaryVehicle.textContent = car.model;
  if (summaryDays) summaryDays.textContent = `${days} day${days > 1 ? 's' : ''}`;
  if (summaryTotal) summaryTotal.textContent = `₹${total.toLocaleString()}`;
}

if (selectedCarEl) selectedCarEl.addEventListener("change", updateBookingSummary);
if (selectedBrandEl) selectedBrandEl.addEventListener("change", updateBookingSummary);
if (startDateInput) startDateInput.addEventListener("change", updateBookingSummary);
if (endDateInput) endDateInput.addEventListener("change", updateBookingSummary);

// ---------- BOOKING FORM SUBMIT ----------
if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const carId = selectedCarEl.value;
    const car = bookingPageCars.find(c => c.id == carId);
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!name || !email || !age || !selectedBrandEl.value || !carId || !startDate || !endDate) {
      showModal('Missing Information', 'Please fill all fields', 'error');
      return;
    }

    if (age < 18 || age > 60) {
      showModal('Age Restriction', 'Age must be between 18 and 60 to rent a car!', 'error');
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (endDateObj < startDateObj) {
      showModal('Invalid Dates', 'Return date must be after pickup date', 'error');
      return;
    }

    const days = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = days * car.price_per_day;

    localStorage.setItem("booking", JSON.stringify({ 
      id: Date.now(),
      name,
      email,
      age,
      carName: car.model,
      carId: car.id,
      startDate,
      endDate,
      days,
      totalAmount,
      bookingDate: new Date().toISOString()
    }));

    showModal('Booking Saved', 'Proceeding to payment...', 'success');
    setTimeout(() => {
      window.location.href = "payment.html";
    }, 1500);
  });
}

// ---------- USER NAVBAR / LOGOUT ----------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to logout?")) {
      await window.supabase.auth.signOut();
      window.location.href = "login.html";
    }
  });
}

const userName = document.getElementById("userName");
if (userName) {
  window.supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      const displayName = user.user_metadata?.full_name || user.email.split('@')[0];
      userName.textContent = `👤 ${displayName}`;
    }
  });
}

// ---------- PAYMENT ----------
const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
  const booking = JSON.parse(localStorage.getItem("booking"));

  if (!booking) {
    showModal('No Booking Found', 'Please complete booking first!', 'error');
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } else {
    const bookingDetails = document.getElementById("bookingDetails");
    if (bookingDetails) {
      bookingDetails.innerHTML = `
        <div class="booking-detail">
          <span>Vehicle:</span>
          <strong>${booking.carName}</strong>
        </div>
        <div class="booking-detail">
          <span>Duration:</span>
          <strong>${booking.days} days</strong>
        </div>
        <div class="booking-detail">
          <span>Total Amount:</span>
          <strong style="color: var(--primary); font-size: 20px;">₹${booking.totalAmount.toLocaleString()}</strong>
        </div>
      `;
    }
  }

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const paymentMsg = document.getElementById("paymentMsg");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');
    
    const { data: { user } } = await window.supabase.auth.getUser();

    if (!user) {
        showModal('Login Required', 'You must be logged in to make a payment!', 'error');
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    const bookingData = {
      user_id: user.id,
      car_id: booking.carId,
      customer_name: booking.name,
      customer_email: booking.email,
      customer_age: booking.age,
      start_date: booking.startDate,
      end_date: booking.endDate,
      total_days: booking.days,
      total_amount: booking.totalAmount,
      status: 'confirmed'
    };

    const result = await saveBookingToSupabase(bookingData);

    if (result.success) {
      // Mark car as not available after successful payment
      const { error: carUpdateError } = await window.supabase
        .from('cars')
        .update({ is_available: false })
        .eq('id', booking.carId);
      
      if (carUpdateError) {
        console.error('Error updating car availability:', carUpdateError);
      } else {
        console.log('Car marked as unavailable:', booking.carId);
      }

      showModal(
        'Booking Confirmed',
        `🚗 Vehicle: ${booking.carName}\n📅 Duration: ${booking.days} days\n💰 Amount Paid: ₹${booking.totalAmount.toLocaleString()}\n\n📧 Confirmation sent to ${booking.email}`,
        'success'
      );

      setTimeout(() => {
        localStorage.removeItem("booking");
        window.location.href = "index.html";
      }, 2000);
    } else {
      showModal('Payment Failed', 'Please try again.', 'error');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });
}

// ---------- LOAD VEHICLES / BOOKING PAGE INITIALISATION ----------
document.addEventListener('DOMContentLoaded', async function() {
  const selectedBrandEl = document.getElementById('selectedBrand');
  const selectedCarEl = document.getElementById('selectedCar');
  const carListEl = document.getElementById('carList');
  
  // --------- HOME PAGE CAR LISTING ---------
  if (carListEl) {
    try {
      const { data: allCars, error } = await window.supabase.from('cars').select('*');
      
      if (error || !allCars || allCars.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        return;
      }

      // Use only available cars for listing
      const onlyAvailableCars = allCars.filter(
        car => car.is_available === true || car.is_available === 'true'
      );
      
      let filteredCars = onlyAvailableCars;
      const categoryFilter = document.getElementById('categoryFilter');
      const priceFilter = document.getElementById('priceFilter');
      const searchCar = document.getElementById('searchCar');
      const resetFilters = document.getElementById('resetFilters');
      const noResults = document.getElementById('noResults');
      
      function displayCars() {
        carListEl.innerHTML = '';
        
        if (filteredCars.length === 0) {
          noResults.style.display = 'block';
          return;
        }
        
        noResults.style.display = 'none';
        
        const brandData = new Map();
        filteredCars.forEach(car => {
          const brand = car.model.split(' ')[0];
          if (!brandData.has(brand)) {
            brandData.set(brand, { brand, lowestPrice: car.price_per_day, models: [] });
          }
          const data = brandData.get(brand);
          if (car.price_per_day < data.lowestPrice) data.lowestPrice = car.price_per_day;
          data.models.push(car);
        });
        
        brandData.forEach((data) => {
          const div = document.createElement('div');
          div.classList.add('car-card');
          div.id = `brand-${data.brand}`;
          const brandLogo = `cars/brandLogos/${data.brand.toLowerCase()}.png`;
          div.innerHTML = `
            <div class="car-image">
              <img src="${brandLogo}" alt="${data.brand}" onerror="this.src='https://via.placeholder.com/300x200?text=${data.brand}'">
            </div>
            <div class="car-info">
              <h3 class="car-name">${data.brand}</h3>
              <div class="car-price" id="price-${data.brand}">
                <div class="car-price-label">Starting from</div>
                ₹${data.lowestPrice.toLocaleString()}/day
              </div>
              <div class="model-selection">
                <select class="model-select" id="model-${data.brand}" onchange="updatePrice('${data.brand}')">
                  <option value="">Select Model</option>
                  ${data.models
                    .sort((a, b) => a.price_per_day - b.price_per_day)
                    .map(car => `<option value="${car.id}" data-price="${car.price_per_day}">${car.model.replace(data.brand + ' ', '')} - ₹${car.price_per_day.toLocaleString()}/day</option>`)
                    .join('')}
                </select>
              </div>
              <button class="btn-select" onclick="selectBrandModel('${data.brand}')">Book Now</button>
            </div>
          `;
          carListEl.appendChild(div);
        });
      }
      
      function filterCars() {
        filteredCars = onlyAvailableCars.filter(car => {
          const categoryMatch = categoryFilter.value === 'all' || car.category === categoryFilter.value;
          const searchMatch = searchCar.value === '' || car.model.toLowerCase().includes(searchCar.value.toLowerCase());
          let priceMatch = true;
          
          if (priceFilter.value === 'low') priceMatch = car.price_per_day < 2000;
          else if (priceFilter.value === 'medium') priceMatch = car.price_per_day >= 2000 && car.price_per_day <= 4000;
          else if (priceFilter.value === 'high') priceMatch = car.price_per_day > 4000;
          
          return categoryMatch && searchMatch && priceMatch;
        });
        displayCars();
      }
      
      categoryFilter.addEventListener('change', filterCars);
      priceFilter.addEventListener('change', filterCars);
      searchCar.addEventListener('input', filterCars);
      resetFilters.addEventListener('click', () => {
        categoryFilter.value = 'all';
        priceFilter.value = 'all';
        searchCar.value = '';
        filterCars();
      });
      
      displayCars();
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }
  
  // --------- BOOKING PAGE DROPDOWNS ---------
  if (selectedBrandEl && selectedCarEl) {
    try {
      const { data: allCars, error } = await window.supabase.from('cars').select('*');
      
      if (error || !allCars || allCars.length === 0) return;
      
      // Only cars that are available
      const availableCars = allCars.filter(
        car => car.is_available === true || car.is_available === 'true'
      );

      bookingPageCars = availableCars;
      const brands = [...new Set(availableCars.map(car => car.model.split(' ')[0]))];
      
      brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        selectedBrandEl.appendChild(option);
      });
      
      selectedBrandEl.addEventListener('change', () => {
        const brand = selectedBrandEl.value;
        selectedCarEl.innerHTML = `<option value=''>Choose your ${brand} car...</option>`;
        
        if (brand) {
          selectedCarEl.disabled = false;
          const brandCars = availableCars.filter(car => car.model.startsWith(brand));
          
          brandCars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `${car.model} - ₹${car.price_per_day}/day`;
            selectedCarEl.appendChild(option);
          });
        } else {
          selectedCarEl.disabled = true;
        }
      });
      
      const savedBrand = localStorage.getItem('selectedBrand');
      const savedCar = JSON.parse(localStorage.getItem('selectedCar') || '{}');
      
      if (savedBrand) {
        selectedBrandEl.value = savedBrand;
        selectedBrandEl.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          if (savedCar.id) {
            selectedCarEl.value = savedCar.id;
            updateBookingSummary();
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error initializing booking page:', error);
    }
  }
});

// ---------- LOGIN PAGE ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const togglePassword = document.getElementById('togglePassword');
  const loginPassword = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = document.getElementById('btnLoader');
  const loginMsg = document.getElementById('loginMsg');

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      loginPassword.type = loginPassword.type === 'password' ? 'text' : 'password';
    });
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      loginMsg.textContent = '❌ Please fill all fields';
      loginMsg.className = 'message show error';
      return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });

      if (error) {
        loginMsg.textContent = `❌ ${error.message}`;
        loginMsg.className = 'message show error';
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        return;
      }

      if (data.session) {
        localStorage.setItem('supabase_user', JSON.stringify(data.user));
        localStorage.setItem('supabase_token', data.session.access_token);
        
        loginMsg.textContent = '✅ Login successful!';
        loginMsg.className = 'message show success';
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } catch (error) {
      loginMsg.textContent = '❌ Login failed. Please try again.';
      loginMsg.className = 'message show error';
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });
}

// ---------- GENERIC RETURN CAR HELPER (NOT USED ON ADMIN PAGE BUT OK TO KEEP) ----------
async function returnCar(bookingId) {
  try {
    const { data: booking, error: bookingError } = await window.supabase
      .from('bookings')
      .select('car_id')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;

    const { error: updateError } = await window.supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    const { error: carError } = await window.supabase
      .from('cars')
      .update({ is_available: true })
      .eq('id', booking.car_id);

    if (carError) throw carError;

    return { success: true };
  } catch (error) {
    console.error('Error returning car:', error);
    return { success: false, error };
  }
}
// ===== HAMBURGER MENU =====
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navActions = document.getElementById('navActions');
  
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      hamburgerBtn.classList.toggle('active');
      
      if (navMenu) {
        navMenu.classList.toggle('active');
      }
      
      if (navActions) {
        navActions.classList.toggle('active');
      }
    });
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerBtn.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        if (navActions) navActions.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.navbar')) {
        hamburgerBtn.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        if (navActions) navActions.classList.remove('active');
      }
    });
  }
});