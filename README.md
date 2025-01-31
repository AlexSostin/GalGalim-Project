# GalGalim Project

A full-stack e-commerce application for selling bicycles, built with:

- Frontend: React.js
- Backend: Django REST Framework
- Authentication: JWT
- Database: SQLite3
- Real-time features: Django Channels

Bike Store Application

This is an e-commerce project for selling bicycles.

How to Run the Application

Follow the steps below to start the application.

                Start the Backend Server

1.  Navigate to the root directory of the project: cd bike_store

2.  Navigate to the backend directory: cd backend

3.  Create a virtual environment: python -m venv venv

4.  Activate the virtual environment: ./venv/Scripts/activate (Windows) or source venv/bin/activate (macOS/Linux)

5.  Start the Django server: python manage.py runserver

                Start the Frontend Server

    In a second terminal, perform the following steps:

6.  Navigate to the root directory of the project: cd bike_store

7.  Navigate to the frontend directory: cd frontend

8.  Start the React application: npm start

    Access the Application

The backend server will be available at: http://127.0.0.1:8000

The frontend application will be available at: http://localhost:3000

Notes

Ensure you have the following dependencies installed:

Python (version 3.8 or higher)

Node.js and npm

If you encounter any issues, verify that all dependencies are installed correctly.

Python Dependencies

The required Python packages are listed in requirements.txt. Below is the full list of dependencies:

asgiref==3.8.1
async-timeout==5.0.1
certifi==2024.12.14
cffi==1.17.1
channels==4.2.0
channels_redis==4.2.1
charset-normalizer==3.4.1
cryptography==44.0.0
defusedxml==0.8.0rc2
Django==4.2.16
django-cors-headers==4.6.0
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
djoser==2.3.1
idna==3.10
msgpack==1.1.0
oauthlib==3.2.2
pillow==11.0.0
pycparser==2.22
PyJWT==2.10.1
python3-openid==3.2.0
redis==5.2.1
requests==2.32.3
requests-oauthlib==2.0.0
social-auth-app-django==5.4.2
social-auth-core==4.5.4
sqlparse==0.5.2
typing_extensions==4.12.2
tzdata==2024.2
urllib3==2.3.0

Happy coding!
