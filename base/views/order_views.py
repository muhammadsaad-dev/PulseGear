from django.shortcuts import render
from django.db import transaction
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from decimal import Decimal

try:
    import stripe
except ImportError:
    stripe = None

from base.models import Product, Order, OrderItem, ShippingAddress
from base.serializers import ProductSerializer, OrderSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    user = request.user
    data = request.data

    orderItems = data.get('orderItems')

    if not orderItems or len(orderItems) == 0:
        return Response({'detail': 'No Order Items provided'}, status=status.HTTP_400_BAD_REQUEST)

    shipping_info = data.get('shippingAddress', {})
    if not shipping_info.get('address') or not shipping_info.get('city'):
        return Response({'detail': 'Incomplete shipping address'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Atomic Transaction with Row Locking to prevent stock overselling
        with transaction.atomic():
            # 1. Validate stock and calculate verified server price
            locked_products = []
            verified_items_price = Decimal('0.00')

            for i in orderItems:
                try:
                    product = Product.objects.select_for_update().get(_id=i['product'])
                except Product.DoesNotExist:
                    return Response({'detail': f"Product {i.get('name', 'Item')} does not exist"}, status=status.HTTP_404_NOT_FOUND)

                requested_qty = int(i.get('qty', 1))

                if product.countInStock < requested_qty:
                    return Response(
                        {'detail': f"Insufficient stock for '{product.name}'. Only {product.countInStock} units remaining."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                verified_items_price += Decimal(str(product.price)) * requested_qty
                locked_products.append((product, requested_qty, product.price))

            # 2. Server-calculated shipping and tax
            shipping_price = Decimal('0.00') if verified_items_price > Decimal('100.00') else Decimal('10.00')
            tax_price = (verified_items_price * Decimal('0.082')).quantize(Decimal('0.01'))
            total_price = verified_items_price + shipping_price + tax_price

            # 3. Create Order
            order = Order.objects.create(
                user=user,
                paymentMethod=data.get('paymentMethod', 'PayPal'),
                taxPrice=tax_price,
                shippingPrice=shipping_price,
                totalPrice=total_price
            )

            # 4. Create Shipping Address
            ShippingAddress.objects.create(
                order=order,
                address=shipping_info.get('address'),
                city=shipping_info.get('city'),
                postalCode=shipping_info.get('postalCode', ''),
                country=shipping_info.get('country', ''),
            )

            # 5. Create OrderItems & Safely Deduct Stock
            for product, qty, price in locked_products:
                OrderItem.objects.create(
                    product=product,
                    order=order,
                    name=product.name,
                    qty=qty,
                    price=price,
                    image=product.image.url if product.image else '/placeholder.png',
                )

                product.countInStock -= qty
                product.save()

            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all().order_by('-createdAt')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders = Order.objects.all().order_by('-createdAt')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user

    try:
        order = Order.objects.get(_id=pk)
        if user.is_staff or order.user == user:
            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data)
        else:
            return Response({'detail': 'Not authorized to view this order'}, status=status.HTTP_403_FORBIDDEN)
    except Order.DoesNotExist:
        return Response({'detail': 'Order does not exist'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    try:
        order = Order.objects.get(_id=pk)
        order.isPaid = True
        order.paidAt = timezone.now()
        order.save()
        return Response('Order was paid', status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createStripePaymentIntent(request, pk):
    user = request.user

    try:
        order = Order.objects.get(_id=pk)
        if not (user.is_staff or order.user == user):
            return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if not stripe:
            return Response({'detail': 'Stripe library is not installed on the server'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Amount in cents
        amount_cents = int(Decimal(str(order.totalPrice)) * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            metadata={
                'order_id': str(order._id),
                'user_email': user.email,
            },
            automatic_payment_methods={'enabled': True},
        )

        return Response({
            'clientSecret': intent['client_secret'],
            'publishableKey': getattr(settings, 'STRIPE_PUBLIC_KEY', '')
        })
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def stripeWebhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    event = None

    if stripe and webhook_secret and sig_header:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    elif stripe and hasattr(stripe, 'Event'):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            event = stripe.Event.construct_from(request.data, stripe.api_key)
        except Exception:
            event = request.data
    else:
        event = request.data

    # Handle payment success
    if isinstance(event, dict) and event.get('type') == 'payment_intent.succeeded':
        payment_intent = event.get('data', {}).get('object', {})
        order_id = payment_intent.get('metadata', {}).get('order_id')

        if order_id:
            try:
                order = Order.objects.get(_id=order_id)
                order.isPaid = True
                order.paidAt = timezone.now()
                order.save()
            except Order.DoesNotExist:
                pass

    return Response({'status': 'success'}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    try:
        order = Order.objects.get(_id=pk)
        order.isDelivered = True
        order.deliveredAt = timezone.now()
        order.save()
        return Response('Order was delivered', status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
