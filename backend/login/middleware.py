from rest_framework.response import Response
from rest_framework.status import HTTP_404_NOT_FOUND

from login import authentication

# middleware is good when you're trying to put verification to all
# of the routes, but u are not good with it yet
# just stick to views for now

def authorization_middleware(get_response):

    def token_verification_middleware(request):
        # this is how you access the authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        res = {}

        # check if the auth header starts with the bearer word
        if auth_header.startswith('Bearer '):
            # split the auth header and just grab the token
            token = auth_header.split()[1]

            # decode the token
            try:
                authentication.decode_access_token(token)
            except:
                # try to find out if the frontend can receive the exception
                return HTTP_404_NOT_FOUND


        response = get_response(request)

        return response

    return token_verification_middleware