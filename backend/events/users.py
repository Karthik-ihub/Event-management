from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import bcrypt
import pymongo
import re
import jwt
import json
import datetime
from django.conf import settings
from dotenv import load_dotenv 
import os

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = "mongodb+srv://PKDB:06102003-Pk@cluster0.yqecmgt.mongodb.net/event_management_db?retryWrites=true&w=majority"
client = pymongo.MongoClient(MONGODB_URI)
db = client['event_management_db']
users_collection = db['users']
events_collection = db['events']

# Secret key for JWT
SECRET_KEY = getattr(settings, 'SECRET_KEY', os.getenv('SECRET_KEY', 'your-secret-key'))
ALGORITHM = 'HS256'

@csrf_exempt
def signup(request):
    """
    Handles user registration.
    Expects a POST request with a JSON body containing 'name', 'email', and 'password'.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # --- Field Validation ---
        if not all([name, email, password]):
            return JsonResponse({'error': 'Missing required fields: name, email, and password are required.'}, status=400)

        # Validate name
        if not re.match(r'^[A-Za-z\s]+$', name):
            return JsonResponse({'error': 'Name must contain only letters and spaces'}, status=400)
        
        # Validate email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return JsonResponse({'error': 'Invalid email format'}, status=400)

        # Validate password
        if not re.match(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password):
            return JsonResponse({
                'error': 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
            }, status=400)

        # --- Check for Existing User ---
        if users_collection.find_one({'email': email}):
            return JsonResponse({'error': 'An account with this email already exists.'}, status=409)

        # --- Password Hashing ---
        # Generate a salt and hash the password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # --- Create User and Token ---
        user_id = users_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'createdAt': datetime.datetime.utcnow()
        }).inserted_id

        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user_id),
            'email': email,
            'role': 'user',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm=ALGORITHM)

        return JsonResponse({'message': 'Signup successful', 'token': token}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Find user by email
            user = users_collection.find_one({'email': email})
            if not user:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            # Refresh token
            token = jwt.encode({
                'email': email,
                'role': 'user',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm=ALGORITHM)

            users_collection.update_one({'email': email}, {'$set': {'token': token}})

            return JsonResponse({'token': token, 'redirect': '/user/home'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def browse_events(request):
    if request.method == 'GET':
        try:
            # Authorization
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                if payload['role'] != 'user':
                    return JsonResponse({'error': 'Access denied'}, status=403)
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired', 'redirect': '/user/login'}, status=401)
            except jwt.DecodeError:
                return JsonResponse({'error': 'Invalid token', 'redirect': '/user/login'}, status=401)

            # Filter params
            event_type = request.GET.get('type')       # free / paid
            location = request.GET.get('location')     # part of venue
            date = request.GET.get('date')             # YYYY-MM-DD

            query = {}
            if event_type in ['free', 'paid']:
                query['cost_type'] = event_type
            if location:
                query['venue'] = {'$regex': location, '$options': 'i'}
            if date:
                query['start_date'] = {'$gte': date}

            events = list(events_collection.find(query, {'_id': 0}))
            if not events:
                return JsonResponse({'message': 'No events found', 'events': []}, status=200)

            return JsonResponse({'events': events}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
