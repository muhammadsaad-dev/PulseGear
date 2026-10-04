from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from base.models import Product, Order, OrderItem, ShippingAddress


class OrderOperationTests(APITestCase):
    def setUp(self):
        self.regular_user = User.objects.create_user(
            username='buyer@example.com',
            email='buyer@example.com',
            first_name='Buyer',
            password='password123'
        )
        self.other_user = User.objects.create_user(
            username='other@example.com',
            email='other@example.com',
            first_name='Other',
            password='password123'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            first_name='Admin',
            password='adminpassword123'
        )
        self.in_stock_product = Product.objects.create(
            user=self.admin_user,
            name='Mechanical Gaming Keyboard',
            price=120.00,
            countInStock=5,
            brand='Keychron',
            category='Electronics'
        )

    def test_add_order_items_success(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {
            'orderItems': [
                {
                    'product': self.in_stock_product._id,
                    'name': self.in_stock_product.name,
                    'qty': 2,
                    'price': 120.00,
                    'image': '/images/keyboard.jpg'
                }
            ],
            'shippingAddress': {
                'address': '123 Tech Lane',
                'city': 'San Francisco',
                'postalCode': '94105',
                'country': 'USA'
            },
            'paymentMethod': 'Stripe',
            'shippingPrice': 10.00
        }

        response = self.client.post('/api/orders/add/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_id = response.data['_id']

        # Verify order created in DB
        order = Order.objects.get(_id=order_id)
        self.assertEqual(order.user, self.regular_user)
        self.assertEqual(order.orderitem_set.count(), 1)

        # Verify stock was deducted atomically (5 - 2 = 3)
        self.in_stock_product.refresh_from_db()
        self.assertEqual(self.in_stock_product.countInStock, 3)

        # Verify shipping address created
        self.assertTrue(ShippingAddress.objects.filter(order=order).exists())

    def test_add_order_insufficient_stock_fails(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {
            'orderItems': [
                {
                    'product': self.in_stock_product._id,
                    'name': self.in_stock_product.name,
                    'qty': 10,  # Only 5 in stock
                    'price': 120.00,
                }
            ],
            'shippingAddress': {'address': '123 Main', 'city': 'SF', 'postalCode': '94105', 'country': 'USA'},
            'paymentMethod': 'Stripe',
        }

        response = self.client.post('/api/orders/add/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('insufficient stock', response.data['detail'].lower())

        # Verify stock untouched
        self.in_stock_product.refresh_from_db()
        self.assertEqual(self.in_stock_product.countInStock, 5)

    def test_add_order_empty_items_fails(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {
            'orderItems': [],
            'shippingAddress': {'address': '123 Main', 'city': 'SF', 'postalCode': '94105', 'country': 'USA'},
            'paymentMethod': 'Stripe',
        }

        response = self.client.post('/api/orders/add/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_order_by_id_owner(self):
        self.client.force_authenticate(user=self.regular_user)
        order = Order.objects.create(
            user=self.regular_user,
            paymentMethod='Stripe',
            totalPrice=120.00
        )
        response = self.client.get(f'/api/orders/{order._id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['_id'], order._id)

    def test_get_order_by_id_unauthorized_other_user(self):
        order = Order.objects.create(
            user=self.regular_user,
            paymentMethod='Stripe',
            totalPrice=120.00
        )
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f'/api/orders/{order._id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_my_orders(self):
        self.client.force_authenticate(user=self.regular_user)
        Order.objects.create(user=self.regular_user, paymentMethod='Stripe', totalPrice=50.00)
        Order.objects.create(user=self.regular_user, paymentMethod='Stripe', totalPrice=75.00)

        response = self.client.get('/api/orders/myorders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_stripe_payment_intent(self):
        self.client.force_authenticate(user=self.regular_user)
        order = Order.objects.create(
            user=self.regular_user,
            paymentMethod='Stripe',
            totalPrice=150.00
        )

        mock_stripe = MagicMock()
        mock_stripe.PaymentIntent.create.return_value = {
            'client_secret': 'pi_test_secret_12345'
        }

        with patch('base.views.order_views.stripe', mock_stripe):
            response = self.client.post(f'/api/orders/{order._id}/stripe-intent/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['clientSecret'], 'pi_test_secret_12345')

    def test_stripe_webhook_marks_order_paid(self):
        order = Order.objects.create(
            user=self.regular_user,
            paymentMethod='Stripe',
            totalPrice=99.00,
            isPaid=False
        )

        webhook_payload = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'metadata': {
                        'order_id': order._id
                    }
                }
            }
        }

        response = self.client.post('/api/orders/stripe-webhook/', webhook_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertTrue(order.isPaid)
        self.assertIsNotNone(order.paidAt)
