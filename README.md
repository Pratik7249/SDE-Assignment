# Lightweight Feedback System
A full-stack feedback sharing platform that enables managers to submit structured feedback to employees and track feedback history. Employees can acknowledge and respond to feedback, with access controlled by user roles.

##  Demo & Walkthrough Videos
 Demo Video: https://youtu.be/4IphJmjhDVk

 Code Walkthrough: https://youtu.be/4krbmob9alM

 ### Tech Stack - 
- Frontend:	React, Vite, Tailwind CSS
- Backend:	FastAPI (Python), PostgreSQL
- Auth	Mock login with role-based access
- Dev Tools	Docker, Docker Compose, GitHub

 ### Features: 
 #### -> MVP Features
Mock login with Manager & Employee roles

#### Managers:

- Submit structured feedback

- View team dashboard (stats & sentiment)

- Edit submitted feedback

#### Employees:

- View personal feedback timeline

- Acknowledge feedback

- Role-based access to data and routes

#### -> Bonus Features
- Anonymous peer feedback option

- Comment on recieved feedback

- Timeline visualization

- Dockerized backend

- Vite + Tailwind for fast frontend development

### Docker Setup (Backend + DB)
- You need Docker and Docker Compose installed.

### Basic Folder Structure\
```
feedback-system/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routes/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── docker-compose.yml
├── README.md
``` 

## Run Full App (Frontend + Backend)

### Step 1: Spin up backend and database
```
cd backend
docker compose down
docker compose up --build
```

### Step 2: In a separate terminal, start the frontend
```
cd frontend
npm install
npm run dev -- --port=3000
```


-> Backend runs at: http://localhost:8000

-> Frontend runs at: http://localhost:3000

-> API Docs: http://localhost:8000/docs

 ## Design Decisions:
- FastAPI for rapid development, async support, and Swagger docs

- PostgreSQL for relational role/feedback structure

- Docker simplifies backend

- React + Vite + Tailwind for clean, performant UI

- Role boundaries enforced in both API and UI logic

 ## Example Users (Mocked Login):
```
Username	Role       Password
pratik  	manager    pratik
employee1	employee   employee1
TESTING1	employee   TESTING1
```

## Notes:
- Frontend is not containerized (as per assignment)

- Auth is mocked, can be upgraded with JWT/OAuth

- Make sure PostgreSQL is accessible at localhost:5432 if running locally

- Swagger API docs available at /docs
