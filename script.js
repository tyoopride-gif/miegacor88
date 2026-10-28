// Ganti nomor WhatsApp warung (format internasional, tanpa +)
var NOMOR_WA = "6281285691775";

var MENU = [
  {id:"gacor", nama:"Mie Gacor",  harga:8000, emoji:"🔥", ket:"Mie spesial pedas gurih, andalan warung", laris:true},
  {id:"pop",   nama:"Pop Mie",    harga:7000, emoji:"🍜", ket:"Cup mie instan seduh air panas, praktis"},
  {id:"soto",  nama:"Mie Soto",   harga:7000, emoji:"🍲", ket:"Kuah soto kuning hangat, taburan bawang goreng"},
  {id:"goreng",nama:"Mie Goreng", harga:7000, emoji:"🍳", ket:"Digoreng kering dengan bumbu kecap manis"}
];
var jumlah = {};
MENU.forEach(function(m){ jumlah[m.id] = 0; });

function rp(n){ return "Rp" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

function gambar(){
  var ul = document.getElementById("daftar");
  ul.innerHTML = MENU.map(function(m){
    return '<li class="item">' +
      '<div class="emoji" aria-hidden="true">' + m.emoji + '</div>' +
      '<div><h3>' + m.nama + (m.laris ? '<span class="badge">Terlaris</span>' : '') + '</h3>' +
      '<small>' + m.ket + '</small><div class="harga">' + rp(m.harga) + '</div></div>' +
      '<div class="qty">' +
        '<button type="button" data-id="' + m.id + '" data-d="-1" aria-label="Kurangi ' + m.nama + '" disabled>−</button>' +
        '<span id="q-' + m.id + '">0</span>' +
        '<button type="button" data-id="' + m.id + '" data-d="1" aria-label="Tambah ' + m.nama + '">+</button>' +
      '</div></li>';
  }).join("");
}

function hitung(){
  var porsi = 0, total = 0;
  MENU.forEach(function(m){
    var q = jumlah[m.id];
    porsi += q; total += q * m.harga;
    document.getElementById("q-" + m.id).textContent = q;
    document.querySelector('button[data-id="' + m.id + '"][data-d="-1"]').disabled = q === 0;
  });
  document.getElementById("jml").textContent = porsi + " porsi";
  document.getElementById("total").textContent = rp(total);
  document.getElementById("bar").classList.toggle("on", porsi > 0);
  return {porsi: porsi, total: total};
}

document.getElementById("daftar").addEventListener("click", function(e){
  var b = e.target.closest("button[data-id]");
  if(!b) return;
  var id = b.getAttribute("data-id"), d = parseInt(b.getAttribute("data-d"), 10);
  jumlah[id] = Math.max(0, Math.min(99, jumlah[id] + d));
  hitung();
});

document.getElementById("kirim").addEventListener("click", function(){
  var h = hitung();
  if(!h.porsi) return;
  var nama = document.getElementById("nama").value.trim();
  var hp = document.getElementById("hp").value.replace(/[\s-]/g, "");
  var err = document.getElementById("err");
  if(!nama){ err.textContent = "Isi nama dulu ya."; document.getElementById("nama").focus(); return; }
  if(!/^(\+?62|0)8\d{7,12}$/.test(hp)){ err.textContent = "No. HP belum benar. Contoh: 08123456789."; document.getElementById("hp").focus(); return; }
  err.textContent = "";
  var bayar = document.querySelector('input[name="bayar"]:checked').value;
  var catatan = document.getElementById("catatan").value.trim();
  var baris = MENU.filter(function(m){ return jumlah[m.id] > 0; })
    .map(function(m){ return "- " + m.nama + " x" + jumlah[m.id] + " = " + rp(m.harga * jumlah[m.id]); });
  var kode = "MG-" + String(Date.now()).slice(-5);
  var pesan = "Pesanan baru " + kode + ":\n" + baris.join("\n") + "\nTotal: " + rp(h.total) +
    "\n\nNama: " + nama + "\nNo. HP: " + hp + "\nPembayaran: " + bayar +
    "\nCatatan: " + (catatan || "-") + "\n\nTerima kasih!";
  var url = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan);
  window.open(url, "_blank");
  document.getElementById("kodeok").textContent = kode;
  document.getElementById("ulang").href = url;
  var ok = document.getElementById("ok");
  ok.hidden = false;
  ok.scrollIntoView({behavior: "smooth", block: "center"});
});

document.getElementById("baru").addEventListener("click", function(){
  MENU.forEach(function(m){ jumlah[m.id] = 0; });
  document.getElementById("catatan").value = "";
  document.getElementById("ok").hidden = true;
  hitung();
  document.getElementById("menu").scrollIntoView({behavior: "smooth"});
});

var HINT = {
  "Tunai (bayar di tempat)": "Bayar tunai saat pesanan diambil atau diantar.",
  "Transfer bank": "Nomor rekening akan dikirim penjual lewat WhatsApp.",
  "QRIS": "Kode QRIS akan dikirim penjual lewat WhatsApp.",
  "E-wallet (DANA/OVO/GoPay)": "Nomor e-wallet akan dikirim penjual lewat WhatsApp."
};
document.querySelectorAll('input[name="bayar"]').forEach(function(r){
  r.addEventListener("change", function(){ document.getElementById("hintbayar").textContent = HINT[r.value]; });
});

gambar();
hitung();