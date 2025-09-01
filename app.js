// ==============================
// Helpers
// ==============================
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);
const on = (el, evt, cb) => el && el.addEventListener(evt, cb);
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// ==============================
// State
// ==============================
let state = {
  selectedBrand: null,
  selectedModel: null,
  condition: "excellent",
  issues: [],
  offer: 0,
};
let cart = [];

// ==============================
// Data (sample pricing)
// ==============================
const data = {
  Apple: { "iPhone 12": 25000, "iPhone 13": 40000, "iPhone 11 Pro Max": 33900 },
  Samsung: { "Galaxy S21": 22000, "Galaxy S22": 35000, "Galaxy M31": 20041 },
  OnePlus: { "OnePlus 9": 20000, "OnePlus 10": 32000 },
  Motorola: { "Moto G8": 10000, "Moto G45": 20000 },
  Oppo: { "Oppo A52": 22000, "Oppo F27 Pro": 18500 },
  Vivo: { "Vivo V11 Pro": 20000, "Vivo V9 Pro": 32000, "Vivo V15": 26990 },
};

// ==============================
// Brands & Models
// ==============================
function setupBrands() {
  const brandSelect = qs("#brandSelect");
  const modelSelect = qs("#modelSelect");
  const brandList = qs("#brandList");

  // Brand dropdown
  brandSelect.innerHTML = `<option value="">Select brand</option>`;
  Object.keys(data).forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);

    // Brand pills
    const card = document.createElement("button");
    card.className = "brand-card";
    card.type = "button";
    card.textContent = brand;
    card.setAttribute("role", "listitem");
    card.addEventListener("click", () => {
      state.selectedBrand = brand;
      brandSelect.value = brand;
      populateModels();
      document.querySelector('[data-step="1"]').scrollIntoView({ behavior: "smooth" });
      modelSelect.focus({ preventScroll: true });
    });
    brandList.appendChild(card);
  });

  on(brandSelect, "change", () => {
    state.selectedBrand = brandSelect.value || null;
    populateModels();
    if (state.selectedBrand) modelSelect.focus({ preventScroll: true });
  });

  function populateModels() {
    modelSelect.innerHTML = `<option value="">Select model</option>`;
    state.selectedModel = null;
    if (!state.selectedBrand) return;
    Object.keys(data[state.selectedBrand]).forEach((model) => {
      const opt = document.createElement("option");
      opt.value = model;
      opt.textContent = model;
      modelSelect.appendChild(opt);
    });
  }

  on(modelSelect, "change", () => {
    state.selectedModel = modelSelect.value || null;
  });
}

// ==============================
// Search Models
// ==============================
function setupSearch() {
  const searchInput = qs("#searchInput");
  const cards = qs("#modelCards");

  on(searchInput, "input", () => {
    const val = searchInput.value.trim().toLowerCase();
    cards.innerHTML = "";
    if (val.length < 2) return;

    Object.entries(data).forEach(([brand, models]) => {
      Object.keys(models).forEach((m) => {
        if (m.toLowerCase().includes(val)) {
          const card = document.createElement("button");
          card.className = "model-card";
          card.type = "button";
          card.setAttribute("role", "listitem");
          card.textContent = `${brand} ${m}`;
          card.addEventListener("click", () => {
            state.selectedBrand = brand;
            state.selectedModel = m;
            qs("#brandSelect").value = brand;
            const ms = qs("#modelSelect");
            ms.innerHTML = `<option value="${m}">${m}</option>`;
            qs('[data-step="1"]').scrollIntoView({ behavior: "smooth" });
            ms.focus({ preventScroll: true });
          });
          cards.appendChild(card);
        }
      });
    });
  });
}

