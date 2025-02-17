# Generated by Django 4.2.16 on 2025-01-28 19:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0018_alter_bikeimage_bike'),
    ]

    operations = [
        migrations.AddField(
            model_name='bike',
            name='slug',
            field=models.SlugField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='bike',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]
