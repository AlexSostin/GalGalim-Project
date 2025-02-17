from django.contrib import admin
from .models import Bike, Cart, CartItem

@admin.register(Bike)
class BikeAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'bike_type', 'stock', 'rating', 'created_at')
    list_filter = ('bike_type', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    list_per_page = 20
    readonly_fields = ('created_at',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'get_total_items')
    list_filter = ('created_at',)
    search_fields = ('user__username',)

    def get_total_items(self, obj):
        return obj.items.count()
    get_total_items.short_description = 'Total Items'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'bike', 'quantity')
    list_filter = ('cart__user', 'bike')
    search_fields = ('cart__user__username', 'bike__name')