// ==============================
// Wizard Navigation
// ==============================
function setupWizard() {
  const step1 = qs('[data-step="1"]');
  const step2 = qs('[data-step="2"]');
  const step3 = qs('[data-step="3"]');

  on(qs("#toStep2"), "click", () => {
    if (!state.selectedBrand || !state.selectedModel) {
      alert("Please select a brand and model");
      return;
    }
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
    qs('[name="condition"][value="excellent"]').focus({ preventScroll: true });
  });

  on(qs("#backTo1"), "click", () => {
    step2.classList.add("hidden");
    step1.classList.remove("hidden");
    qs("#modelSelect").focus({ preventScroll: true });
  });

  on(qs("#calcPriceBtn"), "click", calculateOffer);

  on(qs("#backTo2"), "click", () => {
    step3.classList.add("hidden");
    step2.classList.remove("hidden");
  });
}

// ==============================
// Offer Calculation
// ==============================
function calculateOffer() {
  // condition
  const checked = qs('input[name="condition"]:checked');
  state.condition = checked ? checked.value : "excellent";

  // issues
  state.issues = Array.from(qsa('details input[type="checkbox"]:checked')).map(c => c.value);

  let base = data[state.selectedBrand][state.selectedModel];
  if (state.condition === "good") base *= 0.8;
  if (state.condition === "fair") base *= 0.6;
  if (state.issues.length) base *= 0.85;

  state.offer = Math.round(base);

  qs("#offerTitle").textContent = `${state.selectedBrand} ${state.selectedModel} (${capitalize(state.condition)})`;
  qs("#offerAmount").textContent = state.offer.toString();

  qs('[data-step="2"]').classList.add("hidden");
  qs('[data-step="3"]').classList.remove("hidden");

  // ensure the CTA is in view
  qs('[data-step="3"]').scrollIntoView({ behavior: "smooth", block: "center" });

  // ensure button label is default
  const addToCartBtn = qs("#addToCartBtn");
  addToCartBtn.textContent = "Add to cart";
  delete addToCartBtn.dataset.mode;
}

// ==============================
// Cart Management
// ==============================
function addToCart() {
  const addToCartBtn = qs("#addToCartBtn");

  // If already in "Add more items" mode
  if (addToCartBtn.dataset.mode === "more") {
    // Go to hero/home and reset wizard to step 1
    document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
    qs('[data-step="3"]').classList.add("hidden");
    qs('[data-step="1"]').classList.remove("hidden");

    // Reset selections for clarity
    qs("#brandSelect").value = "";
    qs("#modelSelect").innerHTML = `<option value="">Select model</option>`;
    state = { selectedBrand: null, selectedModel: null, condition: "excellent", issues: [], offer: 0 };

    // Reset button back to default
    addToCartBtn.textContent = "Add to cart";
    delete addToCartBtn.dataset.mode;

    return;
  }

  // Normal add to cart flow
  if (!state.offer || !state.selectedModel) {
    alert("Please calculate price first!");
    return;
  }

  cart.push({
    brand: state.selectedBrand,
    model: state.selectedModel,
    condition: state.condition,
    price: state.offer,
  });

  renderCart();
  qs("#cartDrawer").classList.add("open");

  // Switch button to "Add more items"
  addToCartBtn.textContent = "Add more items";
  addToCartBtn.dataset.mode = "more";
}

