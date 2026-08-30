# Elektronik Sarf Malzeme Depo Takip Sistemi

Django tabanlı depo/stok takip sistemi. Admin paneli ve REST API içerir,
ileride AI destekli (chatbot, talep tahmini, görsel tanıma) özellikler eklenecek.

## Kurulum (Windows/Mac/Linux fark etmez)

### 1) MySQL'de veritabanını oluştur
MySQL Workbench'i aç, bir bağlantı ile MySQL sunucuna bağlan ve şu SQL'i çalıştır:

```sql
CREATE DATABASE depotakip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2) Sanal ortam oluştur ve bağımlılıkları kur

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3) .env dosyasını hazırla

`.env.example` dosyasını kopyalayıp `.env` adıyla kaydet, içindeki `DB_PASSWORD`
alanına kendi MySQL şifreni yaz (root şifren neyse).

```bash
cp .env.example .env    # Windows'ta: copy .env.example .env
```

### 4) Migration'ları çalıştır (tabloları oluşturur)

```bash
python manage.py migrate
```

### 5) Admin kullanıcısı oluştur

```bash
python manage.py createsuperuser
```

### 6) Sunucuyu başlat

```bash
python manage.py runserver
```

Tarayıcıda `http://127.0.0.1:8000/admin/` adresine git, oluşturduğun kullanıcıyla giriş yap.
Admin panelinde Kategoriler, Tedarikçiler, Konumlar, Ürünler ve Stok Hareketleri
tabloları hazır olarak seni bekliyor olacak.

## Proje Yapısı

```
depotakip/
├── depotakip/          # Proje ayarları (settings.py, urls.py)
├── envanter/           # Ana uygulama: modeller, admin paneli kayıtları
│   ├── models.py       # Category, Supplier, Location, Product, StockMovement
│   ├── admin.py        # Admin panel özelleştirmeleri
│   └── migrations/     # Veritabanı migration dosyaları
├── requirements.txt
├── .env.example
└── manage.py
```

## Veri Modeli Özeti

- **Category** – Ürün kategorisi (Direnç, Kondansatör, Sensör, vb.)
- **Supplier** – Tedarikçi bilgisi
- **Location** – Depo/raf/kutu konumu
- **Product** – Ürün: SKU, kategori, teknik özellikler (JSON), miktar, kritik seviye, fiyat, görsel
- **StockMovement** – Giriş/çıkış hareketleri; kaydedildiğinde `Product.quantity` otomatik güncellenir

## Sırada Ne Var?

1. `envanter` app'i için REST API (serializers.py + views.py + urls.py) ekleyeceğiz
2. Kritik stok seviyesi altına düşen ürünler için otomatik uyarı
3. AI destekli depo asistanı (chatbot) entegrasyonu
4. Raporlama ve grafikler
5. Talep tahmini modeli
