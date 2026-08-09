// ============ CONFIG ============
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzIKCFG-GN1LHVZP2ZwzwxYCfz9wwToj0QyXaz-FGuibBOkgdQnVHNnwivzhm35u39s/exec";

// Seller's WhatsApp number, digits only, with country code (no + or spaces). e.g. 91 for India.
// Replace with the real seller number before going live with an actual client.
const SELLER_WHATSAPP_NUMBER = "911234567890";

let selectedProduct = null;
let allProducts = [];

// Fallback color-swatch gradients — used until a real photo (Image column) exists for a product
const SWATCH_MAP = {
  "red": "linear-gradient(150deg, #A61E2E 0%, #6E1423 100%)",
  "green": "linear-gradient(150deg, #2F6B57 0%, #1F4B43 100%)",
  "ivory": "linear-gradient(150deg, #D8C89A 0%, #B8860B 100%)",
  "mustard": "linear-gradient(150deg, #D9A227 0%, #A9760F 100%)",
  "blue": "linear-gradient(150deg, #2C4A73 0%, #1B3454 100%)",
  "pink": "linear-gradient(150deg, #C97F8A 0%, #8E4C56 100%)",
  "maroon": "linear-gradient(150deg, #7A2233 0%, #4A1219 100%)",
  "sea green": "linear-gradient(150deg, #6FA89A 0%, #3E7568 100%)",
  "champagne": "linear-gradient(150deg, #C9A96E 0%, #8A6E3D 100%)"
};
const DEFAULT_SWATCH = "linear-gradient(150deg, #B8860B 0%, #6E1423 100%)";

function swatchFor(color){
  return SWATCH_MAP[(color || "").trim().toLowerCase()] || DEFAULT_SWATCH;
}

function isInStock(val){
  return val === true || String(val).trim().toUpperCase() === "TRUE";
}

function timeLabel(timestamp){
  if(!timestamp) return "In today's collection";
  const then = new Date(timestamp);
  if(isNaN(then)) return "In today's collection";
  const hrs = Math.max(0, Math.floor((Date.now() - then.getTime()) / 3600000));
  if(hrs < 1) return "Just now";
  if(hrs === 1) return "Added 1 hr ago";
  if(hrs < 24) return `Added ${hrs} hrs ago`;
  return `Added ${Math.floor(hrs/24)}d ago`;
}

// Requests a smartly-cropped version of a Cloudinary image (content-aware, not just centered)
function cloudinaryCrop(url, width, height){
  if(!url.includes('/upload/')) return url; // not a Cloudinary URL, leave as-is
  return url.replace('/upload/', `/upload/c_fill,g_auto,w_${width},h_${height},q_auto,f_auto/`);
}

// Renders the product's image if a real photo URL exists, otherwise the color swatch
function visualFor(p, extraClass, width, height){
  if(p.image){
    const src = cloudinaryCrop(p.image, width, height);
    return `<img class="card-img ${extraClass}" src="${src}" alt="${p.name}">`;
  }
  return `
    <div class="card-swatch ${extraClass}" style="background:${p.swatch}">
      <span class="card-swatch-label">${p.fabric} · ${p.color}</span>
    </div>`;
}

function renderProducts(list){
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list.map(p => `
      <div class="card">
        <span class="card-badge ${p.inStock ? '' : 'sold'}">${p.inStock ? 'IN STOCK' : 'SOLD OUT'}</span>
        ${visualFor(p, p.inStock ? '' : 'sold-out', 500, 500)}
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-meta">
            <span class="tag">${p.fabric}</span>
            <span class="tag">${p.color}</span>
          </div>
          <div class="tag-divider"></div>
          <div class="card-footer">
            <span class="price">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="code">${p.code}</span>
          </div>
          <div class="added">${timeLabel(p.timestamp)}</div>
          <button class="btn" ${p.inStock ? '' : 'disabled'} onclick="handleBuyNow('${p.code}')">
            ${p.inStock ? 'Buy Now' : 'Sold Out'}
          </button>
        </div>
      </div>
    `).join('');
}

