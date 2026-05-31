# AuraLearn 🎓

An AI-powered study assistant that transforms your documents into flashcards, quizzes, visual infographics, and interactive chat sessions — all powered by Google Gemini.

## Features

- 📄 **Document Upload** — Upload PDFs and extract text automatically
- 💬 **AI Chat** — Ask questions about any document
- 🧠 **Flashcards** — Auto-generate study flashcards
- 🏆 **Quizzes** — Take AI-generated multiple-choice quizzes
- 📊 **Infographics** — Visual knowledge maps with metrics, timelines & concepts
- 📝 **Summaries** — One-click document summaries
- 👤 **Profile** — Manage your account

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT + bcrypt |
| File Upload | Multer + pdf-parse |

## Project Structure

```
AISTUDYASSISTANT/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   └── server.js
└── frontend/
    └── ai-learning-assisant/
        └── src/
            ├── pages/
            ├── components/
            ├── context/
            └── services/
```

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend/ai-learning-assisant
npm install
npm run dev
```

## Deployment

- **Backend API**: Deployed on [Render](https://render.com)
- **Frontend App**: Deployed on [Vercel](https://vercel.com)

## Environment Variables

### Backend
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key |
| `NODE_ENV` | `development` or `production` |

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

