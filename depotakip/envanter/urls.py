from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, SupplierViewSet, LocationViewSet,
    ProductViewSet, StockMovementViewSet, LotViewSet, MeView,
)
from .chatbot import ChatbotView
from .dashboard import DashboardView

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"suppliers", SupplierViewSet)
router.register(r"locations", LocationViewSet)
router.register(r"products", ProductViewSet)
router.register(r"movements", StockMovementViewSet)
router.register(r"lots", LotViewSet)

urlpatterns = router.urls + [
    path("chatbot/", ChatbotView.as_view(), name="chatbot"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("me/", MeView.as_view(), name="me"),
]