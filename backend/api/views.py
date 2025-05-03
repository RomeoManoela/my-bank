from datetime import datetime
from decimal import Decimal

from django.db.models import Q
from rest_framework import permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import CompteBancaire, Utilisateur, Pret, Transaction
from .permissions import IsAdmin, IsClient
from .serializers import (
    CompteBancaireSerializer,
    UtilisateurSerializer,
    PretSerializer,
    TransactionSerializer,
)


class InscriptionUtilisateur(generics.CreateAPIView):
    """Endpoint pour l'inscription d'un utilisateur"""

    serializer_class = UtilisateurSerializer
    queryset = Utilisateur.objects.all()
    permission_classes = [permissions.AllowAny]


class TokenObtainPersonnalisee(TokenObtainPairView):
    """Endpoint pour obtenir un token d'authentification personnalisé"""

    def post(self, request: Request, *args, **kwargs) -> Response:
        res: Response = super().post(request, *args, **kwargs)
        refresh_token = res.data.pop("refresh")
        res.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=3600 * 24 * 7,
        )
        return res


class RefreshTokenPersonnalisee(TokenRefreshView):
    """Endpoint pour rafraîchir un token d'authentification personnalisé"""

    def post(self, request: Request, *args, **kwargs) -> Response:
        request._full_data = {"refresh": request.COOKIES.get("refresh_token")}
        return super().post(request, *args, **kwargs)


class CreationCompteBancaire(generics.CreateAPIView):
    """Endpoint pour créer un compte bancaire"""

    permission_classes = [IsClient]
    serializer_class = CompteBancaireSerializer
    queryset = CompteBancaire.objects.all()

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class ListeComptesBancaires(generics.ListAPIView):
    """Endpoint pour lister tous les comptes bancaires"""

    permission_classes = [IsAuthenticated]
    serializer_class = CompteBancaireSerializer

    def get_queryset(self):
        if self.request.user.role == "admin":
            return CompteBancaire.objects.all()
        return CompteBancaire.objects.filter(utilisateur=self.request.user)


class DetailCompteBancaireClient(generics.RetrieveUpdateDestroyAPIView):
    """Endpoint pour récupérer les détails d'un compte bancaire"""

    permission_classes = [IsClient, IsAdmin]
    serializer_class = CompteBancaireSerializer
    lookup_field = "pk"

    def get_queryset(self):
        if self.request.user.role == "admin":
            return CompteBancaire.objects.all()
        return CompteBancaire.objects.filter(utilisateur=self.request.user)

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)

        # Si l'utilisateur n'est pas admin
        if self.request.user.role != "admin" and self.request.method in [
            "PUT",
            "PATCH",
        ]:
            # Empêcher la modification du statut
            if "statut" in serializer.fields:
                serializer.fields["statut"].read_only = True

            # Empêcher la modification du solde
            if "solde" in serializer.fields:
                serializer.fields["solde"].read_only = True

        return serializer

    def delete(self, request, *args, **kwargs):
        # Seuls les admins peuvent supprimer un compte
        if request.user.role != "admin":
            return Response(
                {"detail": "Vous n'avez pas la permission de supprimer ce compte."},
                status=403,
            )
        return super().delete(request, *args, **kwargs)


class FaireUnPret(generics.CreateAPIView):
    """Endpoint pour faire un prêt"""

    permission_classes = [IsClient]
    serializer_class = PretSerializer

    def perform_create(self, serializer):
        compte = serializer.validated_data.get("compte")
        print("compte", compte)

        # Vérifie que l'utilisateur est propriétaire du compte
        if compte.utilisateur != self.request.user:
            raise PermissionDenied(
                "Vous ne pouvez demander un prêt que pour vos propres comptes"
            )

        # Vérifie que le compte est approuvé
        if compte.statut != "approuve":
            raise ValidationError("Le compte doit être approuvé pour demander un prêt")

        serializer.save(statut="en_attente")


