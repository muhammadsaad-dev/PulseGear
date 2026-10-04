from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from base.models import Product, Review


class ProductAPITests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            first_name='Admin',
            password='adminpassword123'
        )
        self.regular_user = User.objects.create_user(
            username='shopper@example.com',
            email='shopper@example.com',
            first_name='Shopper',
            password='password123'
        )

        self.p1 = Product.objects.create(
            user=self.admin_user,
            name='Airpods Wireless Bluetooth Headphones',
            brand='Apple',
            category='Electronics',
            description='Bluetooth technology lets you connect it with compatible devices wirelessly',
            rating=4.5,
            numReviews=12,
            price=89.99,
            countInStock=10
        )
        self.p2 = Product.objects.create(
            user=self.admin_user,
            name='iPhone 11 Pro 256GB Memory',
            brand='Apple',
            category='Electronics',
            description='Introducing the iPhone 11 Pro. A transformative triple-camera system',
            rating=4.8,
            numReviews=8,
            price=599.99,
            countInStock=7
        )
        self.p3 = Product.objects.create(
            user=self.admin_user,
            name='Sony Playstation 4 Pro White Version',
            brand='Sony',
            category='Gaming',
            description='The ultimate home entertainment center starts with PlayStation',
            rating=4.2,
            numReviews=15,
            price=399.99,
            countInStock=0
        )

    def test_get_all_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 3)
        self.assertEqual(response.data['count'], 3)

    def test_search_products_by_keyword(self):
        response = self.client.get('/api/products/?keyword=Sony')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 1)
        self.assertEqual(response.data['products'][0]['name'], 'Sony Playstation 4 Pro White Version')

    def test_filter_products_by_category(self):
        response = self.client.get('/api/products/?category=Electronics')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 2)

    def test_filter_products_by_brand(self):
        response = self.client.get('/api/products/?brand=Apple')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 2)

    def test_filter_products_in_stock(self):
        response = self.client.get('/api/products/?in_stock=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 2)

    def test_filter_products_by_price_range(self):
        response = self.client.get('/api/products/?min_price=100&max_price=500')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 1)
        self.assertEqual(response.data['products'][0]['name'], 'Sony Playstation 4 Pro White Version')

    def test_sort_products_price_asc(self):
        response = self.client.get('/api/products/?sort_by=price_asc')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(p['price']) for p in response.data['products']]
        self.assertEqual(prices, sorted(prices))

    def test_get_single_product_success(self):
        response = self.client.get(f'/api/products/{self.p1._id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.p1.name)

    def test_get_single_product_not_found(self):
        response = self.client.get('/api/products/999999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_product_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/products/create/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Sample Name')
        self.assertTrue(Product.objects.filter(_id=response.data['_id']).exists())

    def test_create_product_as_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post('/api/products/create/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_product_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'name': 'Updated AirPods Max',
            'price': 199.99,
            'brand': 'Apple',
            'countInStock': 15,
            'category': 'Audio',
            'description': 'Premium over-ear headphones'
        }
        response = self.client.put(f'/api/products/update/{self.p1._id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated AirPods Max')
        self.assertEqual(float(response.data['price']), 199.99)

    def test_delete_product_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/products/delete/{self.p1._id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Product.objects.filter(_id=self.p1._id).exists())

    def test_create_review_success(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {
            'rating': 5,
            'comment': 'Exceptional sound quality and seamless pairing!'
        }
        response = self.client.post(f'/api/products/{self.p1._id}/reviews/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Review.objects.filter(product=self.p1, user=self.regular_user).exists())

    def test_duplicate_review_rejected(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {'rating': 5, 'comment': 'First review'}
        self.client.post(f'/api/products/{self.p1._id}/reviews/', payload, format='json')

        # Attempt second review
        response = self.client.post(f'/api/products/{self.p1._id}/reviews/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reviewed', response.data['detail'].lower())
