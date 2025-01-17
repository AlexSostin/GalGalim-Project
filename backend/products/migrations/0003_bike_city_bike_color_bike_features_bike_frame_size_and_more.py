# Generated by Django 4.2.16 on 2024-12-03 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_bike_bike_type_bike_brand_bike_specs'),
    ]

    operations = [
        migrations.AddField(
            model_name='bike',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='color',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='features',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='frame_size',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='house_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='street',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='bike',
            name='wheel_size',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
