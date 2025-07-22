# Event Management Platform
A web-based application for event creation and discovery with Admin and User flows.

## Architecture of the project
![Architecture Diagram](docs/Event%20management.drawio%20(1).png)

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

<pre><code>## 📁 Folder Structure ``` event-management-platform/ ├── backend/ # Django backend │ ├── event_platform/ # Django project settings (settings.py, urls.py) │ ├── events/ # Django app for event models, views, APIs │ ├── static/ # Static files for production │ ├── media/ # Uploaded media files (e.g., event images) │ ├── venv/ # Python virtual environment (not committed) │ ├── manage.py # Django CLI utility │ └── requirements.txt # Backend dependencies │ ├── frontend/ # React frontend │ ├── public/ # Public assets (index.html, favicon) │ ├── src/ # React source code │ │ ├── assets/ # Images, fonts, styles │ │ ├── components/ # Reusable components │ │ ├── pages/ # Page-level components (Home, Dashboard, etc.) │ │ ├── App.jsx # Main App component │ │ └── main.jsx # Entry point │ ├── .env # Environment variables │ ├── package.json # Frontend dependencies │ └── vite.config.js # Vite config │ ├── docs/ # Documentation and diagrams │ └── architecture.png # Architecture diagram │ ├── .gitignore # Ignored files └── README.md # Project overview and setup guide ``` </code></pre>
