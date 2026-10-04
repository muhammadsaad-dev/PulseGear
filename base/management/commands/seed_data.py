from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from base.models import Product
from base.products import products


class Command(BaseCommand):
    help = 'Seed demo products and default admin account for PulseGear'

    def handle(self, *args, **options):
        # 1. Create or get default admin user
        admin_email = 'admin@pulsegear.com'
        admin_user, created = User.objects.get_or_create(
            username=admin_email,
            defaults={
                'email': admin_email,
                'first_name': 'Admin',
                'last_name': 'PulseGear',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_email} (password: admin123)'))
        else:
            self.stdout.write(f'Admin user {admin_email} already exists.')

        # 2. Seed products
        created_count = 0
        for item in products:
            product, prod_created = Product.objects.get_or_create(
                name=item['name'],
                defaults={
                    'user': admin_user,
                    'image': item['image'],
                    'brand': item['brand'],
                    'category': item['category'],
                    'description': item['description'],
                    'rating': item['rating'],
                    'numReviews': item['numReviews'],
                    'price': item['price'],
                    'countInStock': item['countInStock'],
                }
            )
            if prod_created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} new product(s).'))
