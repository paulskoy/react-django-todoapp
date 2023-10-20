from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header

from .serializer import UserSerializer

from .models import User

from django.contrib.auth.hashers import make_password, check_password

from . import authentication

# Create your views here.
@api_view(['POST'])
def create_user(request):
    username = request.data['user_username']
    password = request.data['user_password']

    # check if the fields are blank
    if username != "" and password != "":
        # if not check if the user exist
        try:
            User.objects.get(pk=username)

            # send this message if the user exist
            return Response({'message': 'user already exist'})
        except User.DoesNotExist:   
            # if the doesn't user exist create the user

            # hash the password
            hash_pass = make_password(password)

            # store it into a dictionary
            data = {'user_username': username, 'user_password': hash_pass}

            # serialized it
            serialized = UserSerializer(data=data)

            # check if it is valid
            if serialized.is_valid():
                serialized.save()

                # return the reponse
                return Response({'message': 'user is created'})
            
            # return if the user is not valid
            return Response({'message': 'user is not valid'})
    
    # return if the fields are blank
    return Response({'message': 'username and password required'})

@api_view(['POST'])
def verify_user(request):
    username = request.data['user_username']
    password = request.data['user_password']

    # check if the fields are blank
    if username != "" and password != "":
        
        # check if the user exist
        try:
            user = User.objects.get(pk=username)

            serialized = UserSerializer(user)

            # check if the password matched
            if check_password(password, serialized.data['user_password']):
                # create access and refresh token
                access_token = authentication.create_access_token(username)
                refresh_token = authentication.create_refresh_token(username)
                
                return Response({'login': True, 'token': [access_token, refresh_token], 'username': serialized.data['user_username']})
               
            
            return Response({'message': 'the password does not match', 'login': False})

        except User.DoesNotExist:
            return Response({'message': 'user does not exist', 'login': False})
        
    return Response({'message': 'username and password required'})

# switch to bearer method for the JWT

@api_view(['GET'])
def verify_access_token(request):
    # store the header's value
    auth_access = get_authorization_header(request).split()

    # catch if the token expires
    try:

        # verify if auth is not blank and it contains two values
        if auth_access and len(auth_access) == 2:

            # verify if there is a token
            # decode the token and return the user
            access_token = auth_access[1].decode('UTF-8')
            username = authentication.decode_access_token(access_token)

            # if username is not blank
            if username:
                return Response({'messsage': 'user is allow to access', 'remove': False})

            return Response({'message': 'no user', 'remove': False})
            
    except:

        return Response({'message': 'token expire, user is not allow here', 'remove': True})
    
    return Response({'message': 'no token'})

@api_view(['GET'])
def verify_refresh_token(request):
    auth_refresh = get_authorization_header(request).split()

    try:

        # verify if auth is not blank and it contains two values
        if auth_refresh and len(auth_refresh) == 2:

            # verify if there is a token
            # decode the token and return the user
            refresh_token = auth_refresh[1].decode('UTF-8')
            username = authentication.decode_refresh_token(refresh_token)

            # if username is not blank
            if username:
                access_token = authentication.create_access_token(username)
                return Response({'messsage': 'new access token provided', 'token': [access_token, refresh_token], 'remove': False})

            return Response({'message': 'no user', 'remove': False})
            
    except:

        return Response({'message': 'token expire refresh, user is not allow here', 'remove': True})
    
    return Response({'message': 'no token'})

# after u renew the access token by checking if the refresh token
# is not expired, try to search about middleware because we want to
# verify if the user' access token has expire everytime the user
# visits any route, 
    


            