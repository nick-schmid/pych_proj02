from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from api01 import views


urlpatterns = [
    path('ic_list/', views.ic_list),
    path('ic_detail/<int:pk>', views.ic_detail),
]

urlpatterns = format_suffix_patterns(urlpatterns)