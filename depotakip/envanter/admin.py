from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Supplier, Location, Product, StockMovement, Lot


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display =  ("icon", "name", "description", "created_at")
    search_fields = ("name",)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_person", "phone", "email")
    search_fields = ("name", "contact_person")


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


class StockMovementInline(admin.TabularInline):
    model = StockMovement
    extra = 0
    readonly_fields = ("created_at",)
    fields = ("movement_type", "quantity", "user", "note", "created_at")
    ordering = ("-created_at",)


class LotInline(admin.TabularInline):
    model = Lot
    extra = 0
    fields = ("lot_number", "quantity", "supplier", "received_date", "expiry_date", "note")
    ordering = ("-received_date",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "category", "quantity", "critical_level", "stock_durumu", "unit_price", "is_active")
    list_filter = ("category", "is_active", "supplier", "location")
    search_fields = ("name", "sku")
    inlines = [StockMovementInline, LotInline]
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Stok Durumu")
    def stock_durumu(self, obj):
        if obj.is_below_critical:
            return format_html('<span style="color: #d13; font-weight: bold;">⚠ Kritik</span>')
        return format_html('<span style="color: #1a7;">✓ Yeterli</span>')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("product", "movement_type", "quantity", "user", "created_at")
    list_filter = ("movement_type", "created_at")
    search_fields = ("product__name", "product__sku")
    autocomplete_fields = ("product",)


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ("product", "lot_number", "quantity", "received_date", "expiry_date")
    list_filter = ("received_date",)
    search_fields = ("product__name", "product__sku", "lot_number")
    autocomplete_fields = ("product",)