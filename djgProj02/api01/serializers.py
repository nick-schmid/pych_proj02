from api01.models import IC
from rest_framework import serializers


class ICSerializer(serializers.ModelSerializer):
    class Meta:
        model = IC
        fields = ['number', 'desc', 'timestamp', 'protected']

