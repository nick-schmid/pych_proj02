from django.shortcuts import render
from .forms import  LoginForm
from django.contrib.auth import authenticate, login, logout


# Create your views here.
def login_user(request):
    if request.method == 'POST':
        # submit logic here
        return

    else:
        form = LoginForm()
        return render(request, "login_user/login_user.html", {'form': form})
