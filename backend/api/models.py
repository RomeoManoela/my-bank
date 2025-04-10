from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    CHOIX_ROLE = (
        ("client", "Client"),
        ("admin", "Admin"),
        ("caissier", "Caissier"),
    )
    role = models.CharField(max_length=20, choices=CHOIX_ROLE, default="client")
    photo = models.ImageField(upload_to="photos", blank=True, null=True)
    cin = models.ImageField(upload_to="CIN", blank=True, null=True)
    date_inscription = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-date_inscription"]


class CompteBancaire(models.Model):
    CHOIX_TYPE = (
        ("courant", "Compte Courant"),
        ("epargne", "Compte Épargne"),
    )

    STATUT_CHOICES = (
        ("en_attente", "En attente d'approbation"),
        ("approuve", "Approuvé"),
        ("rejete", "Rejeté"),
    )

    utilisateur = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name="comptes"
    )
    numero_compte = models.CharField(max_length=20, unique=True)
    type_compte = models.CharField(max_length=20, choices=CHOIX_TYPE)
    attestation_emploi = models.FileField(
        upload_to="attestations", blank=True, null=True
    )
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_ouverture = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(
        max_length=20, choices=STATUT_CHOICES, default="en_attente"
    )
    commentaire_admin = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Compte {self.numero_compte} - {self.utilisateur.username}"

    class Meta:
        verbose_name = "Compte Bancaire"
        verbose_name_plural = "Comptes Bancaires"


class Pret(models.Model):
    CHOIX_STATUT = (
        ("en_cours", "En cours"),
        ("rembourse", "Remboursé"),
        ("rejeté", "Rejeté"),
        ("en_attente", "En attente"),
    )
    compte = models.ForeignKey(
        CompteBancaire, on_delete=models.CASCADE, related_name="prets"
    )
    motif = models.CharField(max_length=100)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=CHOIX_STATUT, default="en_attente")
    date_demande = models.DateTimeField(auto_now_add=True)
    date_remboursement = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.compte.numero_compte} - {self.montant} - {self.get_statut_display()}"

    class Meta:
        verbose_name = "Prêt"
        verbose_name_plural = "Prêts"


class Transaction(models.Model):
    CHOIX_TYPE_TRANSACTION = (
        ("depot", "Dépôt"),
        ("retrait", "Retrait"),
        ("transfert", "Transfert"),
        ("pret", "Prêt"),
    )
    CHOIX_STATUS = (("succès", "Succès"), ("échoué", "Échoué"))

    compte_source = models.ForeignKey(
        CompteBancaire, on_delete=models.CASCADE, related_name="transactions_source"
    )
    compte_destination = models.ForeignKey(
        CompteBancaire,
        on_delete=models.CASCADE,
        related_name="transactions_destination",
        blank=True,
        null=True,
    )
    type = models.CharField(max_length=20, choices=CHOIX_TYPE_TRANSACTION)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=CHOIX_STATUS)
    date_transaction = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.montant} - {self.date_transaction}"

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
