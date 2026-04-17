# Smart Attendance System

A production-ready full-stack web application for smart, multi-factor attendance verification using React.js, Node.js, Express, and MongoDB.

## Features

- **Biometric Face Verification**: Uses `face-api.js` to extract face descriptors and perform euclidean distance checks locally to prevent proxy attendance.
- **Geolocation Validation**: Uses browser Geolocation API to ensure the student is within the required radius of the active class location.
- **Session Codes**: Teachers create active sessions with unique codes.
- **Admin & Student Roles**:
  - **Admin**: Create classes, view all attendance, view charts/analytics.
  - **Student**: Set up Face ID, mark attendance, view history.

## Project Structure

- `/backend` - Node.js Express API.
- `/frontend` - React Application (Vite + Tailwind CSS).

## Prerequisites

1. **Node.js** (v18+)
2. **MongoDB** service running locally on `mongodb://127.0.0.1:27017` (or modify `backend/.env` to point to your cloud Mongo URI).
3. **Webcam** (Required for face validation)

## Setup & Running Locally

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
*The backend server will start on `http://localhost:5000`.*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*The frontend React app will start on Vite's default port (usually `http://localhost:5173`).*

## Default Settings

- Since this is a local project, `face-api.js` loads the AI weights directly from the GitHub CDN raw content. No manually downloaded weights are needed!
- **Testing the App**:
  1. Open the frontend URL.
  2. Register two accounts: one as `Admin` and one as `Student`.
  3. Login as **Admin**. Click "Create Session". Use the pre-filled coordinates. Note the Session Code.
  4. Login as **Student**. Go to **Dashboard -> Setup Face ID**. Allow webcam access, scan your face, and save.
  5. Go to **Dashboard -> Mark Attendance**. Enter the Session Code. Let the camera verify your face and browser fetch your coordinates.
  6. The attendance will be successfully logged to the database!

Enjoy your Smart Attendance System!
