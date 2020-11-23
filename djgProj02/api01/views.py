from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api01.models import IC
from api01.serializers import ICSerializer


@api_view(['GET', 'POST'])
def ic_list(request):
    """
    list all ICs
    :param request:
    :return:
    """
    if request.method == 'GET':
        ics = IC.objects.all();
        serializer = ICSerializer(ics, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ICSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def ic_detail(request, pk):
    """
    Retrieve, update or delete an ic.
    """
    try:
        ic = IC.objects.get(pk=pk)
    except IC.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ICSerializer(ic)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ICSerializer(ic, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        ic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
