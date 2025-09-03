//==========================//
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);
const on = (el, evt, cb) => el && el.addEventListener(evt, cb);
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;


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
  Apple: { "iPhone 12": 25000, "iPhone 13": 40000, "iPhone 11 Pro Max": 33900,"iPhone 17 Pro Max": 125000, "iPhone 17 Pro": 115000,"iPhone 17": 105000,
  "iPhone 16 Pro Max": 115000,"iPhone 16 Pro": 100000,
  "iPhone 16": 90000,"iPhone 15 Pro Max": 95000,"iPhone 15 Pro": 85000,"iPhone 15": 75000,
  "iPhone 14 Pro": 65000 },
  Samsung: { "Galaxy S21": 22000, "Galaxy S22": 35000, "Galaxy M31": 20041 ,"Galaxy S25 Ultra": 110000,
  "Galaxy S25+": 95000,"Galaxy S25": 85000,
  "Galaxy S24 Ultra": 100000,"Galaxy S24+": 90000,
  "Galaxy S24": 80000,"Galaxy Z Fold 6": 140000,
  "Galaxy Z Flip 6": 100000,"Galaxy A55": 35000,
  "Galaxy M55": 28000},
  OnePlus: { "OnePlus 9": 20000, "OnePlus 12R": 50000,
  "OnePlus 12": 65000, "OnePlus 11R": 42000,
  "OnePlus 11": 55000,"OnePlus 10 Pro": 48000,
  "OnePlus 10R": 40000,"OnePlus 9 Pro": 35000,
  "OnePlus 9R": 28000, "OnePlus Nord 3": 30000,
  "OnePlus Nord CE 3": 25000 },
  Motorola: { "Moto G8": 10000, "Moto G45": 20000 ,"Motorola Edge 50 Ultra": 70000,
  "Motorola Edge 50 Pro": 55000, "Motorola Edge 50": 40000, "Moto G100": 35000,"Moto G85": 28000,
  "Moto G73": 22000,"Moto G62": 18000,"Moto G54": 15000,
  "Moto E40": 12000,"Moto E13": 8000},
  Oppo: { "Oppo A52": 22000, "Oppo F27 Pro": 18500 ,"Oppo Find X7 Ultra": 95000,"Oppo Find X7": 80000,
  "Oppo Find N3 Flip": 90000,"Oppo Reno 11 Pro": 55000,
  "Oppo Reno 11": 45000,"Oppo Reno 10 Pro+": 50000,
  "Oppo Reno 10": 35000,"Oppo A98": 30000,
  "Oppo A78": 22000,"Oppo A58": 18000},
  Vivo: { "Vivo V11 Pro": 20000, "Vivo V9 Pro": 32000, "Vivo V15": 26990,"Vivo X100 Ultra": 95000,
  "Vivo X100 Pro": 85000,"Vivo X100": 75000,
  "Vivo X90 Pro+": 70000,"Vivo V30 Pro": 45000,
  "Vivo V30": 38000,"Vivo V29 Pro": 35000,
    "Vivo V29": 30000,
    "Vivo Y200": 22000,
    "Vivo Y100": 18000 },
};
// ==============================
// Issue Label Mapping
// ==============================
const issueLabels = {
  touch: "Touch not responsive",
  cracks: "Cracks / scratches on glass",
  clarity: "Display clarity issues",
  brightness: "Brightness & color issues",
  burnin: "Screen burn-in",
  lifted: "Screen lifted",
  ambient: "Ambient sensor faulty",
  dents: "Dents or bends",
  scratches: "Deep scratches",
  corners: "Corners chipped",
  gaps: "Loose frame",
  backpanel: "Back panel cracked",
  power: "Power button faulty",
  volume: "Volume buttons faulty",
  mute: "Mute switch faulty",
  charging: "Charging port issue",
  headphone: "Headphone jack faulty",
  simtray: "SIM tray damaged",
  loudspeaker: "Loudspeaker faulty",
  earpiece: "Earpiece faulty",
  mic: "Mic faulty",
  distortion: "Distortion / crackling",
  focus: "Camera focus issue",
  lens: "Lens cracked / dusty",
  flash: "Flash not working",
  wifi: "Wi-Fi faulty",
  bt: "Bluetooth faulty",
  fingerprint: "Fingerprint / Face ID faulty",
  proximity: "Proximity sensor faulty",
  gyro: "Gyroscope faulty",
  chargingok: "Charging issue",
  noheat: "Overheating",
  batteryhealth: "Poor battery health",
  poweronoff: "Power on/off issue",
  notlocked: "Apple/Google lock",
  reset: "Factory reset not done",
  imeiok: "Blacklisted IMEI",
  box: "No original box",
  charger: "No charger",
  cable: "No cable",
  headphones: "No headphones",
  simtool: "No SIM ejector",
  case: "No case",
  protector: "No screen protector",
  thirdparty: "Only third-party accessories",
  imeimatch: "Box IMEI mismatch",
  receipt: "No purchase receipt",
  purchasedate: "Purchase date unclear",
  underwarranty: "Out of warranty",
  extended: "No extended warranty",
  warrantycheck: "Warranty not verified",
  accountmatch: "Account mismatch",
  restrictions: "Carrier lock",
  invoice: "No invoice",
  imei: "IMEI not verified",
  warrantystatus: "No warranty",
  applecare: "No AppleCare",
  activationdate: "Activation date unknown",
  age: "Device too old (5+ yrs)",
  brandcheck: "No brand verification",
  builddate: "Manufacturing date unclear"
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
// Offer Calculation (with depreciation)
// ==============================
function calculateOffer() {
  // condition
  const checked = qs('input[name="condition"]:checked');
  state.condition = checked ? checked.value : "excellent";

  // base price for selected model
  let base = data[state.selectedBrand][state.selectedModel];

  // Adjust base by condition %
  if (state.condition === "good") base *= 0.8;
  if (state.condition === "fair") base *= 0.6;

  // Depreciation from checklist
  let deductions = 0;
  const selectedIssues = [];
  qsa('.diagnostic-checklist input[type="checkbox"]:checked').forEach(cb => {
    const value = cb.value;
    const deduction = parseInt(cb.dataset.deduction || "0", 10);
    deductions += deduction;
    selectedIssues.push(value);
  });

  // Save issues
  state.issues = selectedIssues;

  // Apply deductions
  let finalPrice = base - deductions;

  // Minimum guaranteed offer
  if (finalPrice < 500) finalPrice = 500;

  // Save and update state
  state.offer = Math.round(finalPrice);

  // Update UI
  qs("#offerTitle").textContent = `${state.selectedBrand} ${state.selectedModel} (${capitalize(state.condition)})`;
  qs("#offerAmount").textContent = state.offer.toString();

  // Switch steps
  qs('[data-step="2"]').classList.add("hidden");
  qs('[data-step="3"]').classList.remove("hidden");

  // ensure button label is default
  const addToCartBtn = qs("#addToCartBtn");
  addToCartBtn.textContent = "Add to cart";
  delete addToCartBtn.dataset.mode;

  // Scroll into view
  qs('[data-step="3"]').scrollIntoView({ behavior: "smooth", block: "center" });
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

    // Reset selections
    qs("#brandSelect").value = "";
    qs("#modelSelect").innerHTML = `<option value="">Select model</option>`;
    state = { selectedBrand: null, selectedModel: null, condition: "excellent", issues: [], offer: 0 };

    // Reset button
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
    issues: state.issues,
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
        ${item.issues && item.issues.length ? 
          `<small class="muted">Issues: ${item.issues.join(", ")}</small>` : ""}
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
    const fd = new FormData(form);
    if (![...fd.values()].every(v => String(v).trim().length)) {
      alert("Please complete all fields.");
      return;
    }
    modal.classList.add("hidden");
    qs("#paymentModal").classList.remove("hidden");

    const firstPayment = qs('#paymentModal input[name="payment"]');
    if (firstPayment) {
      setTimeout(() => firstPayment.focus({ preventScroll: true }), 300);
    }
  });

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
          form.requestSubmit();
        }
      }
    });
  });

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

