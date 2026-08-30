from rest_framework import serializers
from .models import Category, Supplier, Location, Product, StockMovement, Lot


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "icon", "description", "created_at"]

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact_person", "phone", "email", "website", "notes"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "description"]


class ProductSerializer(serializers.ModelSerializer):
    # Okurken kategori/tedarikçi/konum isimlerini de göster (sadece id değil)
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default=None)
    location_name = serializers.CharField(source="location.name", read_only=True, default=None)
    is_below_critical = serializers.BooleanField(read_only=True)
    specs = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Product
        fields = [
            "id", "name", "sku", "category", "category_name",
            "supplier", "supplier_name", "location", "location_name",
            "specs", "unit", "quantity", "critical_level", "unit_price",
            "datasheet_url", "image", "is_active", "is_below_critical",
            "created_at", "updated_at",
        ]
        read_only_fields = ["quantity"]  # miktar sadece StockMovement ile değişir, doğrudan API'den değiştirilmez

    def validate_specs(self, value):
        return value or {}


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = ["id", "product", "product_name", "movement_type", "quantity", "user", "note", "created_at"]
        read_only_fields = ["user"]  # kullanıcı otomatik atanacak (kim giriş yaptıysa)


class LotSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default=None)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Lot
        fields = [
            "id", "product", "lot_number", "quantity", "supplier", "supplier_name",
            "received_date", "expiry_date", "is_expired", "note", "created_at",
        ]