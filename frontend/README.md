# FlashMaster - Fullstack Spaced Repetition App

FlashMaster is a specialized learning tool designed to optimize memory retention through a system called Spaced Repetition (SRS).

## 1. Project Overview & Logic

The project is built around the Leitner System, a proven method for moving information from short-term to long-term memory.

### How the Spaced Repetition Works:
- Every flashcard starts in Box 1 (Category 1).
- When you answer a card correctly, it moves to the next box (e.g., Box 1 -> Box 2).
- The review interval increases exponentially with each box: 2^(n-1) days.
  * Box 1: Every day
  * Box 2: Every 2 days
  * Box 3: Every 4 days
  * ... up to Box 7.
- If you fail a card, it is immediately reset to Box 1, regardless of its current level. This ensures you focus on the cards you find most difficult.

### Key Components:
- Users & Auth: Secure login and role management (Admin/User).
- Folders: Organization of cards. Admins can create "Global Folders" shared with all users.
- Personalized Progress: Even for shared/global cards, each user has their own "CardProgress" record to track their specific learning curve.

---

## 2. Technical Architecture

The app uses a classic MERN-like architecture:
- Frontend: React 19 (Vite) + React Router 7 + Axios for API communication.
- Backend: Node.js + Express.js.
- Database: MongoDB via Mongoose for data persistence and indexing.
- Security: JWT (JSON Web Tokens) for session management and Bcryptjs for password hashing.

---

## 3. Setup & Installation

### Backend (flashcard-app folder)
1. cd flashcard-app
2. npm install
3. Create a .env file:
   PORT=3000
   MONGO_URI=mongodb+srv://yoann:monMotDePasse@flashcardproj.ko8gdkb.mongodb.net/?appName=Flashcardproj
   JWT_SECRET=your_secure_secret_key
4. Start: npm run dev

Backend runs at http://localhost:3000
Swagger Docs at http://localhost:3000/api-docs

### Frontend (frontend folder)
1. cd frontend
2. npm install
3. Start: npm run dev

Frontend runs at http://localhost:5173

---

## 4. Main API Endpoints

- POST /auth/register : Register a new account.
- POST /auth/login : Receive your token and user info.
- GET /cards?userId=ID : Retrieve all accessible cards with your current progress level.
- PATCH /cards/:id/answer : Submit a review (Valid/Invalid) to update your Leitner box and next review date.
- GET /folders?userId=ID : Fetch personal and global folders.

---

## 5. Development Scripts

Flashcard-app (Backend):
- npm start: Run production server.
- npm run dev: Run with nodemon.
- npm test: Run Vitest test suite.

Frontend:
- npm run dev: Start Vite dev server.
- npm run build: Build for production.