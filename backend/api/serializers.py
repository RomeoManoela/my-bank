import uuid

from rest_framework import serializers

from .models import CompteBancaire, Utilisateur, Transaction, Pret


class CompteBancaireListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les comptes bancaires"""

    class Meta:
        model = CompteBancaire
        fields = ["id", "numero_compte", "type_compte", "solde"]


class UtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""

    comptes = CompteBancaireListSerializer(many=True, read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "photo",
            "cin",
            "date_inscription",
            "comptes",
            "password",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "date_inscription": {"read_only": True},
        }

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        if "password" in validated_data:
            password = validated_data.pop("password")
            instance.set_password(password)
        return super().update(instance, validated_data)


class CompteBancaireSerializer(serializers.ModelSerializer):
    """Serializer pour les comptes bancaires"""

    utilisateur_username = serializers.ReadOnlyField(source="utilisateur.username")

    class Meta:
        model = CompteBancaire
        fields = [
            "id",
            "utilisateur",
            "utilisateur_username",
            "numero_compte",
            "type_compte",
            "attestation_emploi",
            "solde",
            "date_ouverture",
            "statut",
        ]
        read_only_fields = ["numero_compte", "date_ouverture", "utilisateur"]

    def validate_solde(self, value):
        if value < 0:
            raise serializers.ValidationError("Le solde ne peut pas être négatif.")
        return value

    def create(self, validated_data):
        num_uuid = uuid.uuid4()
        numero_compte = f"MyBank-{str(num_uuid)[:8]}-{validated_data["utilisateur"].id}"

        validated_data["numero_compte"] = numero_compte
        validated_data["statut"] = "en_attente"

        compte = CompteBancaire.objects.create(**validated_data)
        return compte


class CompteBancaireApprovalSerializer(serializers.ModelSerializer):
    """Serializer pour approuver ou rejeter un compte bancaire"""

    class Meta:
        model = CompteBancaire
        fields = ["id", "statut", "commentaire_admin"]

    def validate_statut(self, value):
        valid_statuses = ["approuve", "rejete"]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Le statut doit être l'un des suivants : {', '.join(valid_statuses)}"
            )
        return value

    def update(self, instance, validated_data):
        instance.statut = validated_data.get("statut", instance.statut)
        instance.commentaire_admin = validated_data.get(
            "commentaire_admin", instance.commentaire_admin
        )
        instance.save()
        return instance


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer pour les transactions"""

    source_numero = serializers.ReadOnlyField(source="compte_source.numero_compte")
    destination_numero = serializers.ReadOnlyField(
        source="compte_destination.numero_compte"
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "compte_source",
            "source_numero",
            "compte_destination",
            "destination_numero",
            "type",
            "montant",
            "status",
            "date_transaction",
        ]
        read_only_fields = ["date_transaction", "status"]

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à zéro.")
        return value

    def validate(self, data):
        if "compte_source" in data and "montant" in data:
            if data["compte_source"].solde < data["montant"]:
                raise serializers.ValidationError(
                    "Solde insuffisant pour effectuer cette transaction."
                )
        if data["type"] == "transfert" and not data.get("compte_destination"):
            raise serializers.ValidationError(
                "La destination est requise pour un transfert."
            )

        return data

    def create(self, validated_data):

        compte_source = validated_data.get("compte_source")
        compte_destination = validated_data.get("compte_destination")
        montant = validated_data.get("montant")

        compte_source.solde -= montant
        compte_destination.solde += montant

        compte_source.save()
        compte_destination.save()

        validated_data["status"] = "succès"
        transaction = Transaction.objects.create(**validated_data)
        return transaction


class PretSerializer(serializers.ModelSerializer):
    """Serializer pour les prêts"""

    compte_numero = serializers.ReadOnlyField(source="compte.numero_compte")
    utilisateur_nom = serializers.ReadOnlyField(source="compte.utilisateur.username")

    class Meta:
        model = Pret
        fields = [
            "id",
            "compte",
            "compte_numero",
            "utilisateur_nom",
            "motif",
            "montant",
            "statut",
            "date_demande",
            "date_remboursement",
        ]
        read_only_fields = ["date_demande", "date_remboursement"]

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Le montant du prêt doit être supérieur à zéro."
            )
        return value

    def validate(self, data):
        if "compte" in data and "montant" in data:
            solde = data["compte"].solde
            if data["montant"] > (solde * 10):
                raise serializers.ValidationError(
                    "Le montant du prêt ne peut pas dépasser 10 fois le solde du compte."
                )
        return data
