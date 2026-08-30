import os

from django.conf import settings
from django.db.models import F
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import anthropic

from .models import Category, Product, StockMovement

MODEL_NAME = "claude-haiku-4-5-20251001"


def build_context():
    total_products = Product.objects.filter(is_active=True).count()
    total_categories = Category.objects.count()

    critical_products = (
        Product.objects.filter(is_active=True, quantity__lte=F("critical_level"))
        .select_related("category")
        .order_by("quantity")[:25]
    )
    critical_lines = [
        f"- {p.name} (SKU: {p.sku}, Kategori: {p.category.name}, "
        f"Mevcut: {p.quantity} {p.unit}, Kritik seviye: {p.critical_level})"
        for p in critical_products
    ]

    category_lines = [
        f"- {c.name}: {c.products.count()} ürün" for c in Category.objects.all()
    ]

    recent_movements = StockMovement.objects.select_related("product").order_by("-created_at")[:10]
    movement_lines = [
        f"- {m.get_movement_type_display()}: {m.product.name} "
        f"({m.quantity} {m.product.unit}) - {m.created_at.strftime('%d.%m.%Y %H:%M')}"
        for m in recent_movements
    ]

    return f"""GÜNCEL DEPO DURUMU (veritabanından çekildi):

Toplam aktif ürün sayısı: {total_products}
Toplam kategori sayısı: {total_categories}

KRİTİK/DÜŞÜK STOKTAKİ ÜRÜNLER ({len(critical_lines)} adet gösteriliyor, en düşükten yükseğe):
{chr(10).join(critical_lines) if critical_lines else "Şu an kritik seviyede ürün yok."}

KATEGORİ BAŞINA ÜRÜN SAYISI:
{chr(10).join(category_lines) if category_lines else "Henüz kategori yok."}

SON STOK HAREKETLERİ (en yeni 10 kayıt):
{chr(10).join(movement_lines) if movement_lines else "Henüz hareket kaydı yok."}
"""


SYSTEM_PROMPT_TEMPLATE = """Sen "Depo Takip" adlı elektronik sarf malzeme depo yönetim sisteminin dahili asistanısın. \
Görevin, depo görevlilerinin stok durumu hakkındaki sorularını Türkçe, kısa ve net şekilde cevaplamak.

Kurallar:
- SADECE aşağıda sana verilen güncel depo verisini kullanarak cevap ver. Veride olmayan bir bilgiyi asla uydurma.
- Soru depo/stok/ürün konusuyla ilgili değilse, kibarca bunun bir depo takip asistanı olduğunu ve \
sadece stok konularında yardımcı olabileceğini belirt.
- Cevapların kısa, anlaşılır olsun; liste gerektiren durumlarda madde işareti kullan.
- Sayısal verileri (miktar, kritik seviye) olduğu gibi, değiştirmeden aktar.

{context}
"""


class ChatbotView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = (request.data.get("message") or "").strip()
        history = request.data.get("history") or []

        if not user_message:
            return Response({"error": "Mesaj boş olamaz."}, status=status.HTTP_400_BAD_REQUEST)

        api_key = getattr(settings, "ANTHROPIC_API_KEY", "") or os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            return Response(
                {"error": "ANTHROPIC_API_KEY tanımlı değil. .env dosyana eklemen gerekiyor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            client = anthropic.Anthropic(api_key=api_key)
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(context=build_context())

            messages = []
            for turn in history[-10:]:
                role = turn.get("role")
                content = turn.get("content")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})
            messages.append({"role": "user", "content": user_message})

            response = client.messages.create(
                model=MODEL_NAME,
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
            )
            answer = "".join(block.text for block in response.content if block.type == "text")
        except Exception as exc:
            return Response(
                {"error": f"Yapay zeka servisine ulaşılamadı: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"answer": answer})