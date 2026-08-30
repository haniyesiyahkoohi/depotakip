from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Category(models.Model):
    """Ürün kategorisi: Direnç, Kondansatör, Mikrodenetleyici, Sensör vb."""
    name = models.CharField("Kategori Adı", max_length=100, unique=True)
    icon = models.CharField("İkon (emoji)", max_length=8, blank=True, default="🔧")
    description = models.TextField("Açıklama", blank=True)
    created_at = models.DateTimeField("Oluşturulma Tarihi", auto_now_add=True)

    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Tedarikçi bilgisi."""
    name = models.CharField("Tedarikçi Adı", max_length=150)
    contact_person = models.CharField("Yetkili Kişi", max_length=150, blank=True)
    phone = models.CharField("Telefon", max_length=30, blank=True)
    email = models.EmailField("E-posta", blank=True)
    website = models.URLField("Web Sitesi", blank=True)
    notes = models.TextField("Notlar", blank=True)

    class Meta:
        verbose_name = "Tedarikçi"
        verbose_name_plural = "Tedarikçiler"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Location(models.Model):
    """Depo/raf/kutu konumu."""
    name = models.CharField("Konum Adı", max_length=100)
    description = models.CharField("Açıklama (örn. Raf-3, Kutu-12)", max_length=150, blank=True)

    class Meta:
        verbose_name = "Konum"
        verbose_name_plural = "Konumlar"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    """Elektronik sarf malzeme / komponent."""
    UNIT_CHOICES = [
        ("adet", "Adet"),
        ("metre", "Metre"),
        ("paket", "Paket"),
        ("rulo", "Rulo"),
        ("kutu", "Kutu"),
    ]

    name = models.CharField("Ürün Adı", max_length=200)
    sku = models.CharField("Stok Kodu (SKU)", max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products", verbose_name="Kategori")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="products", verbose_name="Tedarikçi")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="products", verbose_name="Konum")

    # Elektronik komponentlere özgü esnek özellikler (örn. {"deger": "10k", "tolerans": "%5", "watt": "0.25"})
    specs = models.JSONField("Teknik Özellikler", default=dict, blank=True)

    unit = models.CharField("Birim", max_length=10, choices=UNIT_CHOICES, default="adet")
    quantity = models.PositiveIntegerField("Mevcut Miktar", default=0)
    critical_level = models.PositiveIntegerField("Kritik Stok Seviyesi", default=5,
                                                  help_text="Bu seviyenin altına düşünce uyarı verilir.")
    unit_price = models.DecimalField("Birim Fiyat", max_digits=10, decimal_places=2,
                                      null=True, blank=True, validators=[MinValueValidator(0)])
    datasheet_url = models.URLField("Datasheet Linki", blank=True)
    image = models.ImageField("Ürün Görseli", upload_to="products/", blank=True, null=True)

    is_active = models.BooleanField("Aktif", default=True)
    created_at = models.DateTimeField("Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField("Güncellenme Tarihi", auto_now=True)

    class Meta:
        verbose_name = "Ürün"
        verbose_name_plural = "Ürünler"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def is_below_critical(self):
        return self.quantity <= self.critical_level


class StockMovement(models.Model):
    """Stok giriş/çıkış hareketleri. Raporlama ve AI tahmini bu tabloya dayanır."""
    MOVEMENT_TYPES = [
        ("giris", "Giriş"),
        ("cikis", "Çıkış"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements", verbose_name="Ürün")
    movement_type = models.CharField("Hareket Tipi", max_length=10, choices=MOVEMENT_TYPES)
    quantity = models.PositiveIntegerField("Miktar", validators=[MinValueValidator(1)])
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="movements", verbose_name="İşlemi Yapan")
    note = models.CharField("Not", max_length=255, blank=True)
    created_at = models.DateTimeField("Tarih", auto_now_add=True)

    class Meta:
        verbose_name = "Stok Hareketi"
        verbose_name_plural = "Stok Hareketleri"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"

    def save(self, *args, **kwargs):
        """Kaydederken ürünün mevcut miktarını otomatik güncelle."""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            old_quantity = self.product.quantity
            if self.movement_type == "giris":
                self.product.quantity += self.quantity
            else:
                self.product.quantity = max(0, self.product.quantity - self.quantity)
            self.product.save(update_fields=["quantity"])

            # Ürün, bu hareketle birlikte kritik seviyenin ÜSTÜNDEN ALTINA yeni
            # düştüyse (daha önce kritik değilken şimdi kritik olduysa) bildirim gönder.
            # Böylece zaten kritik olan bir üründe her küçük harekette tekrar tekrar
            # e-posta gitmesi engellenmiş olur.
            just_became_critical = (
                self.movement_type == "cikis"
                and old_quantity > self.product.critical_level
                and self.product.quantity <= self.product.critical_level
            )
            if just_became_critical:
                from .notifications import notify_critical_stock
                notify_critical_stock(self.product)

                

class Lot(models.Model):
    """Bir ürünün belirli bir partisi (lot/seri). Aynı ürün farklı zamanlarda,
    farklı partiler halinde gelmiş olabilir; bu tablo hangi partiden ne kadar
    kaldığını, ne zaman geldiğini ve (varsa) son kullanma tarihini tutar."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="lots", verbose_name="Ürün")
    lot_number = models.CharField("Lot / Seri Numarası", max_length=100)
    quantity = models.PositiveIntegerField("Bu Partiden Kalan Miktar", default=0)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Tedarikçi")
    received_date = models.DateField("Geliş Tarihi")
    expiry_date = models.DateField("Son Kullanma Tarihi", null=True, blank=True,
                                    help_text="Yoksa boş bırak (çoğu elektronik komponentte olmaz).")
    note = models.CharField("Not", max_length=255, blank=True)
    created_at = models.DateTimeField("Kayıt Tarihi", auto_now_add=True)

    class Meta:
        verbose_name = "Lot / Seri"
        verbose_name_plural = "Lotlar / Seriler"
        ordering = ["-received_date"]
        unique_together = [["product", "lot_number"]]

    def __str__(self):
        return f"{self.product.name} - {self.lot_number}"

    @property
    def is_expired(self):
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()