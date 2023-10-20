from django.db import models

# Create your models here.
class User(models.Model):
    user_username = models.CharField(primary_key=True, max_length=50)
    user_password = models.CharField(null=False, max_length=100)

    class Meta:
        db_table = 'user_table'