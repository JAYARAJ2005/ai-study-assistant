# 📚 StudyAI — AI Study Assistant

An AI-powered study companion that turns documents, YouTube videos and freeform questions into summaries, quizzes, flashcards and a conversational study assistant. Built with the MERN stack and Google's Gemini API.

## 🔗 Live Demo

* https://ai-study-assistant-hub.vercel.app

## ✨ Features

* Upload a PDF, DOCX or TXT file and get a clean, exam-ready summary
* Auto-generated multiple-choice quizzes with real scoring, answer review and a "retry incorrect answers only" flow
* Flip-card flashcard sets generated from any document
* YouTube → Notes: paste a YouTube link and generate a summary, quiz or flashcard set straight from the video's transcript
* AI chat for open-ended academic questions, or chat with an uploaded document, with full conversation memory (follow-ups like "explain that more simply" work correctly)
* PDF export for any summary, quiz (with answer key) or flashcard set
* Chat history: every summary, quiz, flashcard set and chat session is saved and revisitable
* JWT authentication with hashed passwords and server-side email/password validation
* Responsive design with a collapsible sidebar, adaptive layouts and touch-friendly controls
* Dark theme UI with a custom navy/cyan design system, empty states, loading skeletons and a dedicated 404 page

## 🛠️ Technologies Used

* React (Vite), React Router and Axios
* jsPDF for client-side PDF generation
* react-markdown
* Node.js and Express
* MongoDB with Mongoose
* JWT authentication and bcrypt password hashing
* Multer, pdf-parse and mammoth for file uploads and text extraction
* youtube-transcript for YouTube caption extraction
* Google Gemini API (`@google/generative-ai`) for all AI generation, with automatic retry on transient model overload
* HTML5 and CSS3 (flexbox, grid, animations, responsive layouts)
* GitHub for version control
* Vercel (frontend), Render (backend) and MongoDB Atlas (database) for deployment

## 🚀 How to Run Locally

1. Clone this repository and open the project folder.

```
git clone https://github.com/JAYARAJ2005/ai-study-assistant.git
cd ai-study-assistant
```

2. Set up the backend. You need Node.js (v18+), a MongoDB Atlas connection string (or a local MongoDB) and a [Google Gemini API key](https://aistudio.google.com/apikey).

```
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

Start the server:

```
node index.js
```

3. Set up the frontend.

```
cd ../client
npm install
```

Create a `client/.env` file:

```
VITE_API_URL=http://localhost:5000
```

Start the app:

```
npm run dev
```

4. Open http://localhost:5173 and start studying.

## 📖 How It Works

1. The user registers or logs in and uploads a document, pastes a YouTube link, or asks a question.
2. The backend extracts the text from the file or the video's transcript.
3. The text is sent to the Gemini API, which generates a summary, quiz, flashcards or chat reply.
4. The result is saved to MongoDB and shown in the app.
5. Everything stays in the user's history, and any summary, quiz or flashcard set can be exported as a PDF.

## ⚠️ Limitations

* Image generation was evaluated and intentionally not included, because Gemini's image models currently have no meaningful free tier. The app stays on Gemini's free text-generation tier by design.
* The Gemini free tier can occasionally return `503` (model overloaded) errors during high demand. The backend automatically retries these before showing an error.
* YouTube notes only work for videos that have captions available.
* AI-generated content can be inaccurate, so check important facts.

## 🔮 Future Scope

* Study streaks and progress tracking
* Spaced-repetition scheduling for flashcards
* Support for more file types, such as PPTX and images
* Sharing quizzes and flashcard sets with classmates
* Mobile app version

## 📄 License

This project is for educational and portfolio purposes.
