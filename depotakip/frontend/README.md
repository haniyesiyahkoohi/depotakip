# Depo Takip - Frontend (React + Vite)

Bu klasör, kullanıcıların göreceği ürün vitrini (Direnc.net tarzı) arayüzüdür.
Django backend'deki REST API'den veri çeker.

## Kurulum

Bu klasörü, Django projenin (depotakip) yanına, YENİ bir "frontend" klasörü
olarak çıkart. Yani proje yapın şöyle olmalı:

```
depotakip/          <- Django proje kök klasörü (manage.py burada)
├── depotakip/
├── envanter/
├── frontend/        <- BU klasör burada olmalı
├── manage.py
└── ...
```

Terminalde bu klasöre gir ve bağımlılıkları kur:

```bash
cd frontend
npm install
```

## Çalıştırma

ÖNEMLİ: Django backend'in de AYNI ANDA çalışıyor olması lazım (başka bir terminalde):

```bash
# Terminal 1 - Backend (depotakip klasöründe, venv aktifken)
python manage.py runserver

# Terminal 2 - Frontend (frontend klasöründe)
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

## Yapı

- `src/api.js` — Django API'sine bağlanan fonksiyonlar
- `src/components/` — Header (arama çubuğu), CategoryFilter (kategori filtreleri), ProductCard (ürün kartı)
- `src/App.jsx` — Ana sayfa, tüm parçaları birleştirir
- `src/theme.css` — Renk paleti ve tipografi (elektronik/PCB temalı)
