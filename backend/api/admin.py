from django.contrib import admin

from .models import *

# Register your models here.
admin.site.register(Utilisateur)
admin.site.register(CompteBancaire)
admin.site.register(Pret)
admin.site.register(Transaction)
