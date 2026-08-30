from django.core.management.base import BaseCommand
from envanter.models import Category

# Direnc.net'teki gibi geniş bir elektronik kategori listesi + ikon
CATEGORIES = [
    ("Arduino", "🔵"),
    ("Raspberry Pi", "🍓"),
    ("ESP-Wifi Modülleri", "📶"),
    ("Kablosuz Haberleşme", "📡"),
    ("Geliştirme Kartları", "🧩"),
    ("Lcd ve Display", "🖥️"),
    ("Sensör ve Modüller", "🌡️"),
    ("Ölçüm ve Test Aletleri", "📟"),
    ("Havya ve Lehimleme Ekipmanları", "🔥"),
    ("3D Printer ve CNC", "🖨️"),
    ("Motor ve Motor Sürücüler", "⚙️"),
    ("Robotik - Drone - Eğitim", "🤖"),
    ("Plaket ve Breadboard", "🟩"),
    ("Programlama Kartları", "💾"),
    ("Mikrodenetleyiciler", "🧠"),
    ("Entegreler", "🔲"),
    ("Yarı İletkenler", "⚡"),
    ("Led Ürünleri", "💡"),
    ("Direnç", "🎚️"),
    ("Kondansatör", "🔋"),
    ("Pot, Trimpot ve Encoder", "🎛️"),
    ("Diğer Pasif Komponentler", "🔩"),
    ("Röle", "🔁"),
    ("Klemens", "🪛"),
    ("Buton ve Switch", "🔘"),
    ("Konnektör", "🔌"),
    ("El Aletleri", "🛠️"),
    ("Güç Kaynakları - Adaptör", "🔋"),
    ("Pil - Akü - Güneş Panelleri", "🔆"),
    ("Kablo Çeşitleri", "🧵"),
    ("Kutu Çeşitleri", "📦"),
]


class Command(BaseCommand):
    help = "Direnc.net tarzı geniş bir elektronik kategori listesini veritabanına ekler."

    def handle(self, *args, **options):
        created_count = 0
        for name, icon in CATEGORIES:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={"icon": icon},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"+ {icon} {name}"))
            else:
                self.stdout.write(f"  (zaten var, atlandı) {name}")

        self.stdout.write(self.style.SUCCESS(
            f"\nTamamlandı: {created_count} yeni kategori eklendi, "
            f"toplam {Category.objects.count()} kategori var."
        ))