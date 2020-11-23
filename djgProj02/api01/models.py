from django.db import models


class IC(models.Model):
    number = models.IntegerField(primary_key=True)
    desc = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    protected = models.BooleanField(default=False)

    class Meta:
        ordering = ['number']
