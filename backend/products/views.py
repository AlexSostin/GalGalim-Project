from django.shortcuts import get_object_or_404
from .models import Bike, Category, Cart, CartItem, Order, SavedBike, Chat, Message
from .serializers import BikeSerializer, CategorySerializer, ChatSerializer, MessageSerializer
from django.http import JsonResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.filters import SearchFilter
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer, UserSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

User = get_user_model()

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class BikeList(generics.ListAPIView):
    queryset = Bike.objects.all()
    serializer_class = BikeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Получаем параметры фильтрации
        params = self.request.query_params
        bike_type = params.get('bike_type')
        condition = params.get('condition')
        price_min = params.get('min_price')
        price_max = params.get('max_price')
        frame_size = params.get('frame_size')
        wheel_size = params.get('wheel_size')
        search_query = params.get('search')

        # Применяем фильтры
        if bike_type:
            queryset = queryset.filter(bike_type__iexact=bike_type)
        if condition:
            queryset = queryset.filter(condition__iexact=condition)
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        if frame_size:
            queryset = queryset.filter(frame_size__iexact=frame_size)
        if wheel_size:
            queryset = queryset.filter(wheel_size__iexact=wheel_size)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(brand__icontains=search_query) |
                Q(model__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(city__icontains=search_query)
            )

        return queryset.order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

def add_to_cart(request, bike_id):
    bike = get_object_or_404(Bike, id=bike_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, bike=bike)
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    return redirect('bike_list')  # Перенаправление на страницу со списком велосипедов

def view_cart(request):
    cart = get_object_or_404(Cart, user=request.user)
    items = [
        {
            'id': item.id,
            'bike': {
                'name': item.bike.name,
                'price': item.bike.price,
            },
            'quantity': item.quantity,
        }
        for item in cart.items.all()
    ]
    return JsonResponse(items, safe=False)

