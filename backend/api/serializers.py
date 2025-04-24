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
        compte = CompteBancaire.objects.create(**validated_data)
        return compte


class CompteBancaireApprovalSerializer(serializers.ModelSerializer):
    """Serializer pour approuver ou rejeter un compte bancaire"""

    class Meta:
        model = CompteBancaire
        fields = ["id", "statut"]

    def validate_statut(self, value):
        valid_statuses = ["approuve", "rejete"]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Le statut doit être l'un des suivants : {', '.join(valid_statuses)}"
            )
        return value

    def update(self, instance, validated_data):
        instance.statut = validated_data.get("statut", instance.statut)
        instance.save()
        return instance


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer pour les transactions"""

    source_numero = serializers.ReadOnlyField(source="compte_source.numero_compte")
    destination_numero = serializers.ReadOnlyField(
        source="compte_destination.numero_compte"
    )
    # Renommer le champ pour qu'il corresponde à ce qui est envoyé depuis le frontend
    compte_destination = serializers.PrimaryKeyRelatedField(
        queryset=CompteBancaire.objects.filter(statut="approuve"),
        required=False,
        write_only=True,
    )
    date = serializers.ReadOnlyField(source="date_transaction")

    # Ajoutez cette méthode pour déboguer les erreurs de validation
    def validate(self, attrs):
        print("Validation des données:", attrs)
        try:
            # Valider que pour un virement, un compte destinataire est fourni
            if attrs.get("type") == "virement" and "compte_destination" not in attrs:
                raise serializers.ValidationError(
                    "Un compte destinataire est requis pour un virement"
                )

            # Valider que le compte source et destinataire sont différents
            if attrs.get("type") == "virement" and attrs.get(
                "compte_source"
            ) == attrs.get("compte_destination"):
                raise serializers.ValidationError(
                    "Le compte source et destinataire ne peuvent pas être identiques"
                )

            return attrs
        except Exception as e:
            print("Erreur de validation:", str(e))
            raise

    class Meta:
        model = Transaction
        fields = [
            "id",
            "compte_source",
            "compte_destination",
            "type",
            "montant",
            "date",
            "date_transaction",
            "status",
            "commentaire",
            "source_numero",
            "destination_numero",
        ]
        read_only_fields = ["id", "date_transaction"]

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à zéro.")
        return value

    def create(self, validated_data):
        compte_source = validated_data.get("compte_source")
        compte_destination = validated_data.get("compte_destination")
        montant = validated_data.get("montant")

        # Vérifier que le compte destination existe pour les virements
        if validated_data.get("type") == "transfert" and not compte_destination:
            raise serializers.ValidationError(
                "Compte destinataire requis pour un virement"
            )

        transaction = Transaction.objects.create(**validated_data)
        return transaction


class PretSerializer(serializers.ModelSerializer):
    """Serializer pour les prêts"""

    compte_numero = serializers.ReadOnlyField(
        source="compte.numero_compte", read_only=True
    )
    utilisateur_nom = serializers.ReadOnlyField(
        source="compte.utilisateur.username", read_only=True
    )

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
        read_only_fields = [
            "date_demande",
            "date_remboursement",
            "utilisateur_nom",
            "compte_numero",
        ]

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Le montant du prêt doit être supérieur à zéro."
            )
        return value
