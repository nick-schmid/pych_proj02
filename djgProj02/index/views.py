from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.
def welcome(request):
    return render(request, "index/welcome.html")

def flowsheet(request):
    return render(request, "index/flowsheet.html")