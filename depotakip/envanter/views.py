from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Supplier, Location, Product, StockMovement, Lot
from .serializers import (
    CategorySerializer, SupplierSerializer, LocationSerializer,
    ProductSerializer, StockMovementSerializer, LotSerializer,
)
from .forecasting import estimate_forecast
from .barcode_utils import generate_barcode_png
from .permissions import IsAdminOrReadOnly, CanManageStock

ROLE_LABELS = {
    "admin": "Yönetici",
    "depo_gorevlisi": "Depo Görevlisi",
    "goruntuleyici": "Görüntüleyici",
}


class MeView(APIView):
    """GET /api/me/  Giriş yapan kullanıcının rolünü döndürür."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_staff or user.is_superuser:
            role = "admin"
        elif user.groups.filter(name="Depo Görevlisi").exists():
            role = "depo_gorevlisi"
        else:
            role = "goruntuleyici"

        return Response({
            "username": user.username,
            "role": role,
            "role_label": ROLE_LABELS[role],
            "can_manage_stock": role in ("admin", "depo_gorevlisi"),
        })


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminOrReadOnly]


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "supplier", "location").all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "supplier", "location", "is_active"]
    search_fields = ["name", "sku"]
    ordering_fields = ["name", "quantity", "unit_price", "created_at"]

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def forecast(self, request, pk=None):
        """GET /api/products/<id>/forecast/ - o ürün için talep tahmini döndürür."""
        product = self.get_object()
        return Response(estimate_forecast(product))

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def barcode_image(self, request, pk=None):
        """GET /api/products/<id>/barcode_image/ - ürünün SKU'suna ait barkod PNG görselini döndürür."""
        product = self.get_object()
        png_buffer = generate_barcode_png(product.sku)
        return HttpResponse(png_buffer.read(), content_type="image/png")

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def lookup(self, request):
        """GET /api/products/lookup/?code=<SKU> - barkod okuyucudan gelen kodu tam eşleştirerek ürünü bulur."""
        code = (request.query_params.get("code") or "").strip()
        if not code:
            return Response({"error": "code parametresi gerekli."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(sku__iexact=code)
        except Product.DoesNotExist:
            return Response({"error": "Bu koda sahip ürün bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product, context={"request": request}).data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related("product", "user").all()
    serializer_class = StockMovementSerializer
    permission_classes = [CanManageStock]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["product", "movement_type"]
    ordering_fields = ["created_at"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LotViewSet(viewsets.ModelViewSet):
    queryset = Lot.objects.select_related("product", "supplier").all()
    serializer_class = LotSerializer
    permission_classes = [CanManageStock]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["product"]
    ordering_fields = ["received_date", "expiry_date"]