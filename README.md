# Event Management Platform
A web-based application for event creation and discovery with Admin and User flows.

## Setup Instructions
1. Clone the repository: `git clone https://github.com/Karthik-ihub/event-management-platform.git`
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
- **Auth**: JWT (pyjwt)

## Approach
(TBD: Will be updated with a brief explanation of the project approach, max 300 words, once development progresses)

## 📁 Folder Structure

event-management-platform/
├── backend/
│   ├── event_platform/      # Django project settings (settings.py, urls.py)
│   ├── events/              # Django app for event models, views, and APIs
│   ├── static/              # For serving static files in production
│   ├── media/               # For user-uploaded media files (event images)
│   ├── venv/                # Python virtual environment (ignored by Git)
│   ├── manage.py            # Django's command-line utility
│   └── requirements.txt     # Backend Python dependencies
│
├── frontend/
│   ├── public/              # Static assets (index.html, favicon)
│   ├── src/                 # React source code
│   │   ├── assets/          # Images, fonts, and global styles
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (e.g., Home, Dashboard)
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   ├── .env                 # Environment variables (e.g., API URL)
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Build configuration for Vite (or similar)
│
├── docs/                    # Project documentation and architecture diagrams
│
├── .gitignore               # Specifies intentionally untracked files to ignore
└── README.md                # This file: Project overview and setup guide
├── .gitignore               # Specifies intentionally untracked files to ignore
└── README.md                # This file: Project overview and setup guide
