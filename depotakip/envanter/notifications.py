import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def notify_critical_stock(product):
    """Bir ürün kritik stok seviyesine yeni düştüğünde, ayarlarda tanımlı
    alıcılara bir uyarı e-postası gönderir. Alıcı listesi boşsa (yapılandırılmamışsa)
    sessizce hiçbir şey yapmaz."""
    recipients = getattr(settings, "STOCK_ALERT_RECIPIENTS", [])
    if not recipients:
        return

    subject = f"⚠️ Kritik Stok Uyarısı: {product.name}"
    message = (
        f"{product.name} (SKU: {product.sku}) ürününün stoğu kritik seviyeye düştü.\n\n"
        f"Mevcut miktar: {product.quantity} {product.unit}\n"
        f"Kritik seviye: {product.critical_level} {product.unit}\n"
        f"Kategori: {product.category.name}\n\n"
        f"Depo Takip Sistemi"
    )
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipients, fail_silently=False)
    except Exception:
        logger.exception("Kritik stok e-postası gönderilemedi: %s", product.sku)