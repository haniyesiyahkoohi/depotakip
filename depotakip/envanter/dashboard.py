from decimal import Decimal

from django.db.models import F, Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product, StockMovement


class DashboardView(APIView):
    """GET /api/dashboard/  Özet istatistikler, kritik ürünler ve kategori dağılımı döndürür."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_products = Product.objects.filter(is_active=True)

        total_products = active_products.count()
        total_categories = Category.objects.count()
        total_stock_units = active_products.aggregate(total=Sum("quantity"))["total"] or 0

        total_stock_value = sum(
            (p.quantity * p.unit_price for p in active_products if p.unit_price is not None),
            Decimal("0"),
        )

        critical_qs = active_products.filter(quantity__lte=F("critical_level"), quantity__gt=0)
        out_of_stock_qs = active_products.filter(quantity=0)

        critical_products = [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "quantity": p.quantity,
                "critical_level": p.critical_level,
                "category_name": p.category.name,
            }
            for p in critical_qs.select_related("category").order_by("quantity")[:15]
        ]

        category_breakdown = [
            {
                "id": c.id,
                "name": c.name,
                "icon": c.icon,
                "product_count": c.products.count(),
                "total_quantity": c.products.aggregate(total=Sum("quantity"))["total"] or 0,
            }
            for c in Category.objects.all()
        ]
        category_breakdown.sort(key=lambda c: c["product_count"], reverse=True)

        recent_movements = [
            {
                "product_name": m.product.name,
                "movement_type": m.movement_type,
                "quantity": m.quantity,
                "created_at": m.created_at,
            }
            for m in StockMovement.objects.select_related("product").order_by("-created_at")[:10]
        ]

        return Response({
            "summary": {
                "total_products": total_products,
                "total_categories": total_categories,
                "total_stock_units": total_stock_units,
                "total_stock_value": float(total_stock_value),
                "critical_count": critical_qs.count(),
                "out_of_stock_count": out_of_stock_qs.count(),
            },
            "category_breakdown": category_breakdown,
            "critical_products": critical_products,
            "recent_movements": recent_movements,
        })