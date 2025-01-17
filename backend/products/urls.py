from django.urls import path, include
from . import views
from .views import (
    BikeList, CategoryList, add_to_cart, view_cart, 
    register, login_view, bike_detail,
    get_user_listings, create_listing, get_admin_stats, 
    update_bike, admin_orders, verify_token, 
    ProductSearchView, AdminUsersList, toggle_user_status, 
    update_user_role, get_user_profile, update_listing_status, delete_bike, user_settings,
    saved_bikes_list, remove_saved_bike, add_saved_bike,
    create_chat, get_chat_info, chat_messages, get_user_chats, create_bike
)

urlpatterns = [
    path('api/bikes/', BikeList.as_view(), name='bike_list'),
    path('api/bikes/<int:pk>/', bike_detail, name='bike_detail'),
    path('api/categories/', CategoryList.as_view(), name='category_list'),
    path('cart/add/<int:bike_id>/', add_to_cart, name='add_to_cart'),
    path('cart/', view_cart, name='view_cart'),
    path('api/register/', register, name='register'),
    path('api/login/', login_view, name='login'),
    path('api/bikes/create/', create_bike, name='create_bike'),
    path('api/listings/', get_user_listings, name='get_user_listings'),
    path('api/listings/create/', create_listing, name='create_listing'),
    path('api/admin/stats/', get_admin_stats, name='admin_stats'),
    path('api/bikes/<int:pk>/update/', update_bike, name='update_bike'),
    path('api/admin/orders/', admin_orders, name='admin_orders'),
    path('api/user/verify-token/', verify_token, name='verify_token'),
    path('api/admin/products/', ProductSearchView.as_view(), name='admin_products'),
    path('api/admin/users/', AdminUsersList.as_view(), name='admin-users'),
    path('api/admin/users/<int:pk>/toggle-status/', toggle_user_status, name='toggle-user-status'),
    path('api/admin/users/<int:pk>/update-role/', update_user_role, name='update-user-role'),
    path('api/user/profile/', get_user_profile, name='user-profile'),
    path('api/admin/listings/<int:pk>/status/', update_listing_status, name='update-listing-status'),
    path('api/bikes/<int:pk>/delete/', delete_bike, name='delete_bike'),
    path('api/user/settings/', user_settings, name='user_settings'),
    path('api/saved-bikes/', saved_bikes_list, name='saved-bikes-list'),
    path('api/saved-bikes/<int:pk>/remove/', remove_saved_bike, name='remove-saved-bike'),
    path('api/saved-bikes/add/<int:pk>/', add_saved_bike, name='add-saved-bike'),
    path('api/chats/create/', create_chat, name='create-chat'),
    path('api/chats/<int:chat_id>/', get_chat_info, name='get-chat-info'),
    path('api/chats/<int:chat_id>/messages/', chat_messages, name='chat-messages'),
    path('api/chats/', get_user_chats, name='get-user-chats'),
    path('api/messages/unread-count/', views.get_unread_messages_count, name='unread-messages-count'),
]