class RembourserPret(generics.UpdateAPIView):
    """Endpoint pour rembourser un pret partiellement ou totalement"""

    permission_classes = [IsClient]
    serializer_class = PretSerializer
    queryset = Pret.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        montant_remboursement = request.data.get("montant_remboursement")

        if not montant_remboursement:
            return Response(
                {"detail": "Le montant de remboursement est requis."}, status=400
            )

        try:
            montant_remboursement = Decimal(montant_remboursement)
            if montant_remboursement <= 0:
                return Response(
                    {"detail": "Le montant de remboursement doit être positif."},
                    status=400,
                )
        except (ValueError, TypeError):
            return Response(
                {"detail": "Le montant de remboursement doit être un nombre valide."},
                status=400,
            )

        pret = self.get_object()

        # Vérifie que l'utilisateur est propriétaire du compte associé au prêt
        if pret.compte.utilisateur != request.user:
            raise PermissionDenied("Vous ne pouvez rembourser que vos propres prêts.")

        # Vérifie que le prêt est en cours
        if pret.statut != "en_cours":
            return Response(
                {
                    "detail": f"Ce prêt ne peut pas être remboursé car il est '{pret.get_statut_display()}'."
                },
                status=400,
            )

        # Vérifie que le compte a suffisamment de solde
        compte = pret.compte
        if compte.solde < montant_remboursement:
            return Response(
                {"detail": "Solde insuffisant pour effectuer ce remboursement."},
                status=400,
            )

        # Vérifie que le montant de remboursement ne dépasse pas le montant restant du prêt
        if montant_remboursement > pret.montant:
            return Response(
                {
                    "detail": f"Le montant de remboursement ne peut pas dépasser le montant restant du prêt ({pret.montant})."
                },
                status=400,
            )

        compte.solde -= montant_remboursement
        compte.save()

        # Mettre à jour le montant du prêt
        pret.montant -= montant_remboursement

        # Si le prêt est entièrement remboursé
        if pret.montant == 0:
            pret.statut = "rembourse"
            pret.date_remboursement = str(datetime.now())

        pret.save()

        # Créer une transaction pour le remboursement
        Transaction.objects.create(
            compte=compte,
            type="remboursement",
            montant=montant_remboursement,
            status="succès",
            utilisateur=request.user,
            commentaire=f"Remboursement partiel du prêt #{pret.id},"
            f" montant: {montant_remboursement}, date {datetime.now()}",
        )

        return Response(
            {
                "detail": "Remboursement effectué avec succès.",
                "pret": PretSerializer(pret).data,
            }
        )


class ApprouverRejeterPret(generics.UpdateAPIView):
    """Endpoint pour approuver ou rejeter un pret"""

    permission_classes = [IsAdmin]
    serializer_class = PretSerializer
    queryset = Pret.objects.all()
    lookup_field = "pk"

    def perform_update(self, serializer):
        pret = serializer.instance
        nouveau_statut = serializer.validated_data.get("statut")
        print(serializer.validated_data)

        # Si le prêt est approuvé
        if nouveau_statut == "approuve":
            pret.statut = "en_cours"
            compte = pret.compte
            compte.solde += Decimal(pret.montant)
            compte.save()

        serializer.save()
        return Response(serializer.data)


class ListePret(generics.ListAPIView):
    """Endpoint pour lister tous les prets"""

    permission_classes = [IsAuthenticated]  # Changement ici
    serializer_class = PretSerializer

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Pret.objects.all()
        elif self.request.user.role == "client":
            return Pret.objects.filter(compte__utilisateur=self.request.user)
        else:
            return (
                Pret.objects.none()
            )  # Retourne une queryset vide pour les autres rôles


class EffectuerTransaction(generics.CreateAPIView):
    """Endpoint pour effectuer une transaction (virement)"""

    permission_classes = [IsClient]
    serializer_class = TransactionSerializer

    def perform_create(self, serializer):
        # Log des données validées pour le débogage
        print("Données validées:", serializer.validated_data)
        compte_source = serializer.validated_data.get("compte_source")
        montant = serializer.validated_data.get("montant")
        compte_destination = serializer.validated_data.get("compte_destination", None)

        # Vérifie que l'utilisateur est propriétaire du compte source
        if (
            compte_source.utilisateur != self.request.user
            and self.request.user.role != "admin"
        ):
            raise PermissionDenied(
                "Vous n'êtes pas autorisé à effectuer des transactions sur ce compte"
            )

        # Vérifie que le compte est approuvé
        if compte_source.statut != "approuve":
            raise ValidationError(
                "Le compte doit être approuvé pour effectuer des transactions"
            )

        if not compte_destination:
            raise ValidationError("Compte destinataire requis pour un virement")

        if compte_source.solde < montant:
            raise ValidationError("Solde insuffisant pour effectuer ce virement")

        # Pour les virements, on met en attente pour approbation par un admin
        serializer.save()


class ApprouverRejeterVirement(generics.UpdateAPIView):
    """Endpoint pour approuver ou rejeter un virement"""

    permission_classes = [IsAdmin]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.filter(type="transfert")
    lookup_field = "pk"

    def perform_update(self, serializer):
        transaction = serializer.instance
        nouveau_statut = serializer.validated_data.get("status")

        # Vérifie que c'est bien un virement
        if transaction.type != "transfert":
            raise ValidationError("Cette transaction n'est pas un virement")

        # Vérifie que le virement est en attente
        if transaction.status != "en_attente":
            raise ValidationError("Ce virement n'est plus en attente d'approbation")

        if nouveau_statut == "succès":
            compte = transaction.compte_source
            compte_destinataire = transaction.compte_destination

            if compte.solde < transaction.montant:
                raise ValidationError("Solde insuffisant pour effectuer ce virement")

            compte.solde -= transaction.montant
            compte_destinataire.solde += transaction.montant
            compte.save()
            compte_destinataire.save()

        serializer.save()
        return Response(
            {"message": f"Virement {nouveau_statut}", "transaction": serializer.data}
        )