function renderCart() {
  const itemsEl = qs("#cartItems");
  const totalEl = qs("#cartTotal");
  const countEl = qs("#cartCount");

  itemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <strong>${item.brand} ${item.model}</strong>
        <p class="muted">${capitalize(item.condition)}</p>
      </div>
      <div>₹ ${item.price}</div>
    `;
    itemsEl.appendChild(div);
  });

  totalEl.textContent = total.toString();
  countEl.textContent = cart.length.toString();
}

function setupCart() {
  const drawer = qs("#cartDrawer");
  on(qs("#cartBtn"), "click", () => drawer.classList.add("open"));
  on(qs("#closeCart"), "click", () => drawer.classList.remove("open"));
}

// ==============================
// Checkout & Payment
// ==============================
function setupCheckout() {
  const modal = qs("#checkoutModal");
  const form = qs("#checkoutForm");

  // Open checkout modal
  on(qs("#checkoutBtn"), "click", () => {
    modal.classList.remove("hidden");

    // Focus the first input (Full name)
    const firstInput = form.querySelector('input[name="name"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus({ preventScroll: true }), 300);
    }
  });

  // Close checkout modal
  on(qs("#closeModal"), "click", () => modal.classList.add("hidden"));

  // Handle form submit
  on(form, "submit", (e) => {
    e.preventDefault();

    // Simple front-end validation
    const fd = new FormData(form);
    if (![...fd.values()].every(v => String(v).trim().length)) {
      alert("Please complete all fields.");
      return;
    }

    // Hide checkout modal & show payment modal
    modal.classList.add("hidden");
    qs("#paymentModal").classList.remove("hidden");

    // Focus first payment option (Cash on Delivery)
    const firstPayment = qs('#paymentModal input[name="payment"]');
    if (firstPayment) {
      setTimeout(() => firstPayment.focus({ preventScroll: true }), 300);
    }
  });

  // Auto jump to next field on Enter
  const inputs = [
    form.querySelector('input[name="name"]'),
    form.querySelector('input[name="phone"]'),
    form.querySelector('textarea[name="address"]'),
    form.querySelector('input[name="date"]')
  ];

  inputs.forEach((input, idx) => {
    if (!input) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = inputs[idx + 1];
        if (next) {
          next.focus({ preventScroll: true });
        } else {
          // Last field: trigger form submit
          form.requestSubmit();
        }
      }
    });
  });

  // Auto-submit payment modal on Enter
  const paymentModal = qs("#paymentModal");
  const confirmPaymentBtn = qs("#confirmPaymentBtn");

  if (paymentModal && confirmPaymentBtn) {
    paymentModal.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmPaymentBtn.click();
      }
    });
  }
}


function setupPayment() {
  const paymentModal = qs("#paymentModal");
  const closePayment = qs("#closePayment");
  const confirmPaymentBtn = qs("#confirmPaymentBtn");
  const successModal = qs("#successModal");
  const closeSuccess = qs("#closeSuccess");
  const goHomeBtn = qs("#goHomeBtn");

  // Close payment modal
  on(closePayment, "click", () => paymentModal.classList.add("hidden"));

  // Confirm payment
  on(confirmPaymentBtn, "click", () => {
    paymentModal.classList.add("hidden");

    // Show success modal instead of alert
    successModal.classList.remove("hidden");

    // Focus the close button for accessibility
    setTimeout(() => closeSuccess.focus({ preventScroll: true }), 300);

    // Clear cart
    cart = [];
    renderCart();
  });

  // Close success modal
  on(closeSuccess, "click", () => {
    successModal.classList.add("hidden");
    document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
  });

  // Go to Home
  on(goHomeBtn, "click", () => {
    successModal.classList.add("hidden");
    document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
  });
}


// ==============================
// Device Detection
// ==============================
function detectDevice() {
  const btn = qs("#detectDeviceBtn");
  const result = qs("#detectResult");
  on(btn, "click", () => {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) {
      result.textContent = "We detected: Apple iPhone";
    } else if (/Samsung/i.test(ua) || /SM-|Galaxy/i.test(ua)) {
      result.textContent = "We detected: Samsung device";
    } else {
      result.textContent = "Sorry, we couldn’t auto-detect your phone.";
    }
  });
}

// ==============================
// Init
// ==============================
function init() {
  setupBrands();
  setupSearch();
  setupWizard();
  setupCart();
  setupCheckout();
  setupPayment();
  detectDevice();

  // Set year
  qs("#year").textContent = new Date().getFullYear().toString();

  // Smooth scroll + focus when clicking "Sell now" or "Get instant quote"
  const sellLinks = document.querySelectorAll('a[href="#sell"], .btn[href="#sell"]');
  const sellSection = qs("#sell");
  const modelSelect = qs("#modelSelect");

  sellLinks.forEach((link) => {
    on(link, "click", (e) => {
      e.preventDefault();
      sellSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        if (modelSelect) {
          modelSelect.focus({ preventScroll: true });
          modelSelect.click(); // auto-open dropdown
        }
      }, 600);
    });
  });

  // Hook Add to Cart button
  on(qs("#addToCartBtn"), "click", addToCart);
}

document.addEventListener("DOMContentLoaded", init);

