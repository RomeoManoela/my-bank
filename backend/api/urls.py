from django.urls import path

from . import views

urlpatterns = [
    # Authentification
    path("inscription/", views.InscriptionUtilisateur.as_view(), name="inscription"),
    path("token/", views.TokenObtainPersonnalisee.as_view(), name="token_obtain"),
    path(
        "token/refresh/",
        views.RefreshTokenPersonnalisee.as_view(),
        name="token_refresh",
    ),
    # Comptes bancaires
    path("comptes/", views.ListeComptesBancaires.as_view(), name="liste-comptes"),
    path("comptes/creer/", views.CreationCompteBancaire.as_view(), name="creer-compte"),
    path(
        "comptes/<int:pk>/",
        views.DetailCompteBancaireClient.as_view(),
        name="detail-compte",
    ),
    # Prêts
    path("prets/", views.ListePret.as_view(), name="liste-prets"),
    path("prets/demander/", views.FaireUnPret.as_view(), name="demander-pret"),
    path(
        "prets/<int:pk>/rembourser/",
        views.RembourserPret.as_view(),
        name="rembourser-pret",
    ),
    path(
        "prets/<int:pk>/approuver/",
        views.ApprouverRejeterPret.as_view(),
        name="approuver-rejeter-pret",
    ),
    # Transactions
    path(
        "transactions/",
        views.EffectuerTransaction.as_view(),
        name="effectuer-transaction",
    ),
    path(
        "transactions/<int:pk>/approuver/",
        views.ApprouverRejeterVirement.as_view(),
        name="approuver-rejeter-virement",
    ),
]