class MobileMoneyTransactionView(generics.CreateAPIView):
    """Endpoint pour les transactions via Mobile Money"""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        compte_id = request.data.get("compte")
        montant = Decimal(request.data.get("montant", 0))  # Convert to Decimal here
        type_transaction = request.data.get("type_transaction")  # 'depot' ou 'retrait'
        fournisseur = request.data.get("fournisseur")  # 'mvola' ou 'orange_money'
        numero_telephone = request.data.get("numero_telephone")

        if not all(
            [compte_id, montant, type_transaction, fournisseur, numero_telephone]
        ):
            return Response({"detail": "Tous les champs sont requis."}, status=400)

        try:
            compte = CompteBancaire.objects.get(id=compte_id, utilisateur=request.user)
        except CompteBancaire.DoesNotExist:
            return Response({"detail": "Compte non trouvé."}, status=404)

        if compte.statut != "approuve":
            return Response(
                {
                    "detail": "Le compte doit être approuvé pour effectuer cette opération."
                },
                status=400,
            )

        # Calcul des frais selon le fournisseur
        frais_pourcentage = {
            "mvola": {"depot": 0.003, "retrait": 0.008},
            "orange_money": {"depot": 0.005, "retrait": 0.01},
        }.get(fournisseur, {"depot": 0.005, "retrait": 0.01})

        frais = montant * Decimal(frais_pourcentage.get(type_transaction, 0.005))

        # Pour un retrait, vérifier que le solde est suffisant
        if type_transaction == "retrait":
            montant_total = montant + frais
            if compte.solde < montant_total:
                return Response(
                    {
                        "detail": f"Solde insuffisant. Montant demandé: {montant} + frais: {frais}"
                    },
                    status=400,
                )

            # Effectuer le retrait
            compte.solde -= montant_total
            compte.save()

            commentaire = f"Retrait via {fournisseur} ({numero_telephone}). Montant: {montant}, Frais: {frais}"
        else:  # dépôt
            # Effectuer le dépôt
            montant_net = montant - frais
            compte.solde += montant_net
            compte.save()

            commentaire = f"Dépôt via {fournisseur} ({numero_telephone}). Montant: {montant}, Frais: {frais}"

        # Créer la transaction
        transaction = Transaction.objects.create(
            compte_source=compte,  # Use compte_source instead of compte
            type=type_transaction,
            montant=montant,
            status="succès",
            commentaire=commentaire,
            # frais field doesn't exist in the model
        )

        return Response(
            {
                "detail": f"{type_transaction.capitalize()} effectué avec succès.",
                "transaction": TransactionSerializer(transaction).data,
                "nouveau_solde": compte.solde,
            },
            status=201,
        )


class ListTransaction(generics.ListAPIView):
    """Endpoint pour lister les transactions d'un utilisateur"""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        if self.request.user.role == "admin":
            # Récupérer toutes les transactions, triées par date décroissante
            return Transaction.objects.all().order_by("-date_transaction")

        # Récupérer les transactions où l'utilisateur est source OU destinataire
        user_accounts = CompteBancaire.objects.filter(utilisateur=self.request.user)
        return Transaction.objects.filter(
            Q(compte_source__in=user_accounts) | Q(compte_destination__in=user_accounts)
        ).order_by("-date_transaction")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_account(request):
    """Endpoint pour vérifier un compte bancaire par son numéro"""
    numero_compte = request.data.get("numero_compte")

    if not numero_compte:
        return Response({"error": "Numéro de compte requis"}, status=400)

    try:
        compte = CompteBancaire.objects.get(
            numero_compte=numero_compte, statut="approuve"
        )
        # Retourner uniquement les informations nécessaires pour la vérification
        return Response(
            {
                "id": compte.id,
                "type": compte.utilisateur.role,
                "numero_compte": compte.numero_compte,
                "nom_proprietaire": compte.utilisateur.last_name,
                "prenom_proprietaire": compte.utilisateur.first_name,
            }
        )
    except CompteBancaire.DoesNotExist:
        return Response({"error": "Compte non trouvé ou non approuvé"}, status=404)


class Epargne(APIView):
    def post(self, request):
        compte_id = request.data.get("compte")
        montant = request.data.get("montant")
        montant = Decimal(montant)
        compte_epargne = request.data.get("compte_epargne")

        if compte_id and montant and compte_epargne:
            compte = CompteBancaire.objects.get(id=compte_id)
            if compte.solde < montant:
                return Response(
                    {"detail": "Solde insuffisant pour effectuer ce virement"}
                )
            compte.solde -= montant
            compte.save()

            compte_epargne = CompteBancaire.objects.get(id=compte_epargne)
            compte_epargne.solde += montant
            compte_epargne.save()

            Transaction.objects.create(
                compte_source=compte,
                type="transfert",
                compte_destination=compte_epargne,
                montant=montant,
                status="succès",
                commentaire=f"Epargne effectué, montant: {montant}, date {datetime.now()}",
            )

            return Response({"detail": "Epargne effectué avec succès"})
        else:
            return Response({"detail": "Tous les champs sont requis."}, status=400)


class UserInfo(APIView):
    def get(self, request):
        user = request.user
        serializer = UtilisateurSerializer(user)
        return Response(serializer.data)