def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    cart_item.delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def login_view(request):
    print("\n=== Login attempt started ===")
    print(f"Request method: {request.method}")
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            print(f"Received login request for username: {username}")
            
            user = authenticate(request, username=username, password=data.get('password'))
            print(f"Authentication result: {'Success' if user else 'Failed'}")
            
            if user is not None:
                login(request, user)
                
                # Создаем токен
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                
                response_data = {
                    'status': 'success',
                    'token': access_token,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'is_superuser': user.is_superuser,
                        'is_staff': user.is_staff,
                        'email': user.email,
                        'role': 'ADMIN' if (user.is_superuser or user.is_staff) else 'USER'
                    }
                }
                print(f"Login successful. Response data: {response_data}")
                return JsonResponse(response_data)
            else:
                error_msg = "Invalid username or password"
                print(f"Login failed: {error_msg}")
                return JsonResponse({
                    'status': 'error',
                    'message': error_msg
                }, status=401)
                
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON: {str(e)}"
            print(f"Error: {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=400)
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(f"Error: {error_msg}")
            return JsonResponse({
                'status': 'error',
                'message': error_msg
            }, status=500)
    
    print("Error: Invalid request method")
    return JsonResponse({
        'status': 'error',
        'message': 'Method not allowed'
    }, status=405)

class BikeViewSet(viewsets.ModelViewSet):
    queryset = Bike.objects.all()
    serializer_class = BikeSerializer
    
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
import json

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received registration data:", data)  # для отладки
            
            # Проверяем пароли
            if data['password'] != data['password2']:
                return JsonResponse({
                    'status': 'error',
                    'errors': {'password': ['Passwords do not match']}
                }, status=400)

            # Проверяем существование пользователя
            if User.objects.filter(username=data['username']).exists():
                return JsonResponse({
                    'status': 'error',
                    'errors': {'username': ['Username already exists']}
                }, status=400)
            
            if User.objects.filter(email=data['email']).exists():
                return JsonResponse({
                    'status': 'error',
                    'errors': {'email': ['Email already exists']}
                }, status=400)
            
            # Создаем пользователя
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                is_staff=False,  # Явно указываем, что это не staff
                is_superuser=False  # Явно указываем, что это не superuser
            )
            
            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'USER'  # Явно указываем роль
                }
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'errors': {'non_field_errors': ['Invalid JSON data']}
            }, status=400)
        except KeyError as e:
            return JsonResponse({
                'status': 'error',
                'errors': {'non_field_errors': [f'Missing required field: {str(e)}']}
            }, status=400)
        except Exception as e:
            print("Registration error:", str(e))  # для отладки
            return JsonResponse({
                'status': 'error',
                'errors': {'non_field_errors': ['Server error occurred']}
            }, status=500)
    
    return JsonResponse({
        'status': 'error',
        'errors': {'non_field_errors': ['Method not allowed']}
    }, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_bike(request):
    try:
        print("Received files:", request.FILES)
        print("Number of images:", len(request.FILES.getlist('images')))
        
        serializer = BikeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            bike = serializer.save(user=request.user)
            print("Created bike images:", [img.image.url for img in bike.images.all()])
            return Response(
                BikeSerializer(bike, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error creating bike: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])  # Изменить с IsAuthenticated на AllowAny
def bike_detail(request, pk):
    try:
        bike = Bike.objects.get(pk=pk)
        serializer = BikeSerializer(bike, context={'request': request})
        return Response(serializer.data)
    except Bike.DoesNotExist:
        return Response(
            {'message': 'Bike not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'message': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_listings(request):
    """Получение всех объявлений текущего пользователя"""
    try:
        print(f"\n=== Getting listings for user: {request.user.username} (ID: {request.user.id}) ===")
        listings = Bike.objects.filter(user=request.user)
        print(f"Found {listings.count()} listings")
        
        # Выводим детали каждого объявления
        for listing in listings:
            print(f"Listing ID: {listing.id}, Name: {listing.name}, User: {listing.user}")
            
        serializer = BikeSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in get_user_listings: {str(e)}")
        return Response(
            {'message': f'Error fetching listings: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    """Создание нового объявления"""
    data = request.data.copy()
    data['user'] = request.user.id
    
    # Обработка изображений
    if 'images' in request.FILES:
        data['image'] = request.FILES['images']
        
    serializer = BikeSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        listing = serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_stats(request):
    now = timezone.now()
    month_ago = now - timedelta(days=30)
    
    # Получаем статистику
    total_listings = Bike.objects.count()
    active_listings = Bike.objects.filter(status='active').count()
    pending_listings = Bike.objects.filter(status='pending').count()
    total_users = User.objects.count()
    new_users = User.objects.filter(date_joined__gte=month_ago).count()
    total_sales = Bike.objects.filter(status='sold').count()
    
    return Response({
        'totalListings': total_listings,
        'activeListings': active_listings,
        'pendingListings': pending_listings,
        'totalUsers': total_users,
        'newUsersThisMonth': new_users,
        'totalSales': total_sales
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_bike(request, pk):
    try:
        bike = Bike.objects.get(pk=pk)
        
        # Проверяем, является ли пользователь владельцем
        if bike.user != request.user and not request.user.is_staff:
            return Response(
                {'message': 'You do not have permission to edit this bike'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Подготавливаем данные
        data = {
            'name': request.data.get('title', bike.name),
            'price': request.data.get('price', bike.price),
            'description': request.data.get('description', bike.description),
            'brand': request.data.get('brand', bike.brand),
            'model': request.data.get('model', bike.model),
            'year': request.data.get('year', bike.year),
            'condition': request.data.get('condition', bike.condition),
            'frame_size': request.data.get('frame_size', bike.frame_size),
            'wheel_size': request.data.get('wheel_size', bike.wheel_size),
            'color': request.data.get('color', bike.color),
            'features': request.data.get('features', bike.features),
            'city': request.data.get('city', bike.city),
            'street': request.data.get('street', bike.street),
            'house_number': request.data.get('house_number', bike.house_number),
            'bike_type': request.data.get('category', bike.bike_type)
        }

        # Обработка изображения
        if 'images' in request.FILES:
            data['image'] = request.FILES['images']

        serializer = BikeSerializer(bike, data=data, partial=True)
        if serializer.is_valid():
            bike = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Bike.DoesNotExist:
        return Response(
            {'message': 'Bike not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders(request):
    try:
        # Здесь нужно создать модель Order, если её ещё нет
        orders = Order.objects.all().order_by('-created_at')
        
        serialized_orders = [{
            'id': order.id,
            'customer': order.user.username,
            'created_at': order.created_at,
            'status': order.status,
            'total': float(order.total),
            'items': [
                {
                    'bike': item.bike.name,
                    'quantity': item.quantity,
                    'price': float(item.price)
                } for item in order.items.all()
            ]
        } for order in orders]
        
        return Response({'orders': serialized_orders})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['GET'])  # Добавьте GET в список разрешенных методов
@permission_classes([IsAuthenticated])
def verify_token(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.name if hasattr(user, 'name') else user.username,
        'role': 'admin' if user.is_staff else 'user',
        'is_active': user.is_active
    })

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    try:
        user = request.user
        
        if request.method == 'GET':
            listings_count = Bike.objects.filter(user=user).count()
            sold_count = Bike.objects.filter(user=user, status='sold').count()
            
            profile_data = {
                'username': user.username,
                'email': user.email,
                'role': 'Administrator' if user.is_staff else 'User',
                'listings_count': listings_count,
                'sold_count': sold_count,
            }
            return Response(profile_data)
        
        elif request.method == 'PUT':
            serializer = UserProfileSerializer(
                user, 
                data=request.data,
                context={'request': request},
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'username': user.username,
                    'email': user.email,
                    'role': 'Administrator' if user.is_staff else 'User',
                    'message': 'Profile updated successfully'
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Error in user_profile: {str(e)}")  # Для отладки
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class ProductSearchView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]  # Только для админов
    filter_backends = [SearchFilter]  # Добавляем поиск
    search_fields = ['name', 'description', 'category']  # Поля для поиска

class AdminUsersList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_user_status(request, pk):  # Изменили user_id на pk
    try:
        user = User.objects.get(pk=pk)
        
        # Проверяем, не пытается ли админ заблокировать сам себя
        if user == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'is_staff': user.is_staff
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user_role(request, pk):  # Изменили user_id на pk
    try:
        user = User.objects.get(pk=pk)  # Изменили id на pk
        
        # Проверяем, не пытается ли админ изменить свою роль
        if user == request.user:
            return Response(
                {'error': 'You cannot change your own role'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        new_role = request.data.get('role')
        user.is_staff = new_role == 'admin'
        user.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'role': 'admin' if user.is_staff else 'user'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error updating user role: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_listings(request):
    listings = Bike.objects.all().select_related('user').order_by('-created_at')
    serializer = BikeListingSerializer(listings, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_listing_status(request, pk):
    try:
        listing = Bike.objects.get(pk=pk)
        new_status = request.data.get('status')
        
        # Проверяем, что статус допустимый
        if new_status in dict(Bike.STATUS_CHOICES):
            listing.status = new_status
            listing.save()
            serializer = BikeListingSerializer(listing)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Bike.DoesNotExist:
        return Response(
            {'error': 'Listing not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_bike(request, pk):
    try:
        print(f"\n=== Delete request for bike {pk} by user {request.user.username} ===")
        bike = Bike.objects.get(pk=pk)
        
        print(f"Bike owner: {bike.user}, Current user: {request.user}")
        print(f"Is staff: {request.user.is_staff}")
        
        # Проверяем права пользователя (владелец или админ)
        if bike.user != request.user and not request.user.is_staff:
            print("Permission denied")
            return Response(
                {'message': 'You do not have permission to delete this bike'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        bike.delete()
        print("Bike deleted successfully")
        return Response(
            {'message': 'Bike deleted successfully'},
            status=status.HTTP_200_OK
        )
        
    except Bike.DoesNotExist:
        print(f"Bike {pk} not found")
        return Response(
            {'message': 'Bike not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error deleting bike: {str(e)}")
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    if request.method == 'GET':
        # Получаем текущие настройки пользователя
        user = request.user
        settings = {
            'email': user.email,
            'notifications': getattr(user, 'notifications', True),
            'language': getattr(user, 'language', 'en'),
            'darkMode': getattr(user, 'dark_mode', False)
        }
        return Response(settings)
        
    elif request.method == 'PUT':
        try:
            user = request.user
            data = request.data
            
            # Обновляем email если он изменился
            if 'email' in data and data['email'] != user.email:
                user.email = data['email']
            
            # Обновляем дополнительные настройки
            if 'notifications' in data:
                user.notifications = data['notifications']
            if 'language' in data:
                user.language = data['language']
            if 'darkMode' in data:
                user.dark_mode = data['darkMode']
                
            user.save()
            
            return Response({
                'message': 'Settings updated successfully',
                'settings': {
                    'email': user.email,
                    'notifications': getattr(user, 'notifications', True),
                    'language': getattr(user, 'language', 'en'),
                    'darkMode': getattr(user, 'dark_mode', False)
                }
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_bikes_list(request):
    try:
        print(f"Fetching saved bikes for user: {request.user.username}")  # Отладочный вывод
        
        saved_bikes = SavedBike.objects.select_related('bike').filter(user=request.user)
        print(f"Found {saved_bikes.count()} saved bikes")  # Отладочный вывод
        
        bikes = [saved.bike for saved in saved_bikes]
        serializer = BikeSerializer(bikes, many=True, context={'request': request})
        
        print(f"Serialized data: {serializer.data}")  # Отладочный вывод
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in saved_bikes_list: {str(e)}")  # Отладочный вывод
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_saved_bike(request, pk):
    try:
        saved_bike = SavedBike.objects.filter(user=request.user, bike_id=pk)
        if saved_bike.exists():
            saved_bike.delete()
            return Response({'message': 'Bike removed from saved'})
        return Response(
            {'error': 'Bike not found in saved'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_saved_bike(request, pk):
    try:
        # Проверяем, существует ли велосипед
        bike = Bike.objects.get(pk=pk)
        
        # Проверяем, не сохранен ли уже этот велосипед
        saved_bike, created = SavedBike.objects.get_or_create(
            user=request.user, 
            bike=bike
        )
        
        print(f"Saved bike for user {request.user.username}: Bike ID {pk}, Created: {created}")  # Отладочный вывод
        
        if created:
            return Response({'message': 'Bike saved successfully'})
        else:
            return Response({'message': 'Bike was already saved'})
            
    except Bike.DoesNotExist:
        return Response(
            {'error': 'Bike not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error saving bike: {str(e)}")  # Отладочный вывод
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    try:
        print("Received data:", request.data)
        seller_id = request.data.get('seller_id')
        bike_id = request.data.get('bike_id')
        
        if not seller_id or not bike_id:
            return Response(
                {'error': 'seller_id and bike_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем, что пользователь не пытается создать чат с самим собой
        if int(seller_id) == request.user.id:
            return Response(
                {'error': 'Cannot create chat with yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем существование продавца и велосипеда
        try:
            seller = User.objects.get(id=seller_id)
            bike = Bike.objects.get(id=bike_id)
        except User.DoesNotExist:
            return Response(
                {'error': f'Seller with id {seller_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Bike.DoesNotExist:
            return Response(
                {'error': f'Bike with id {bike_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем, существует ли уже чат
        existing_chat = Chat.objects.filter(
            Q(buyer=request.user, seller_id=seller_id, bike_id=bike_id) |
            Q(seller=request.user, buyer_id=seller_id, bike_id=bike_id)
        ).first()

        if existing_chat:
            serializer = ChatSerializer(existing_chat, context={'request': request})
            return Response({
                'chat_id': existing_chat.id,
                'message': 'Using existing chat',
                'data': serializer.data
            })

        # Создаем новый чат
        chat = Chat.objects.create(
            buyer=request.user,
            seller_id=seller_id,
            bike_id=bike_id
        )

        serializer = ChatSerializer(chat, context={'request': request})
        return Response({
            'chat_id': chat.id,
            'message': 'New chat created',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error creating chat: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_info(request, chat_id):
    try:
        chat = Chat.objects.get(
            Q(buyer=request.user) | Q(seller=request.user),
            id=chat_id
        )
        other_user = chat.seller if chat.buyer == request.user else chat.buyer
        
        return Response({
            'id': chat.id,
            'bike': {
                'id': chat.bike.id,
                'name': chat.bike.name,
                'image': chat.bike.image.url if chat.bike.image else None
            },
            'other_user': {
                'id': other_user.id,
                'username': other_user.username
            },
            'created_at': chat.created_at
        })
    except Chat.DoesNotExist:
        return Response(
            {'error': 'Chat not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, chat_id):
    try:
        chat = Chat.objects.get(
            Q(buyer=request.user) | Q(seller=request.user),
            id=chat_id
        )
        
        other_user = chat.seller if chat.buyer == request.user else chat.buyer
        
        if request.method == 'GET':
            # Изменяем название параметра с after_id на after
            after = request.GET.get('after', 0)
            
            messages = Message.objects.filter(
                chat=chat,
                id__gt=after  # Используем after вместо after_id
            ).order_by('created_at')
            
            Message.objects.filter(
                chat=chat,
                sender=other_user,
                is_read=False,
                id__gt=after  # Используем after вместо after_id
            ).update(is_read=True)
            
            serializer = MessageSerializer(messages, many=True, context={'request': request})
            return Response(serializer.data)
            
        elif request.method == 'POST':
            serializer = MessageSerializer(data={
                'chat': chat.id,
                'sender': request.user.id,
                'content': request.data.get('content'),
            }, context={'request': request})
            
            if serializer.is_valid():
                message = serializer.save()
                chat.updated_at = timezone.now()
                chat.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Chat.DoesNotExist:
        return Response(
            {'error': 'Chat not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    try:
        chats = Chat.objects.filter(
            Q(buyer=request.user) | Q(seller=request.user)
        ).order_by('-updated_at')
        
        chats_data = []
        for chat in chats:
            other_user = chat.seller if chat.buyer == request.user else chat.buyer
            last_message = Message.objects.filter(chat=chat).order_by('-created_at').first()
            
            # Формируем полный URL для изображения
            bike_image_url = None
            if chat.bike.image:
                bike_image_url = request.build_absolute_uri(chat.bike.image.url)
            
            chats_data.append({
                'id': chat.id,
                'bike': {
                    'id': chat.bike.id,
                    'name': chat.bike.name,
                    'image': bike_image_url,  # Используем полный URL
                },
                'other_user': {
                    'id': other_user.id,
                    'username': other_user.username,
                },
                'last_message': {
                    'content': last_message.content if last_message else None,
                    'created_at': last_message.created_at if last_message else None,
                } if last_message else None,
                'unread_count': Message.objects.filter(
                    chat=chat,
                    sender=other_user,
                    is_read=False
                ).count(),
                'updated_at': chat.updated_at,
            })
        
        return Response(chats_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_messages_count(request):
    try:
        # Получаем все чаты пользователя
        user_chats = Chat.objects.filter(
            Q(buyer=request.user) | Q(seller=request.user)
        )
        
        # Для каждого чата находим другого участника
        total_unread = 0
        for chat in user_chats:
            other_user = chat.seller if chat.buyer == request.user else chat.buyer
            # Считаем непрочитанные сообщения от другого участника
            unread_count = Message.objects.filter(
                chat=chat,
                sender=other_user,
                is_read=False
            ).count()
            total_unread += unread_count
        
        return Response({'count': total_unread})
        
    except Exception as e:
        print(f"Error in get_unread_messages_count: {str(e)}")  # Для отладки
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def bike_list(request):
    try:
        # Существующие параметры
        search_query = request.GET.get('search', '')
        category = request.GET.get('category')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        
        # Новые параметры
        state = request.GET.get('state')
        bike_type = request.GET.get('bike_type')

        bikes = Bike.objects.filter(is_active=True)

        # Поиск по названию и описанию
        if search_query:
            bikes = bikes.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(brand__icontains=search_query)
            )

        # Фильтры
        if category:
            bikes = bikes.filter(category__id=category)
        if min_price:
            bikes = bikes.filter(price__gte=float(min_price))
        if max_price:
            bikes = bikes.filter(price__lte=float(max_price))
        if state:
            bikes = bikes.filter(state=state)
        if bike_type:
            bikes = bikes.filter(bike_type=bike_type)

        # Сортировка
        sort_by = request.GET.get('sort')
        if sort_by == 'price_asc':
            bikes = bikes.order_by('price')
        elif sort_by == 'price_desc':
            bikes = bikes.order_by('-price')
        elif sort_by == 'newest':
            bikes = bikes.order_by('-created_at')
        else:
            bikes = bikes.order_by('-created_at')

        serializer = BikeListSerializer(bikes, many=True, context={'request': request})
        return Response(serializer.data)

    except Exception as e:
        print(f"Error in bike_list: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class BikeAdminAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            bikes = Bike.objects.all()
            serializer = BikeAdminSerializer(bikes, many=True, context={'request': request})  # Добавляем контекст
            return Response(serializer.data)
        except Exception as e:
            print(f"Server error: {str(e)}")  # Логируем ошибку
            return Response({"error": "Internal server error"}, status=500)

class BikeStatusAPIView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        bike = get_object_or_404(Bike, pk=pk)
        bike.is_available = request.data.get('is_available', bike.is_available)
        bike.save()
        return Response(BikeAdminSerializer(bike).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_saved_bike(request, bike_id):
    """Проверяет, сохранен ли велосипед в избранное"""
    try:
        is_saved = SavedBike.objects.filter(
            user=request.user,
            bike_id=bike_id
        ).exists()
        return Response({'is_saved': is_saved})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])  # Изменяем с IsAuthenticated на AllowAny
def get_similar_bikes(request, bike_id):
    """Получает список похожих велосипедов"""
    try:
        bike = Bike.objects.get(id=bike_id)
        similar_bikes = Bike.objects.filter(
            Q(bike_type=bike.bike_type) |
            Q(brand=bike.brand)
        ).exclude(id=bike_id)[:4]
        
        serializer = BikeSerializer(similar_bikes, many=True, context={'request': request})
        return Response(serializer.data)
    except Bike.DoesNotExist:
        return Response(
            {'error': 'Bike not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )