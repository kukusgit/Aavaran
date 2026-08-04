// Fake product data for Part 1 — will be replaced by real seller photos (via Cloudinary)
// and live Google Sheet data starting Part 4. swatch = gradient shown until a real photo exists.
const products = [
  {
    code: "AV-0114",
    name: "Vermilion Silk Saree, Stone Work",
    price: 2899,
    fabric: "Silk",
    color: "Red",
    addedHrs: 1,
    inStock: true,
    swatch: "linear-gradient(150deg, #A61E2E 0%, #6E1423 100%)"
  },
  {
    code: "AV-0113",
    name: "Emerald Georgette Kurti Set",
    price: 1599,
    fabric: "Georgette",
    color: "Green",
    addedHrs: 2,
    inStock: true,
    swatch: "linear-gradient(150deg, #2F6B57 0%, #1F4B43 100%)"
  },
  {
    code: "AV-0112",
    name: "Ivory Banarasi Saree, Gold Zari",
    price: 3499,
    fabric: "Banarasi Silk",
    color: "Ivory",
    addedHrs: 3,
    inStock: false,
    swatch: "linear-gradient(150deg, #D8C89A 0%, #B8860B 100%)"
  },
  {
    code: "AV-0111",
    name: "Mustard Cotton Anarkali",
    price: 1299,
    fabric: "Cotton",
    color: "Mustard",
    addedHrs: 5,
    inStock: true,
    swatch: "linear-gradient(150deg, #D9A227 0%, #A9760F 100%)"
  },
  {
    code: "AV-0110",
    name: "Royal Blue Chanderi Saree",
    price: 2199,
    fabric: "Chanderi",
    color: "Blue",
    addedHrs: 8,
    inStock: true,
    swatch: "linear-gradient(150deg, #2C4A73 0%, #1B3454 100%)"
  },
  {
    code: "AV-0109",
    name: "Blush Pink Embroidered Kurti",
    price: 1450,
    fabric: "Rayon",
    color: "Pink",
    addedHrs: 26,
    inStock: true,
    swatch: "linear-gradient(150deg, #C97F8A 0%, #8E4C56 100%)"
  },
  {
    code: "AV-0108",
    name: "Deep Maroon Silk Saree, Temple Border",
    price: 3199,
    fabric: "Silk",
    color: "Maroon",
    addedHrs: 30,
    inStock: true,
    swatch: "linear-gradient(150deg, #7A2233 0%, #4A1219 100%)"
  },
  {
    code: "AV-0107",
    name: "Sea Green Organza Kurti Set",
    price: 1799,
    fabric: "Organza",
    color: "Sea Green",
    addedHrs: 33,
    inStock: false,
    swatch: "linear-gradient(150deg, #6FA89A 0%, #3E7568 100%)"
  },
  {
    code: "AV-0106",
    name: "Champagne Silk Saree, Pearl Work",
    price: 3899,
    fabric: "Silk",
    color: "Champagne",
    addedHrs: 36,
    inStock: true,
    swatch: "linear-gradient(150deg, #C9A96E 0%, #8A6E3D 100%)"
  }
];

function timeLabel(hrs){
  if(hrs < 1) return "Just now";
  if(hrs === 1) return "Added 1 hr ago";
  if(hrs < 24) return `Added ${hrs} hrs ago`;
  return `Added ${Math.floor(hrs/24)}d ago`;
}

function renderProducts(list){
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list
    .map(p => `
      <div class="card">
        <span class="card-badge ${p.inStock ? '' : 'sold'}">${p.inStock ? 'IN STOCK' : 'SOLD OUT'}</span>
        <div class="card-swatch ${p.inStock ? '' : 'sold-out'}" style="background:${p.swatch}">
          <span class="card-swatch-label">${p.fabric} · ${p.color}</span>
        </div>
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
          <div class="added">${timeLabel(p.addedHrs)}</div>
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
        <div class="featured-swatch ${product.inStock ? '' : 'sold-out'}" style="background:${product.swatch}">
          <span class="card-swatch-label">${product.fabric} · ${product.color}</span>
        </div>
      </div>
      <div class="featured-text">
        <div class="featured-eyebrow">Straight From Tonight's Live</div>
        <div class="featured-name">${product.name}</div>
        <p class="featured-desc">The piece everyone asked about first — added just ${timeLabel(product.addedHrs).toLowerCase().replace('added ','')}. Limited to what's on hand from tonight's stream.</p>
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
  // Placeholder for Part 1 — WhatsApp redirect logic comes in Part 5
  alert(`Buy Now clicked for ${code}\n\n(WhatsApp order flow will be wired up in Part 5)`);
}

const sorted = products.slice().sort((a,b) => a.addedHrs - b.addedHrs); // newest first
const [newest, ...rest] = sorted;
renderFeatured(newest);
renderProducts(rest);
renderInstaStrip(sorted);