from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import pymongo
import os
import re
import jwt
import json
import datetime
from django.conf import settings
from dotenv import load_dotenv
import google.generativeai as genai
import base64
import bcrypt
# Load env and configure Gemini
load_dotenv()
genai.configure(api_key="AIzaSyAIKHEl4brLrSkgV9JmTzdZi_9YgqWJKPo")

# MongoDB connection
MONGODB_URI = "mongodb+srv://PKDB:06102003-Pk@cluster0.yqecmgt.mongodb.net/event_management_db?retryWrites=true&w=majority"
client = pymongo.MongoClient(MONGODB_URI)
db = client['event_management_db']
admins_collection = db['admins']
events_collection = db['events']

# Secret key for JWT
SECRET_KEY = getattr(settings, 'SECRET_KEY', 'your-secret-key')
ALGORITHM = 'HS256'


# 🧠 AI-generated description using Gemini
def generate_ai_description(title, venue, start_date, end_date, time, cost_type):
    prompt = f"""
    Write an engaging event description (under 100 words) for:
    - Title: {title}
    - Venue: {venue}
    - Date: {start_date} to {end_date}
    - Time: {time}
    - Cost Type: {cost_type.title()}
    Use a fun and informative tone.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini error:", e)
        return "An exciting event awaits you! Stay tuned for more details."

# In admins.py, add this new endpoint below the existing code

@csrf_exempt
def generate_description(request):
    """
    Generates an AI description for the event based on provided details.
    Expects a POST request with a JSON body containing 'title', 'venue', 'start_date', 'end_date', 'time', 'cost_type'.
    """
    if request.method == 'POST':
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired'}, status=401)
            except jwt.DecodeError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

            admin = admins_collection.find_one({'email': payload['email'], 'token': token})
            if not admin:
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            # Parse request body
            data = json.loads(request.body)
            title = data.get('title')
            venue = data.get('venue')
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            time = data.get('time')
            cost_type = data.get('cost_type')

            # Validations
            if not title or len(title) > 50:
                return JsonResponse({'error': 'Title is required and must be 50 chars or less'}, status=400)
            if not venue or len(venue) > 150:
                return JsonResponse({'error': 'Venue is required and must be 150 chars or less'}, status=400)
            if not start_date or not end_date or start_date > end_date:
                return JsonResponse({'error': 'Start date must be before end date'}, status=400)
            if not time:
                return JsonResponse({'error': 'Time is required'}, status=400)
            if not cost_type or cost_type not in ['free', 'paid']:
                return JsonResponse({'error': 'Cost type must be "free" or "paid"'}, status=400)

            # Generate AI description
            description = generate_ai_description(title, venue, start_date, end_date, time, cost_type)
            return JsonResponse({'description': description}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def register(request):
    """
    Handles admin registration.
    Expects a POST request with a JSON body containing 'name', 'email', and 'password'.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')

            # --- Field Validation ---
            if not name or not re.match(r'^[A-Za-z]+$', name):
                return JsonResponse({'error': 'Name must be alphabetic only'}, status=400)
            if not email or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
                return JsonResponse({'error': 'Invalid email format'}, status=400)
            if not password or len(password) < 8:
                return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
            if admins_collection.find_one({'email': email}):
                return JsonResponse({'error': 'Email already exists'}, status=400)

            # --- Password Hashing ---
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

            # --- Generate JWT Token ---
            token = jwt.encode({
                'email': email,
                'role': 'admin',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm=ALGORITHM)

            # --- Store Admin ---
            admins_collection.insert_one({
                'name': name,
                'email': email,
                'password': hashed_password,
                'token': token,
                'createdAt': datetime.datetime.utcnow()
            })

            return JsonResponse({'token': token, 'redirect': '/admin/create-event'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    """
    Handles admin login.
    Expects a POST request with a JSON body containing 'email' and 'password'.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Find admin by email
            admin = admins_collection.find_one({'email': email})
            if not admin:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            # Verify password
            if not bcrypt.checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

            # Generate or refresh token
            token = jwt.encode({
                'email': email,
                'role': 'admin',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm=ALGORITHM)

            admins_collection.update_one({'email': email}, {'$set': {'token': token}})

            return JsonResponse({'token': token, 'redirect': '/admin/create-event'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def create_event(request):
    if request.method == 'POST':
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired'}, status=401)
            except jwt.DecodeError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

            admin = admins_collection.find_one({'email': payload['email'], 'token': token})
            if not admin:
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            # Input fields
            title = request.POST.get('title')
            venue = request.POST.get('venue')
            start_date = request.POST.get('start_date')
            end_date = request.POST.get('end_date')
            time = request.POST.get('time')
            cost_type = request.POST.get('cost_type')
            generate_description = request.POST.get('generate_description', 'false') == 'true'
            description = request.POST.get('description', '')

            # Validations
            if not title or len(title) > 50:
                return JsonResponse({'error': 'Title is required and must be 50 chars or less'}, status=400)
            if not venue or len(venue) > 150:
                return JsonResponse({'error': 'Venue is required and must be 150 chars or less'}, status=400)
            if not start_date or not end_date or start_date > end_date:
                return JsonResponse({'error': 'Start date must be before end date'}, status=400)
            if not time:
                return JsonResponse({'error': 'Time is required'}, status=400)
            if not cost_type or cost_type not in ['free', 'paid']:
                return JsonResponse({'error': 'Cost type must be "free" or "paid"'}, status=400)
            if 'image' not in request.FILES:
                return JsonResponse({'error': 'Image is required'}, status=400)

            # Image validation
            image = request.FILES['image']
            if image.size > 5 * 1024 * 1024:
                return JsonResponse({'error': 'Image must be <= 5MB'}, status=400)
            if not image.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                return JsonResponse({'error': 'Only .jpg, .jpeg, .png allowed'}, status=400)

            # Generate AI Description if requested
            if generate_description:
                description = generate_ai_description(title, venue, start_date, end_date, time, cost_type)

            # --- MODIFICATION START ---
            # 1. Read the image's binary data
            image_data = image.read()
            # 2. Encode the binary data to a Base64 string
            base64_encoded_data = base64.b64encode(image_data).decode('utf-8')
            # 3. Create a Data URI for easy use on the frontend (e.g., in an <img> src attribute)
            image_mime_type = image.content_type
            base64_image_string = f"data:{image_mime_type};base64,{base64_encoded_data}"
            # --- MODIFICATION END ---
            
            # Save event to the database
            events_collection.insert_one({
                'title': title,
                'venue': venue,
                'start_date': start_date,
                'end_date': end_date,
                'time': time,
                'cost_type': cost_type,
                'description': description,
                'image': base64_image_string, # <--- Store the Base64 string here
                'organizer': payload['email'],
                'created_by': payload['email']
            })

            return JsonResponse({'message': 'Event created successfully', 'redirect': '/admin/dashboard'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def dashboard(request):
    if request.method == 'GET':
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired', 'redirect': '/admin/login'}, status=401)
            except jwt.DecodeError:
                return JsonResponse({'error': 'Invalid token', 'redirect': '/admin/login'}, status=401)

            admin = admins_collection.find_one({'email': payload['email'], 'token': token})
            if not admin:
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            events = list(events_collection.find({'created_by': payload['email']}, {'_id': 0}))
            return JsonResponse({'events': events}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
