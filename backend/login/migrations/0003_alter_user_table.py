# Generated by Django 4.2.5 on 2023-10-09 11:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0002_alter_user_table'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='user',
            table='user_table',
        ),
    ]
