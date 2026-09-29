/* ================= EDIT THESE ================= */
const SELLER_NUMBER = "2347043420968"; // country code + number, no "+" or spaces
const STORE = "Adire & Co.";
const CURRENCY = "₦";

// image: file name inside the images/ folder. Leave it out (or "") to show a colour tile instead.
const PRODUCTS = [
  {id:1, name:"Indigo adire fabric", desc:"2 yards, hand-dyed cotton", price:12000, cat:"Textiles", color:"#1F2A5C", image:"adire-fabric.jpg"},
  {id:2, name:"Tie-dye headwrap",    desc:"Ready-tied gele style",     price:4500,  cat:"Textiles", color:"#3B5BA9", image:"headwrap.jpg"},
  {id:3, name:"Adire tote bag",      desc:"Lined, zip pocket",         price:8500,  cat:"Bags",     color:"#2C3E7A", image:"tote-bag.jpg"},
  {id:4, name:"Raffia market basket",desc:"Woven, leather handles",    price:9000,  cat:"Bags",     color:"#A8742A", image:"basket.jpg"},
  {id:5, name:"Black soap bar",      desc:"Traditional, 200g",         price:1800,  cat:"Soaps",    color:"#3A2A22", image:"black-soap.jpg"},
  {id:6, name:"Shea butter jar",     desc:"Unrefined, 250g",           price:3500,  cat:"Soaps",    color:"#B9922E", image:"shea-butter.jpg"},
  {id:7, name:"Cushion cover",       desc:"45×45cm adire print",       price:5500,  cat:"Home",     color:"#4A6FB5", image:"cushion.jpg"},
  {id:8, name:"Table runner",        desc:"Indigo, 180cm",             price:7000,  cat:"Home",     color:"#233470", image:"table-runner.jpg"}
];
const IMAGE_FOLDER = "images/";
/* ============================================== */

const $ = id => document.getElementById(id);
const fmt = n => CURRENCY + n.toLocaleString("en-NG");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let cart = {}, cat = "All";
try { cart = JSON.parse(localStorage.getItem("cart") || "{}") || {}; } catch (e) { cart = {}; }
const save = () => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {} };
const cats = ["All", ...new Set(PRODUCTS.map(p => p.cat))];

function renderChips() {
  $("chips").innerHTML = cats.map(c =>
    `<button class="chip" aria-pressed="${c === cat}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
}

function renderGrid() {
  $("grid").innerHTML = PRODUCTS.filter(p => cat === "All" || p.cat === cat).map(p => {
    const q = cart[p.id] || 0;
    const img = p.image ? `<img src="${IMAGE_FOLDER}${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : "";
    return `<article class="card">
      <div class="swatch" style="background:${p.color}"><span aria-hidden="true">${esc(p.name[0])}</span>${img}</div>
      <div class="info">
        <h3>${esc(p.name)}</h3><small>${esc(p.desc)}</small>
        <div class="price">${fmt(p.price)}</div>
        ${q
          ? `<div class="qty"><button data-d="-1" data-id="${p.id}" aria-label="Remove one ${esc(p.name)}">−</button><span>${q}</span><button data-d="1" data-id="${p.id}" aria-label="Add one ${esc(p.name)}">+</button></div>`
          : `<button class="add" data-d="1" data-id="${p.id}">Add to cart</button>`}
      </div></article>`;
  }).join("");
  // If a picture file is missing, drop it and the colour tile shows instead
  $("grid").querySelectorAll(".swatch img").forEach(im =>
    im.addEventListener("error", () => im.remove(), {once: true}));
}

const items = () => PRODUCTS.filter(p => cart[p.id]).map(p => ({...p, q: cart[p.id]}));
const total = () => items().reduce((s, i) => s + i.q * i.price, 0);

function message() {
  const n = $("name").value.trim(), a = $("addr").value.trim(), no = $("note").value.trim();
  let m = `Hello ${STORE}, I'd like to order:\n\n`;
  items().forEach(i => { m += `• ${i.q} × ${i.name} — ${fmt(i.q * i.price)}\n`; });
  m += `\nTotal: ${fmt(total())}`;
  if (n) m += `\nName: ${n}`;
  if (a) m += `\nDelivery/pickup: ${a}`;
  if (no) m += `\nNote: ${no}`;
  return m + `\n\nPlease confirm availability and payment details. Thank you!`;
}

function renderCart() {
  const it = items(), cnt = it.reduce((s, i) => s + i.q, 0);
  $("count").textContent = cnt;
  $("total").textContent = fmt(total());
  $("lines").innerHTML = it.length
    ? it.map(i => `<div class="line"><div class="n">${esc(i.name)}<small>${fmt(i.price)} each</small></div>
        <div class="qty"><button data-d="-1" data-id="${i.id}" aria-label="Remove one ${esc(i.name)}">−</button><span>${i.q}</span><button data-d="1" data-id="${i.id}" aria-label="Add one ${esc(i.name)}">+</button></div></div>`).join("")
    : `<div class="empty">Your cart is empty.<br>Add something from the catalog.</div>`;
  const s = $("send");
  s.setAttribute("aria-disabled", it.length ? "false" : "true");
  s.href = it.length ? `https://wa.me/${SELLER_NUMBER}?text=${encodeURIComponent(message())}` : "#";
}

function change(id, d) {
  const q = (cart[id] || 0) + d;
  if (q <= 0) delete cart[id]; else cart[id] = q;
  save(); renderGrid(); renderCart();
}

document.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.id) change(+b.dataset.id, +b.dataset.d);
  else if (b.dataset.c) { cat = b.dataset.c; renderChips(); renderGrid(); }
});
["name", "addr", "note"].forEach(id => $(id).addEventListener("input", renderCart));
$("open").onclick = () => $("dlg").showModal();
$("close").onclick = () => $("dlg").close();
$("dlg").addEventListener("click", e => { if (e.target === $("dlg")) $("dlg").close(); });

renderChips(); renderGrid(); renderCart();