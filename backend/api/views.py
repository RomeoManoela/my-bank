from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CompteBancaire
from .serializers import CompteBancaireApprovalSerializer, CompteBancaireSerializer


class CompteBancaireViewSet(viewsets.ModelViewSet):
    queryset = CompteBancaire.objects.all()
    serializer_class = CompteBancaireSerializer

    def get_permissions(self):
        """
        Définir les permissions:
        - Approbation: admin seulement
        - Création: utilisateur authentifié
        - Autres actions: selon les besoins
        """
        if self.action == "approve":
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Associer l'utilisateur actuel au compte lors de la création
        serializer.save(utilisateur=self.request.user)

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        """Endpoint pour approuver ou rejeter un compte bancaire"""
        compte = self.get_object()
        serializer = CompteBancaireApprovalSerializer(
            compte, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Liste tous les comptes en attente d'approbation"""
        if request.user.role != "admin":
            return Response(
                {
                    "detail": "Vous n'avez pas la permission d'accéder à cette ressource."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        comptes = CompteBancaire.objects.filter(statut="en_attente")
        serializer = self.get_serializer(comptes, many=True)
        return Response(serializer.data)
