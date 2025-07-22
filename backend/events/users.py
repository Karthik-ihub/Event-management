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
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # --- Create User ---
        user_id = users_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'createdAt': datetime.utcnow()  # Fixed here
        }).inserted_id

        # --- Generate JWT Token ---
        token = jwt.encode({
            'user_id': str(user_id),
            'email': email,
            'role': 'user',
            'exp': datetime.utcnow() + timedelta(hours=24)  # Fixed here
        }, SECRET_KEY, algorithm=ALGORITHM)

        return JsonResponse({'message': 'Signup successful', 'token': token}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        # --- Field Validation ---
        if not all([email, password]):
            return JsonResponse({'error': 'Missing required fields: email and password are required.'}, status=400)

        # --- Find User ---
        user = users_collection.find_one({'email': email})
        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        # --- Verify Password ---
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        # --- Generate JWT Token ---
        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': email,
            'role': 'user',
            'exp': datetime.utcnow() + timedelta(hours=24)  # Fixed here
        }, SECRET_KEY, algorithm=ALGORITHM)

        return JsonResponse({
            'message': 'Login successful',
            'token': token,
            'redirect': '/user/home'
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)

from datetime import datetime, timedelta, time

@csrf_exempt
def dashboard(request):
    """
    Handles user dashboard access with support for event filtering.
    Expects a GET request with a JWT token in the Authorization header.
    Filters can be passed as query parameters: 'type', 'location', 'date'.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        # --- 1. Authenticate User (Your existing logic is good) ---
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Missing or invalid Authorization header'}, status=401)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        user = users_collection.find_one({'email': payload['email']})
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        # --- 2. Build Filter Query from GET parameters ---
        query_params = request.GET
        find_query = {}

        # Filter by type (e.g., ?type=free)
        event_type = query_params.get('type')
        if event_type:
            find_query['cost_type'] = event_type

        # Filter by location (e.g., ?location=lucknow)
        location = query_params.get('location')
        if location:
            # Use regex for a case-insensitive, partial string match
            find_query['venue'] = {'$regex': location, '$options': 'i'}

        # Filter by date (e.g., ?date=today or ?date=week)
        # Note: Assumes 'start_date' is stored in a format MongoDB can query (like ISO 8601 string)
        date_filter = query_params.get('date')
        if date_filter:
            today_dt = datetime.now()
            if date_filter == 'today':
                start_of_day = datetime.combine(today_dt.date(), time.min)
                end_of_day = datetime.combine(today_dt.date(), time.max)
                find_query['start_date'] = {'$gte': start_of_day.isoformat(), '$lte': end_of_day.isoformat()}
            elif date_filter == 'week':
                start_of_week = datetime.combine(today_dt.date(), time.min)
                end_of_week_dt = today_dt + timedelta(days=7)
                end_of_week = datetime.combine(end_of_week_dt.date(), time.max)
                find_query['start_date'] = {'$gte': start_of_week.isoformat(), '$lte': end_of_week.isoformat()}
        
        # --- 3. Fetch Filtered Events ---
        events = list(events_collection.find(find_query, {'_id': 0}))  # Exclude _id field
        
        return JsonResponse({
            'message': 'Dashboard data retrieved successfully',
            'user': {
                'name': user.get('name', ''),
                'email': user.get('email', '')
            },
            'events': events
        }, status=200)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)