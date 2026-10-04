from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status


class UserAuthenticationTests(APITestCase):
    def setUp(self):
        self.regular_user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            first_name='John Doe',
            password='password123'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            first_name='Admin User',
            password='adminpassword123'
        )

    def test_register_user_success(self):
        payload = {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post('/api/users/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'jane@example.com')
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(email='jane@example.com').exists())

    def test_register_user_duplicate_email(self):
        payload = {
            'name': 'Duplicate',
            'email': 'user@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/users/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_login_user_success(self):
        payload = {
            'username': 'user@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/users/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], 'user@example.com')

    def test_get_user_profile_authenticated(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'user@example.com')
        self.assertEqual(response.data['name'], 'John Doe')

    def test_get_user_profile_unauthenticated(self):
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_profile(self):
        self.client.force_authenticate(user=self.regular_user)
        payload = {
            'name': 'John Updated',
            'email': 'johnupdated@example.com',
            'password': 'newpassword123'
        }
        response = self.client.put('/api/users/profile/update/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'John Updated')
        self.assertEqual(response.data['email'], 'johnupdated@example.com')
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.first_name, 'John Updated')


class AdminUserManagementTests(APITestCase):
    def setUp(self):
        self.regular_user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            first_name='John Doe',
            password='password123'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            first_name='Admin User',
            password='adminpassword123'
        )

    def test_list_users_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_list_users_as_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/users/delete/{self.regular_user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(id=self.regular_user.id).exists())
