from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header

from .serializer import TaskSerializer
from login.serializer import UserSerializer

from login import authentication

from .models import Task


# create a views that can perform CRUD
# on todo

@api_view(['GET'])
def get_all_todo(request, username):

   try:
        decoded_username = authentication.decode_refresh_token(username)

        print(decoded_username)

        all_todo = Task.objects.filter(user_username=decoded_username)

        serialized_all_todo = TaskSerializer(all_todo, many=True)
        
        return Response({'data': serialized_all_todo.data})
   except Task.DoesNotExist:
       
       return Response({'message': 'the username does not exist'})
    

@api_view(['POST'])
def add_todo(request):
    decoded_username = authentication.decode_refresh_token(request.data['username'])

    combined_data = {'task_taskname': request.data['todo'], 'user_username': decoded_username}

    # serialize the data
    serialized_new_todo = TaskSerializer(data=combined_data)
    
    # check if the serialized data is valid
    if serialized_new_todo.is_valid():
        # save the data
        serialized_new_todo.save()

        return Response({'message': 'todo successfully added'})

    # if not valid return a response
    return Response({'message': 'data is not valid or todo is blank'})


@api_view(['POST'])
def update_todo(request, todo_id):
    # print(todo_id, request.data)
    try:

        old_todo = Task.objects.get(pk=todo_id)

        # u can use serializer to validate data from the request
        # it doesn't necessarily mean that u can only use serializer with models
        # the serializer we are using is for the task but since our request have
        # a task_taskname field we can serialize it because our serializer have
        # a task_taskname field

        # store the data
        new_todo = request.data['task_taskname']
        
        # validate if the data is not blank
        if len(new_todo) > 0:
            # replace the old task_taskname with the new task_taskname coming
            # from the frontend
            old_todo.task_taskname = request.data['task_taskname']

            # save the data
            old_todo.save()

            # return a response
            return Response({'message': 'todo successfully updated'})

        # return a response
        return Response({'message': 'something went wrong'})
    
    except Task.DoesNotExist:
        # if for some reason it does not exist
        # return a response
        return Response({'message': 'todo does not exist'})

@api_view(['POST'])
def delete_todo(request, todo_id):

    try:
        # get the todo to be deleted
        old_todo = Task.objects.get(pk=todo_id)
        # delete todo
        old_todo.delete()

        return Response({'message': 'todo successfully deleted'})
    
    except Task.DoesNotExist:
        
        return Response({'message': 'todo does not exist'})
