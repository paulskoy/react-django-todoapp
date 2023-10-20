import jwt, datetime #use for token and setting expiration

import os #use to access the env file

from dotenv import load_dotenv #to load the env file

load_dotenv()

def create_access_token(username):

    # create an access token
    return jwt.encode({
        'user_id': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=30),
        'iat': datetime.datetime.utcnow()
    }, os.environ.get('ACCESS_TOKEN'), algorithm='HS256')

def create_refresh_token(username):
    
    # create a refresh token
    return jwt.encode({
        'user_id': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }, os.environ.get('REFRESH_TOKEN'), algorithm='HS256')

def decode_access_token(token):
    # decode the token
    payload = jwt.decode(token, os.environ.get('ACCESS_TOKEN'), algorithms='HS256')

    # return the info
    return payload['user_id']

def decode_refresh_token(token):
    # decode the token
    payload = jwt.decode(token, os.environ.get('REFRESH_TOKEN'), algorithms='HS256')

    # return the info
    return payload['user_id']