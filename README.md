# Event Management Platform
A web-based application for event creation and discovery with Admin and User flows.

## Setup Instructions
1. Clone the repository: `git clone https://github.com/your-username/event-management-platform.git`
2. Navigate to the project directory: `cd event-management-platform`
3. Navigate to backend: `cd backend`
4. Set up a Python virtual environment: `python -m virtualenv venv`
5. Activate the virtual environment: `.\venv\Scripts\activate`
6. Install backend dependencies: `pip install -r requirements.txt`
7. Ensure MongoDB is running (local or cloud). Update `backend/event_platform/settings.py` with your MongoDB connection string.
8. Run migrations: `python manage.py makemigrations && python manage.py migrate`
9. Start the Django server: `python manage.py runserver`
10. (Frontend setup TBD: React.js setup instructions will be added)

## Tech Stack
- **Frontend**: React.js
- **Backend**: Django (Python)
- **Database**: MongoDB
- **API**: Django REST Framework
- **Auth**: JWT (python-jose)

## Approach
(TBD: Will be updated with a brief explanation of the project approach, max 300 words, once development progresses)

## Folder Structure
\`\`\`
/event-management-platform
├── /backend
│   ├── /event_platform     # Django project
│   ├── /events             # Django app for event management
│   ├── /media              # For file uploads
│   ├── /venv               # Python virtual environment
│   ├── manage.py           # Django management script
│   ├── requirements.txt
├── /frontend               # React.js frontend
├── /docs                   # Architecture diagram and documentation
├── .gitignore
├── README.md
\`\`\`
