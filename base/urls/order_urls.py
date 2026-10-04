from django.urls import path
from base.views import order_views as views


urlpatterns = [
    path('', views.getOrders, name='orders'),
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='myorders'),
    path('stripe-webhook/', views.stripeWebhook, name='stripe-webhook'),

    path('<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),
    path('<str:pk>/stripe-intent/', views.createStripePaymentIntent, name='order-stripe-intent'),
    path('<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
    path('<str:pk>/', views.getOrderById, name='user-order'),
]
