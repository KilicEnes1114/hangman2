const kelimeler = [
  "kod", "html", "css", "veri", "ram", "cpu", "disk", "usb",
  "modem", "mouse", "ekran", "yazici", "sifre", "klavye", "tarayici", "sunucu",
  "program", "komut", "yazilim", "donanim", "bilgisayar", "algoritma", "android",
  "uygulama", "web", "internet", "server", "istemci", "buton", "form", "link",
  "paket", "port", "dizin", "adres", "domain", "kodlama", "robot",
  "güvenlik", "firewall", "veritabani", "piksel", "tasarim", "script", "kodcu"
];

const adamGorselleri = [
  "",
  "O",
  "O\n|",
  "O\n/|",
  "O\n/|\\",
  "O\n/|\\\n/",
  "O\n/|\\\n/ \\"
];

const harfEsleme = {
  "i": ["ı", "i"], "ı": ["ı", "i"],
  "s": ["s", "ş"], "ş": ["s", "ş"],
  "c": ["c", "ç"], "ç": ["c", "ç"],
  "g": ["g", "ğ"], "ğ": ["g", "ğ"],
  "o": ["o", "ö"], "ö": ["o", "ö"],
  "u": ["u", "ü"], "ü": ["u", "ü"]
};

const hazirIsimler = [
  "enesjk", "ByteKral", "JSReis", "Admin", "CoderBJK",
  "SiyahBeyaz", "KartalYuvasi", "Beşiktaşlı", "KodUstası", "DevAdam",
  "enesilva", "SiberKral", "TeknoReis", "SanalAdam", "GeceKartalı"
];

let secilenKelime = "";
let dogruHarfler = [];
let yanlisSayisi = 0;
let skor = 0;
let oyuncuAdi = "";
let harfAlindi = false;
let harfDegistirHak = 2;
let oncekiKelime = "";
let kelimeSayaci = 0;
const maxKelime = 3;

const kelimeDiv = document.getElementById("kelime");
const harflerDiv = document.getElementById("harfler");
const adamDiv = document.getElementById("adam");
const harfAlBtn = document.getElementById("harfAlBtn");
const harfDegistirBtn = document.getElementById("harfDegistirBtn");
const anlikSkorDiv = document.getElementById("anlikSkor");
const skorListesi = document.getElementById("skorListesi");
const kalanHakkDiv = document.getElementById("kalanHakk");
const indirmeBtn = document.getElementById("indirmeBtn");

function skorlarGetir() {
  return JSON.parse(localStorage.getItem("skorbord") || "[]");
}

async function skoruKaydetKonumlu(isim, skor) {
  const skorlar = skorlarGetir();
  const tarih = new Date().toLocaleString("tr-TR");

  let konum = null;
  if (navigator.geolocation) {
    try {
      konum = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            enlem: pos.coords.latitude.toFixed(5),
            boylam: pos.coords.longitude.toFixed(5)
          }),
          () => resolve(null),
          { timeout: 5000 }
        );
      });
    } catch {
      konum = null;
    }
  }

  const yeniSkor = { isim, skor, tarih, konum };
  skorlar.push(yeniSkor);
  skorlar.sort((a, b) => b.skor - a.skor);

  localStorage.setItem("skorbord", JSON.stringify(skorlar));
  skorbordGoster();
}

