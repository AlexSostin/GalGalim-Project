from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Bike
from .serializers import BikeSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_listings(request):
    listings = Bike.objects.filter(user=request.user)
    serializer = BikeSerializer(listings, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    data = request.data.copy()
    data['user'] = request.user.id
    serializer = BikeSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        listing = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)