# StudyAI — AI Study Assistant

An AI-powered study companion that turns documents, YouTube videos, and freeform questions into summaries, quizzes, flashcards, and a conversational study assistant — built with the MERN stack and Google's Gemini API.

**Live demo:** https://ai-study-assistant-psi-seven.vercel.app

---

## Features

- **Document Summaries** — upload a PDF, DOCX, or TXT file and get a clean, exam-ready summary
- **Interactive Quizzes** — auto-generated multiple-choice quizzes with real scoring, answer review, and a "retry incorrect answers only" flow
- **Flashcards** — flip-card study sets generated from any document
- **YouTube → Notes** — paste a YouTube link and generate a summary, quiz, or flashcard set straight from the video's transcript (no manual note-taking)
- **AI Chat** — ask open-ended academic questions or chat with an uploaded document, with full conversation memory (follow-ups like "explain that more simply" work correctly)
- **PDF Export** — download any summary, quiz (with answer key), or flashcard set as a formatted PDF
- **Chat history** — every summary, quiz, flashcard set, and chat session is saved and revisitable
- **Authentication** — JWT-based auth with hashed passwords and server-side email/password validation
- **Responsive design** — full mobile support with a collapsible sidebar, adaptive layouts, and touch-friendly controls
- **Dark theme UI** — custom navy/cyan design system throughout, including empty states, loading skeletons, and a dedicated 404 page

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- jsPDF (client-side PDF generation)
- react-markdown

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Multer (file uploads) + pdf-parse + mammoth (text extraction)
- youtube-transcript (YouTube caption extraction)
- Google Gemini API (`@google/generative-ai`) for all AI generation, with automatic retry on transient model overload

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```
AI-Study-Assistant/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── pages/          # Route-level pages (Dashboard, Quiz, Chat, etc.)
│   │   ├── components/     # Reusable UI components (Sidebar, Navbar, cards)
│   │   ├── layouts/        # Shared page layout (MainLayout)
│   │   ├── context/        # React context (notifications)
│   │   ├── hooks/          # Custom hooks (usePageTitle)
│   │   └── services/       # Axios API client
│   └── ...
└── server/                 # Express backend
    ├── controllers/        # Route handler logic
    ├── models/             # Mongoose schemas
    ├── routes/              # Express route definitions
    ├── services/            # Gemini AI integration
    ├── middleware/          # Auth middleware, file upload config
    └── index.js              # App entry point
```

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string (or local MongoDB instance)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/JAYARAJ2005/ai-study-assistant.git
cd ai-study-assistant
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `server/.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Run the server:
```bash
node index.js
```

### 3. Frontend setup
```bash
cd ../client
npm install
```

Create a `client/.env` file:
```
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Notes

- Image generation was evaluated and intentionally **not included** — Gemini's image models (Imagen/Nano Banana) currently have no meaningful free tier, so the app stays entirely on Gemini's free text-generation tier by design.
- The Gemini free tier can occasionally return `503` (model overloaded) errors during high demand; the backend automatically retries these before surfacing an error to the user.

---

## License

This project is for educational and portfolio purposes.