function skorbordGoster() {
  const skorlar = skorlarGetir();
  skorListesi.innerHTML = "";

  skorlar.slice(0, 10).forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1} ${s.isim} - ${s.skor} puan (${s.tarih})`;
    if (s.konum) {
      li.title = `Konum: ${s.konum.enlem}, ${s.konum.boylam}`;
    }
    skorListesi.appendChild(li);
  });
}

function baslat() {
  const input = document.getElementById("isimInput").value.trim();
  oyuncuAdi = input !== "" ? input : hazirIsimler[Math.floor(Math.random() * hazirIsimler.length)];

  skor = 0;
  kelimeSayaci = 0;
  kalanHakkGuncelle();
  yeniKelimeBaslat();
}

function yeniKelimeBaslat() {
  secilenKelime = secilenYeniKelime();
  dogruHarfler = [];
  yanlisSayisi = 0;
  harfAlindi = false;
  harfDegistirHak = 2;

  document.getElementById("baslangic").style.display = "none";
  document.getElementById("oyun").style.display = "block";

  harfAlBtn.disabled = false;
  harfAlBtn.textContent = "🪄 Harf Al (1)";
  harfDegistirBtn.disabled = false;
  harfDegistirBtn.textContent = "🔄 Harf Değiştir (2)";

  gosterKelime();
  harfleriOlustur();
  adamDiv.textContent = "";
  anlikSkorGuncelle();
  skorbordGoster();
  kalanHakkGuncelle();
}

function kalanHakkGuncelle() {
  kalanHakkDiv.textContent = `Kalan Kelime Hakkı: ${maxKelime - kelimeSayaci}`;
}

function secilenYeniKelime() {
  let yeniKelime;
  do {
    yeniKelime = kelimeler[Math.floor(Math.random() * kelimeler.length)];
  } while (yeniKelime === oncekiKelime);
  oncekiKelime = yeniKelime;
  return yeniKelime;
}

function harfEslesirMi(girilen, gercek) {
  const grup1 = harfEsleme[girilen] || [girilen];
  const grup2 = harfEsleme[gercek] || [gercek];
  return grup1.some(h => grup2.includes(h));
}

function gosterKelime() {
  kelimeDiv.textContent = secilenKelime
    .split("")
    .map(h => dogruHarfler.some(g => harfEslesirMi(g, h)) ? h : "_")
    .join(" ");
}

function harfleriOlustur() {
  harflerDiv.innerHTML = "";
  const alfabe = "abcçdefgğhıijklmnoöprsştuüvyz";
  for (let harf of alfabe) {
    const btn = document.createElement("button");
    btn.textContent = harf;
    btn.onclick = () => harfTiklandi(harf, btn);
    harflerDiv.appendChild(btn);
  }
}

function harfTiklandi(harf, btn) {
  btn.disabled = true;

  const eslesiyor = secilenKelime.split("").some(k => harfEslesirMi(harf, k));

  if (eslesiyor) {
    dogruHarfler.push(harf);
    skor += 10;
    gosterKelime();
    anlikSkorGuncelle();
    if (!kelimeDiv.textContent.includes("_")) {
      skor += 50;
      bitirOyun(true);
    }
  } else {
    yanlisSayisi++;
    skor -= 5;
    adamDiv.textContent = adamGorselleri[yanlisSayisi];
    anlikSkorGuncelle();
    if (yanlisSayisi >= adamGorselleri.length - 1) {
      bitirOyun(false);
    }
  }
}

function harfAl() {
  if (harfAlindi) return;

  const kalan = secilenKelime
    .split("")
    .filter(h => !dogruHarfler.some(g => harfEslesirMi(g, h)));

  if (kalan.length > 0) {
    const rastgele = kalan[Math.floor(Math.random() * kalan.length)];
    Array.from(harflerDiv.querySelectorAll("button")).forEach(btn => {
      if (harfEslesirMi(btn.textContent, rastgele) && !btn.disabled) {
        btn.click();
      }
    });
    harfAlBtn.disabled = true;
    harfAlindi = true;
  }
}

function harfDegistir() {
  if (harfDegistirHak <= 0) return;

  const aktifler = Array.from(harflerDiv.querySelectorAll("button")).filter(b => !b.disabled);
  if (aktifler.length === 0) return;

  const rastgeleEski = aktifler[Math.floor(Math.random() * aktifler.length)];
  rastgeleEski.disabled = true;

  const alfabe = "abcçdefgğhıijklmnoöprsştuüvyz".split("");
  const kullanilmayan = alfabe.filter(h =>
    !Array.from(harflerDiv.querySelectorAll("button")).some(b => b.textContent === h && !b.disabled)
  );

  if (kullanilmayan.length === 0) return;

  const yeni = kullanilmayan[Math.floor(Math.random() * kullanilmayan.length)];
  const yeniBtn = document.createElement("button");
  yeniBtn.textContent = yeni;
  yeniBtn.onclick = () => harfTiklandi(yeni, yeniBtn);
  harflerDiv.appendChild(yeniBtn);

  harfDegistirHak--;
  if (harfDegistirHak === 0) harfDegistirBtn.disabled = true;
  harfDegistirBtn.textContent = `🔄 Harf Değiştir (${harfDegistirHak})`;
}

function harfleriKapat() {
  harflerDiv.querySelectorAll("button").forEach(btn => btn.disabled = true);
  harfAlBtn.disabled = true;
  harfDegistirBtn.disabled = true;
}

async function bitirOyun(kazandin) {
  harfleriKapat();

  const mesaj = kazandin
    ? `🎉 Tebrikler ${oyuncuAdi}, kelimeyi buldun!`
    : `😵 Üzgünüm ${oyuncuAdi}, kaybettin!`;

  alert(`${mesaj}\nKelime: ${secilenKelime}\nSkorun: ${skor}`);

  kelimeSayaci++;
  kalanHakkGuncelle();

  await skoruKaydetKonumlu(oyuncuAdi, skor);

  if (kelimeSayaci < maxKelime) {
    setTimeout(() => yeniKelimeBaslat(), 1000);
  } else {
    alert(`🎮 Oyun Bitti!\nToplam skorun: ${skor}`);
    document.getElementById("oyun").style.display = "none";
    document.getElementById("baslangic").style.display = "block";
  }
}

function anlikSkorGuncelle() {
  anlikSkorDiv.textContent = `${oyuncuAdi} | Anlık Skor: ${skor}`;
}

function tumSkorlariIndir() {
  const skorlar = skorlarGetir();
  const veri = JSON.stringify(skorlar, null, 2);

  const blob = new Blob([veri], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "adam_asmaca_skorlar.json";
  a.click();

  URL.revokeObjectURL(url);
}

document.addEventListener("keydown", (e) => {
  const harf = e.key.toLowerCase();
  if (/^[a-zçğıöşü]$/.test(harf)) {
    const btn = Array.from(harflerDiv.querySelectorAll("button"))
      .find(b => b.textContent === harf && !b.disabled);
    if (btn) btn.click();
  }

  if (harf === "h") harfAl();
  if (harf === "d") harfDegistir();
});

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && ["x", "."].includes(e.key.toLowerCase())) {
    e.preventDefault();
    console.clear();
    console.log("%c🤫 Gizli Kelime: " + secilenKelime, "color: green; font-size: 16px;");
  }
});

window.addEventListener("load", () => {
  skorbordGoster();
  kalanHakkGuncelle();
});

indirmeBtn.addEventListener("click", tumSkorlariIndir);
