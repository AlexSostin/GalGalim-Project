from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User

# Create your models here.
class Bike(models.Model):
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='bikes',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    bike_type = models.CharField(max_length=50, choices=[
        ('mountain', 'Mountain Bike'),
        ('road', 'Road Bike'),
        ('city', 'City Bike'),
        ('hybrid', 'Hybrid Bike'),
        ('cruiser', 'Cruiser Bike'),
        ('bmx', 'BMX Bike'),
        ('electric', 'Electric Bike'),
        ('folding', 'Folding Bike'),
        ('touring', 'Touring Bike'),
        ('gravel', 'Gravel Bike'),
        ('cyclocross', 'Cyclocross Bike'),
        ('kids', 'Kids Bike'),
        ('fat', 'Fat Bike'),
        ('track', 'Track/Fixed Gear')
    ], default='mountain', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  
    description = models.TextField()
    specs = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='bikes/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Добавляем поля для локации
    city = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=200, null=True, blank=True)
    house_number = models.CharField(max_length=20, null=True, blank=True)
    
    # Добавляем поля для характеристик велосипеда
    FRAME_SIZES = [
        ('xs', 'XS (13-14")'),
        ('s', 'S (15-16")'),
        ('m', 'M (17-18")'),
        ('l', 'L (19-20")'),
        ('xl', 'XL (21-22")'),
    ]

    WHEEL_SIZES = [
        ('12', '12"'),
        ('16', '16"'),
        ('20', '20"'),
        ('24', '24"'),
        ('26', '26"'),
        ('27.5', '27.5"'),
        ('29', '29"'),
        ('700c', '700c'),
    ]

    FRAME_MATERIAL_CHOICES = [
        ('aluminum', 'Aluminum'),
        ('carbon', 'Carbon'),
        ('steel', 'Steel'),
        ('titanium', 'Titanium'),
        ('chromoly', 'Chromoly'),
    ]

    frame_size = models.CharField(max_length=50, choices=FRAME_SIZES, null=True, blank=True)
    wheel_size = models.CharField(max_length=50, choices=WHEEL_SIZES, null=True, blank=True)
    frame_material = models.CharField(max_length=50, choices=FRAME_MATERIAL_CHOICES, null=True, blank=True)
    color = models.CharField(max_length=50, null=True, blank=True)
    features = models.TextField(null=True, blank=True)  # Для дополнительных характеристик
    year = models.IntegerField(null=True, blank=True)
    model = models.CharField(max_length=100, null=True, blank=True)
    BIKE_STATE_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
    ]
    
    state = models.CharField(
        max_length=10,
        choices=BIKE_STATE_CHOICES,
        default='new',
        db_index=True,
        help_text='Whether the bike is new or used'
    )

    condition = models.CharField(
        max_length=50, 
        choices=[
            ('new', 'New'),
            ('like_new', 'Like New'),
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('needs_repair', 'Needs Repair')
        ],
        default='new',
        help_text='Detailed condition of the bike'
    )

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('reserved', 'Reserved'),
        ('hidden', 'Hidden')
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    def __str__(self):
        return f"{self.brand or ''} - {self.name}"

    def get_full_info(self):
        return f"{self.name} - {self.description} - {self.price} $"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['brand']),
            models.Index(fields=['model']),
            models.Index(fields=['city']),
        ]

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)  # Связь с пользователем
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Корзина пользователя {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.bike.name} в корзине"

class ShippingAddress(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Shipping addresses'

    def __str__(self):
        return f"{self.street}, {self.city}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Добавляем поле для отслеживания обновлений
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending'
    )
    quantity = models.PositiveIntegerField(default=1)  # Добавляем количество
    shipping_address = models.ForeignKey(
        ShippingAddress,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created_at']  # Сортировка по умолчанию

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    def save(self, *args, **kwargs):
        # Автоматически рассчитываем total_amount при сохранении
        if not self.total_amount:
            self.total_amount = self.bike.price * self.quantity
        super().save(*args, **kwargs)
    
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.CharField(max_length=100, choices=[
        ('mountain', 'Mountain Bikes'),
        ('road', 'Road Bikes'),
        ('city', 'City Bikes'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class SavedBike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'bike')  # Предотвращает дублирование сохраненных велосипедов
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.bike.name}"

class Chat(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_chats')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_chats')
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('buyer', 'seller', 'bike')

    def __str__(self):
        return f"Chat between {self.buyer.username} and {self.seller.username} about {self.bike.name}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} in chat {self.chat.id}"

class BikeImage(models.Model):
    bike = models.ForeignKey(
        Bike, 
        related_name='additional_images',
        on_delete=models.CASCADE
    )
    image = models.ImageField(
        upload_to='bikes/',
        verbose_name='Additional Image'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Bike Image'
        verbose_name_plural = 'Bike Images'

    def __str__(self):
        return f"Additional image {self.id} for {self.bike.name}"

