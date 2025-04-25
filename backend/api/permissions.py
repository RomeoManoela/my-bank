from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission personnalisée pour vérifier si l'utilisateur est admin"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsClient(permissions.BasePermission):
    """Permission personnalisée pour vérifier si l'utilisateur est client"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "client"


class IsEmployee(permissions.BasePermission):
    """Permission personnalisée pour vérifier si l'utilisateur est caissier"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "employee"


class IsAdminOrClient(permissions.BasePermission):
    """Permission personnalisée pour vérifier si l'utilisateur est admin ou client"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            "admin",
            "client",
        ]
