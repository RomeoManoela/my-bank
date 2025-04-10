from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission personnalisée pour vérifier si l'utilisateur est admin"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"
