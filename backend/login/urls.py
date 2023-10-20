from django.urls import path

from . import views

urlpatterns = [
    path('createuser', views.create_user),
    path('verifyuser', views.verify_user),
    path('verifyaccesstoken', views.verify_access_token),
    path('verifyrefreshtoken', views.verify_refresh_token),
]