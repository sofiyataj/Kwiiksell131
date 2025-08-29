// ==============================
// Simple Utility
// ==============================
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);
const on = (el, evt, cb) => el && el.addEventListener(evt, cb);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
// Data
// ==============================
const data = {
  Apple: { "iPhone 12": 25000, "iPhone 13": 40000 ,"iPhone 11 Pro Max":  33900},
  Samsung: { "Galaxy S21": 22000, "Galaxy S22": 35000, "GalaxyM31" : 20041},
  OnePlus: { "OnePlus 9": 20000, "OnePlus 10": 32000 },
  Motorola: { "MotoG8": 10000, "MotoG45": 20000 },
  Oppo: { "Oppo A52": 22000, "OppoF27 pro": 18500 },
  Vivo: { "Vivo V11 pro": 20000, "Vivo V9 pro": 32000, "Vivo V15": 26990 },

};

// ==============================
// Brand & Model Setup
// ==============================
function setupBrands() {
  const brandSelect = qs("#brandSelect");
  const modelSelect = qs("#modelSelect");
  const brandList = qs("#brandList");

  brandSelect.innerHTML = `<option value="">Select brand</option>`;
  Object.keys(data).forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);

    const card = document.createElement("button");
    card.className = "brand-card";
    card.textContent = brand;
    card.addEventListener("click", () => {
      state.selectedBrand = brand;
      brandSelect.value = brand;
      populateModels();
      document.querySelector('[data-step="1"]').scrollIntoView({ behavior: "smooth" });
    });
    brandList.appendChild(card);
  });

  on(brandSelect, "change", () => {
    state.selectedBrand = brandSelect.value;
    populateModels();
  });

  function populateModels() {
    modelSelect.innerHTML = `<option value="">Select model</option>`;
    if (!state.selectedBrand) return;
    Object.keys(data[state.selectedBrand]).forEach((model) => {
      const opt = document.createElement("option");
      opt.value = model;
      opt.textContent = model;
      modelSelect.appendChild(opt);
    });
  }

  on(modelSelect, "change", () => {
    state.selectedModel = modelSelect.value;
  });
}

// ==============================
// Search Models
// ==============================
function setupSearch() {
  const searchInput = qs("#searchInput");
  const cards = qs("#modelCards");

  on(searchInput, "input", () => {
    const val = searchInput.value.toLowerCase();
    cards.innerHTML = "";
    if (val.length < 2) return;

    Object.entries(data).forEach(([brand, models]) => {
      Object.keys(models).forEach((m) => {
        if (m.toLowerCase().includes(val)) {
          const card = document.createElement("button");
          card.className = "model-card";
          card.textContent = `${brand} ${m}`;
          card.addEventListener("click", () => {
            state.selectedBrand = brand;
            state.selectedModel = m;
            qs("#brandSelect").value = brand;
            qs("#modelSelect").innerHTML = `<option>${m}</option>`;
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
  });

  on(qs("#backTo1"), "click", () => {
    step2.classList.add("hidden");
    step1.classList.remove("hidden");
  });

  on(qs("#calcPriceBtn"), "click", calculateOffer);

  on(qs("#backTo2"), "click", () => {
    step3.classList.add("hidden");
    step2.classList.remove("hidden");
  });

  on(qs("#addToCartBtn"), "click", addToCart);
}

// ==============================
// Offer Calculation
// ==============================
function calculateOffer() {
  const radios = qsa('input[name="condition"]');
  radios.forEach((r) => {
    if (r.checked) state.condition = r.value;
  });

  const issues = [];
  qsa('[type="checkbox"]').forEach((c) => {
    if (c.checked) issues.push(c.value);
  });
  state.issues = issues;

  let base = data[state.selectedBrand][state.selectedModel];
  if (state.condition === "good") base *= 0.8;
  if (state.condition === "fair") base *= 0.6;
  if (issues.length) base *= 0.85;

  state.offer = Math.round(base);

  qs("#offerTitle").textContent =
    `${state.selectedBrand} ${state.selectedModel} (${capitalize(state.condition)})`;
  qs("#offerAmount").textContent = state.offer;

  qs('[data-step="2"]').classList.add("hidden");
  qs('[data-step="3"]').classList.remove("hidden");
}

// ==============================
// Cart Management
// ==============================
function addToCart() {
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

  totalEl.textContent = total;
  countEl.textContent = cart.length;
}

function setupCart() {
  const cartDrawer = qs("#cartDrawer");
  on(qs("#cartBtn"), "click", () => cartDrawer.classList.add("open"));
  on(qs("#closeCart"), "click", () => cartDrawer.classList.remove("open"));
}

// ==============================
// Checkout Modal
// ==============================
function setupCheckout() {
  const modal = qs("#checkoutModal");
  const form = qs("#checkoutForm");

  on(qs("#checkoutBtn"), "click", () => {
    modal.classList.remove("hidden");
  });
  on(qs("#closeModal"), "click", () => {
    modal.classList.add("hidden");
  });

  // Show payment modal after confirming pickup
  on(form, "submit", (e) => {
    e.preventDefault();
    modal.classList.add("hidden");
    qs("#paymentModal").classList.remove("hidden");
  });
}

// ==============================
// Payment Modal
// ==============================
function setupPayment() {
  const paymentModal = qs("#paymentModal");
  const closePayment = qs("#closePayment");
  const confirmPaymentBtn = qs("#confirmPaymentBtn");

  on(closePayment, "click", () => {
    paymentModal.classList.add("hidden");
  });

  on(confirmPaymentBtn, "click", () => {
    paymentModal.classList.add("hidden");
    alert("Payment confirmed! Your order is scheduled for pickup. Thank you.");
    cart = [];
    renderCart();
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
    if (/iPhone/.test(ua)) {
      result.textContent = "We detected: Apple iPhone";
    } else if (/Samsung/.test(ua)) {
      result.textContent = "We detected: Samsung device";
    } else {
      result.textContent = "Sorry, couldn’t auto-detect your phone.";
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
  setupPayment(); // <-- added
  detectDevice();
  qs("#year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);