# Generated by Django 4.2.16 on 2025-01-10 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0015_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
    ]