const paymentModal = qs("#paymentModal");
  const closePayment = qs("#closePayment");
  const confirmPaymentBtn = qs("#confirmPaymentBtn");
  const successModal = qs("#successModal");
  const closeSuccess = qs("#closeSuccess");
  const goHomeBtn = qs("#goHomeBtn");
  const cartDrawer = qs("#cartDrawer"); // ✅ reference cart drawer

  // Close payment modal
  on(closePayment, "click", () => paymentModal.classList.add("hidden"));

  // Confirm payment
  on(confirmPaymentBtn, "click", () => {
    paymentModal.classList.add("hidden");
    successModal.classList.remove("hidden");

    // ✅ Clear cart + close cart drawer
    cart = [];
    renderCart();
    cartDrawer.classList.remove("open");
  });

  // Close success modal
  on(closeSuccess, "click", () => {
    successModal.classList.add("hidden");
    cartDrawer.classList.remove("open"); // ✅ make sure cart is closed
    document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
  });

  // Go to Home
  on(goHomeBtn, "click", () => {
    successModal.classList.add("hidden");
    cartDrawer.classList.remove("open"); // ✅ make sure cart is closed
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

  qs("#year").textContent = new Date().getFullYear().toString();

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
          modelSelect.click();
        }
      }, 600);
    });
  });

  on(qs("#addToCartBtn"), "click", addToCart);
}

document.addEventListener("DOMContentLoaded", init);
