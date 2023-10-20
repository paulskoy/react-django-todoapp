from django.db import models

from login.models import User

class Task(models.Model):
    task_taskname = models.TextField(null=False)
    user_username = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_table'