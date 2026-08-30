from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Ürün/kategori/tedarikçi/konum gibi 'katalog' verilerini sadece yöneticiler
    (is_staff) değiştirebilir. Okuma (GET) herkese açıktır."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class CanManageStock(permissions.BasePermission):
    """Stok hareketi eklemek için: yönetici ya da 'Depo Görevlisi' grubunda
    olmak gerekir. Okuma (GET) herkese açıktır, 'Görüntüleyici' rolü de dahil."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.groups.filter(name="Depo Görevlisi").exists()