function renderFeatured(product){
  const section = document.getElementById('featured-saree');
  section.innerHTML = `
    <div class="featured-card">
      <div class="featured-visual">
        <span class="featured-label">Today's Feature</span>
        ${visualFor(product, product.inStock ? '' : 'sold-out', 800, 600)}
      </div>
      <div class="featured-text">
        <div class="featured-eyebrow">Straight From Tonight's Live</div>
        <div class="featured-name">${product.name}</div>
        <p class="featured-desc">The piece everyone asked about first. Limited to what's on hand from tonight's stream.</p>
        <div class="featured-price-row">
          <span class="featured-price">₹${product.price.toLocaleString('en-IN')}</span>
          <span class="featured-code">${product.code}</span>
        </div>
        <button class="featured-btn" ${product.inStock ? '' : 'disabled'} onclick="handleBuyNow('${product.code}')">
          ${product.inStock ? 'Buy Now on WhatsApp' : 'Sold Out'}
        </button>
      </div>
    </div>
  `;
}

function renderInstaStrip(list){
  const grid = document.getElementById('insta-grid');
  grid.innerHTML = list.slice(0,6).map(p => `
    <div class="insta-tile" style="background:${p.swatch}"></div>
  `).join('');
}

function handleBuyNow(code){
  const product = allProducts.find(p => p.code === code);
  if(!product) return;
  openOrderModal(product);
}

function openOrderModal(product){
  selectedProduct = product;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-price').textContent =
    `₹${product.price.toLocaleString('en-IN')} · ${product.code}`;
  document.getElementById('order-form').reset();
  document.getElementById('order-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal(){
  document.getElementById('order-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function submitOrder(e){
  e.preventDefault();
  if(!selectedProduct) return;

  const name = document.getElementById('order-name').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const notes = document.getElementById('order-notes').value.trim();

  const lines = [
    `Hi Aavaran! I'd like to order:`,
    ``,
    `*${selectedProduct.name}*`,
    `Code: ${selectedProduct.code}`,
    `Price: ₹${selectedProduct.price.toLocaleString('en-IN')}`,
    ``,
    `Name: ${name}`,
    `Address: ${address}`,
  ];
  if(notes){
    lines.push(`Notes: ${notes}`);
  }
  lines.push(``, `(Sent from the Aavaran website)`);

  const message = encodeURIComponent(lines.join('\n'));
  const waUrl = `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${message}`;

  window.open(waUrl, '_blank');
  closeOrderModal();
}

// Close modal on overlay click or Escape key
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('order-modal');
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) closeOrderModal();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeOrderModal();
  });
});

function showLoadError(){
  document.getElementById('product-grid').innerHTML =
    `<p style="grid-column:1/-1;text-align:center;color:var(--ink-soft);padding:30px 0;">
      Couldn't load the collection right now. Please refresh.
    </p>`;
}

async function loadProducts(){
  try{
    const res = await fetch(SHEET_API_URL);
    const rows = await res.json();

    const products = rows
      .filter(r => r.Code) // skip any blank rows
      .map(r => ({
        code: r.Code,
        name: r.Name,
        price: Number(r.Price) || 0,
        fabric: r.Fabric,
        color: r.Colour,
        image: (r.Image || "").trim(),
        inStock: isInStock(r["In stock"]),
        timestamp: r.Timestamp,
        swatch: swatchFor(r.Colour)
      }))
      .reverse(); // last row in the sheet = most recently added

    if(products.length === 0){
      showLoadError();
      return;
    }

    allProducts = products;
    const [newest, ...rest] = products;
    renderFeatured(newest);
    renderProducts(rest);
    renderInstaStrip(products);
  }catch(err){
    console.error("Failed to load products:", err);
    showLoadError();
  }
}

loadProducts();