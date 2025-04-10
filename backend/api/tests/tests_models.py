from decimal import Decimal

# noinspection PyUnresolvedReferences
from api.models import Utilisateur, CompteBancaire, Transaction, Pret
from django.test import TestCase


class UtilisateurModelTests(TestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            role="client",
        )

    def test_utilisateur_creation(self):
        """Test la création d'un utilisateur"""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.role, "client")
        self.assertTrue(isinstance(self.user, Utilisateur))
        self.assertTrue(self.user.date_inscription)

    def test_utilisateur_str(self):
        """Test la représentation string d'un utilisateur"""
        self.assertEqual(str(self.user), "testuser (Client)")


class CompteBancaireModelTests(TestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword"
        )
        self.compte = CompteBancaire.objects.create(
            utilisateur=self.user, type_compte="courant", solde=Decimal("1000.00")
        )

    def test_compte_creation(self):
        """Test la création d'un compte bancaire"""
        self.assertEqual(self.compte.utilisateur, self.user)
        self.assertEqual(self.compte.type_compte, "courant")
        self.assertEqual(self.compte.solde, Decimal("1000.00"))
        self.assertTrue(self.compte.numero_compte)
        print(self.compte.numero_compte)
        self.assertEqual(
            len(self.compte.numero_compte), 18
        )

    def test_compte_str(self):
        """Test la représentation string d'un compte bancaire"""
        expected = f"{self.compte.numero_compte} (testuser)"
        self.assertEqual(str(self.compte), expected)


class TransactionModelTests(TestCase):
    def setUp(self):
        self.user1 = Utilisateur.objects.create_user(
            username="user1", email="user1@example.com", password="password1"
        )
        self.user2 = Utilisateur.objects.create_user(
            username="user2", email="user2@example.com", password="password2"
        )

        self.compte1 = CompteBancaire.objects.create(
            utilisateur=self.user1, type_compte="courant", solde=Decimal("2000.00")
        )
        self.compte2 = CompteBancaire.objects.create(
            utilisateur=self.user2, type_compte="epargne", solde=Decimal("1000.00")
        )

        self.transaction = Transaction.objects.create(
            compte_source=self.compte1,
            compte_destination=self.compte2,
            type="transfert",
            montant=Decimal("500.00"),
            status="succès",
        )

    def test_transaction_creation(self):
        """Test la création d'une transaction"""
        self.assertEqual(self.transaction.compte_source, self.compte1)
        self.assertEqual(self.transaction.compte_destination, self.compte2)
        self.assertEqual(self.transaction.type, "transfert")
        self.assertEqual(self.transaction.montant, Decimal("500.00"))
        self.assertEqual(self.transaction.status, "succès")
        self.assertTrue(self.transaction.date_transaction)

    def test_transaction_str(self):
        """Test la représentation string d'une transaction"""
        expected = f"transfert - 500.00 - {self.transaction.date_transaction}"
        self.assertEqual(str(self.transaction), expected)


class PretModelTests(TestCase):
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            username="emprunteur", email="emprunteur@example.com", password="password"
        )
        self.compte = CompteBancaire.objects.create(
            utilisateur=self.user, type_compte="courant", solde=Decimal("500.00")
        )
        self.pret = Pret.objects.create(
            compte=self.compte,
            motif="Achat voiture",
            montant=Decimal("10000.00"),
            statut="en_attente",
        )

    def test_pret_creation(self):
        """Test la création d'un prêt"""
        self.assertEqual(self.pret.compte, self.compte)
        self.assertEqual(self.pret.motif, "Achat voiture")
        self.assertEqual(self.pret.montant, Decimal("10000.00"))
        self.assertEqual(self.pret.statut, "en_attente")
        self.assertTrue(self.pret.date_demande)
        self.assertIsNone(self.pret.date_remboursement)

    def test_pret_str(self):
        """Test la représentation string d'un prêt"""
        expected = f"{self.compte.numero_compte} - 10000.00 - En attente"
        self.assertEqual(str(self.pret), expected)
