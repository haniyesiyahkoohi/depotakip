from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

ROLES = ["Depo Görevlisi", "Görüntüleyici"]


class Command(BaseCommand):
    help = "Kullanıcı rolü gruplarını oluşturur (Depo Görevlisi, Görüntüleyici)."

    def handle(self, *args, **options):
        for name in ROLES:
            group, created = Group.objects.get_or_create(name=name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"+ '{name}' grubu oluşturuldu"))
            else:
                self.stdout.write(f"  '{name}' grubu zaten var, atlandı")

        self.stdout.write(self.style.SUCCESS(
            "\nArtık admin panelden Kullanıcılar > (bir kullanıcı) > Gruplar alanından "
            "kullanıcıları 'Depo Görevlisi' ya da 'Görüntüleyici' grubuna ekleyebilirsin."
        ))