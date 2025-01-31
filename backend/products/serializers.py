from rest_framework import serializers
from .models import Bike, Category, Product, Chat, Message, BikeImage
from datetime import datetime
from django.contrib.auth import get_user_model

User = get_user_model()

class BikeSerializer(serializers.ModelSerializer):
    bike_type_display = serializers.SerializerMethodField()
    condition_display = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    seller = serializers.SerializerMethodField()
    images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=True),
        write_only=True,
        required=False
    )
    image_urls = serializers.SerializerMethodField()

    def get_bike_type_display(self, obj):
        choices = [
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
        ]
        return dict(choices).get(obj.bike_type, '')

    def get_condition_display(self, obj):
        choices = [
            ('new', 'New'),
            ('like_new', 'Like New'),
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('needs_repair', 'Needs Repair')
        ]
        return dict(choices).get(obj.condition, '')

    def get_seller(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email
            }
        return None

    def get_image_urls(self, obj):
        request = self.context.get('request')
        if not request:
            return []
        
        urls = []
        
        # Добавляем основное изображение
        if obj.image:
            main_image_url = request.build_absolute_uri(obj.image.url)
            urls.append(main_image_url)
            print(f"Added main image: {main_image_url}")
        
        # Получаем связанные изображения через правильный related_name
        bike_images = obj.additional_images.all()  # Используем additional_images вместо images
        print(f"Found {bike_images.count()} additional images for bike {obj.id}")
        
        # Добавляем дополнительные изображения
        for bike_image in bike_images:
            if bike_image.image:
                additional_url = request.build_absolute_uri(bike_image.image.url)
                urls.append(additional_url)
                print(f"Added additional image: {additional_url}")
        
        return urls

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        print(f"Processing {len(images_data)} images")
        
        # Создаем велосипед
        bike = Bike.objects.create(**validated_data)
        
        # Если есть изображения
        if images_data:
            # Первое изображение делаем основным
            bike.image = images_data[0]
            bike.save()
            print(f"Set main image for bike {bike.id}")
            
            # Остальные сохраняем как дополнительные
            for image_data in images_data[1:]:
                bike_image = BikeImage.objects.create(bike=bike, image=image_data)
                print(f"Created additional image {bike_image.id} for bike {bike.id}")
        
        return bike

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('seller') and instance.user:
            ret['seller'] = self.get_seller(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                ret['image'] = request.build_absolute_uri(instance.image.url)
        return ret

    class Meta:
        model = Bike
        fields = [
            'id', 'name', 'brand', 'model', 'year',
            'price', 'description', 'bike_type', 'bike_type_display',
            'condition', 'condition_display', 'image', 'images', 'image_urls',
            'city', 'status', 'frame_size', 'wheel_size',
            'color', 'features', 'user', 'seller', 'state'
        ]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']
        
class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price',
            'stock', 'image', 'category',
            'created_at', 'updated_at'
        ]

class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    joinDate = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()  # Добавляем это поле

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'status', 'joinDate']

    def get_name(self, obj):
        # Используем username, если это стандартная модель User Django
        return obj.username if hasattr(obj, 'username') else obj.email

    def get_status(self, obj):
        return 'active' if obj.is_active else 'blocked'

    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'user'

    def get_joinDate(self, obj):
        return obj.date_joined.strftime('%Y-%m-%d')

class BikeListSerializer(serializers.ModelSerializer):
    bike_type = serializers.CharField(source='get_bike_type_display')
    condition = serializers.CharField(source='get_condition_display')
    image = serializers.SerializerMethodField()
    seller = serializers.SerializerMethodField()

    def get_seller(self, obj):
        return obj.user.username if obj.user else None

    def get_image(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Bike
        fields = [
            'id', 'name', 'price', 'bike_type', 'condition',
            'image', 'seller', 'city', 'frame_size', 'wheel_size'
        ]

class ChatSerializer(serializers.ModelSerializer):
    unread_messages_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    def get_unread_messages_count(self, obj):
        request_user = self.context['request'].user
        return obj.messages.filter(
            sender__in=[obj.buyer, obj.seller]
        ).exclude(sender=request_user).filter(is_read=False).count()

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'content': last_message.content,
                'created_at': last_message.created_at,
                'sender_id': last_message.sender.id,
                'is_read': last_message.is_read
            }
        return None

    def get_other_user(self, obj):
        request_user = self.context['request'].user
        other_user = obj.buyer if request_user == obj.seller else obj.seller
        return {
            'id': other_user.id,
            'username': other_user.username,
            'email': other_user.email
        } if other_user else None

    class Meta:
        model = Chat
        fields = [
            'id', 'buyer', 'seller', 'bike',
            'created_at', 'updated_at', 'unread_messages_count',
            'last_message', 'other_user'
        ]

class MessageSerializer(serializers.ModelSerializer):
    is_sender = serializers.SerializerMethodField()
    
    def get_is_sender(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'created_at', 'is_read', 'is_sender']
        read_only_fields = ['is_read', 'created_at', 'is_sender']

    def create(self, validated_data):
        message = Message.objects.create(**validated_data)
        return message

# Расширенный сериализатор для детальной информации о чате
class ChatDetailSerializer(serializers.ModelSerializer):
    bike = BikeSerializer()  # Используем существующий BikeSerializer
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'bike', 'other_user', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def get_other_user(self, obj):
        request_user = self.context['request'].user
        other_user = obj.seller if obj.buyer == request_user else obj.buyer
        return {
            'id': other_user.id,
            'username': other_user.username
        }

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'content': last_message.content,
                'created_at': last_message.created_at,
                'is_sender': last_message.sender == self.context['request'].user
            }
        return None

    def get_unread_count(self, obj):
        request_user = self.context['request'].user
        return obj.messages.filter(
            sender__in=[obj.buyer, obj.seller]
        ).exclude(sender=request_user).filter(is_read=False).count()

class BikeAdminSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username
        }

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Bike
        fields = ['id', 'name', 'price', 'user', 'created_at', 'is_available', 'image_url']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']
        read_only_fields = ['email']  # Email нельзя изменить
        
    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value