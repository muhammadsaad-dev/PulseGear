from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from base.models import Product, Review
from base.serializers import ProductSerializer

from rest_framework import status


from django.db.models import Q


@api_view(['GET'])
def getProducts(request):
    """
    List products with multi-field search, filtering, sorting, and pagination.
    """
    query = request.query_params.get('keyword', '')
    category = request.query_params.get('category', '')
    brand = request.query_params.get('brand', '')
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')
    in_stock = request.query_params.get('in_stock')
    sort_by = request.query_params.get('sort_by', 'newest')

    products = Product.objects.all()

    # Search keyword
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(brand__icontains=query) |
            Q(category__icontains=query)
        )

    # Filter by category
    if category:
        products = products.filter(category__iexact=category)

    # Filter by brand
    if brand:
        products = products.filter(brand__iexact=brand)

    # Filter by price
    if min_price:
        try:
            products = products.filter(price__gte=float(min_price))
        except ValueError:
            pass

    if max_price:
        try:
            products = products.filter(price__lte=float(max_price))
        except ValueError:
            pass

    # Filter by stock
    if in_stock in ['true', 'True', '1']:
        products = products.filter(countInStock__gt=0)

    # Sorting
    if sort_by == 'price_asc':
        products = products.order_by('price')
    elif sort_by == 'price_desc':
        products = products.order_by('-price')
    elif sort_by == 'rating_desc':
        products = products.order_by('-rating', '-numReviews')
    elif sort_by == 'oldest':
        products = products.order_by('createdAt')
    else:
        # Default: newest first
        products = products.order_by('-createdAt')

    page = request.query_params.get('page', 1)
    page_size = request.query_params.get('page_size', 8)
    try:
        page_size = int(page_size)
    except (ValueError, TypeError):
        page_size = 8

    paginator = Paginator(products, page_size)

    try:
        products_page = paginator.page(page)
    except PageNotAnInteger:
        products_page = paginator.page(1)
        page = 1
    except EmptyPage:
        products_page = paginator.page(paginator.num_pages)
        page = paginator.num_pages

    serializer = ProductSerializer(products_page, many=True)
    return Response({
        'products': serializer.data,
        'page': int(page),
        'pages': paginator.num_pages,
        'count': paginator.count
    })


@api_view(['GET'])
def getTopProducts(request):
    """
    Get top rated products for hero/showcase.
    """
    products = Product.objects.filter(rating__gte=4).order_by('-rating')[0:5]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getProduct(request, pk):
    """
    Retrieve product details by ID.
    """
    try:
        product = Product.objects.get(_id=pk)
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user

    product = Product.objects.create(
        user=user,
        name='Sample Name',
        price=0,
        brand='Sample Brand',
        countInStock=0,
        category='Sample Category',
        description=''
    )

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
        data = request.data

        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.brand = data.get('brand', product.brand)
        product.countInStock = data.get('countInStock', product.countInStock)
        product.category = data.get('category', product.category)
        product.description = data.get('description', product.description)

        product.save()

        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
        product.delete()
        return Response('Product Deleted', status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def uploadImage(request):
    try:
        data = request.data
        product_id = data['product_id']
        product = Product.objects.get(_id=product_id)

        product.image = request.FILES.get('image')
        product.save()

        return Response('Image was uploaded', status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data

    # 1 - Review already exists
    alreadyExists = product.review_set.filter(user=user).exists()
    if alreadyExists:
        return Response({'detail': 'Product already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    # 2 - No Rating or 0
    rating_val = int(data.get('rating', 0))
    if rating_val == 0:
        return Response({'detail': 'Please select a rating'}, status=status.HTTP_400_BAD_REQUEST)

    # 3 - Create review
    Review.objects.create(
        user=user,
        product=product,
        name=user.first_name or user.username,
        rating=rating_val,
        comment=data.get('comment', ''),
    )

    reviews = product.review_set.all()
    product.numReviews = len(reviews)

    total = sum([r.rating for r in reviews])
    product.rating = total / len(reviews) if len(reviews) > 0 else 0
    product.save()

    return Response('Review Added', status=status.HTTP_201_CREATED)
