# PrepPilot

**AI-powered job preparation platform.** Upload your resume, paste a job description, and PrepPilot generates a personalized interview plan: match score, skill gaps, likely interview questions, a preparation roadmap, and an ATS-optimized resume PDF.

---

## Features

- **Secure authentication**: register and log in with JWT stored in HTTP cookies. Logout blacklists the token so it cannot be reused.
- **Resume analysis**: upload a PDF resume (or write a short self-description) and the app extracts your skills and experience.
- **Match score**: see how well your profile fits a specific job description.
- **Skill gap detection**: find out which required skills are missing from your resume, ranked by severity.
- **Interview questions**: technical and behavioral questions tailored to the role, with guidance on how to answer.
- **Preparation roadmap**: a day-by-day plan to close your gaps before the interview.
- **ATS-optimized resume**: the AI rewrites your resume to fit the job description, and Puppeteer exports it as a downloadable PDF.
- **Report history**: every report is saved so you can revisit past analyses.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, SCSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT, cookies, token blacklisting |
| AI | Google Gemini API (`@google/genai`), Zod for response validation |
| File handling | Multer (upload), pdf-parse (resume parsing) |
| PDF generation | Puppeteer |

## Project Structure

```
PrepPilot/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── config/         # database connection
│       ├── controllers/    # auth and interview logic
│       ├── middlewares/    # auth, file upload
│       ├── models/         # user, interview report, token blacklist
│       ├── routes/
│       └── services/       # Gemini AI and PDF generation
└── Frontend/
    └── src/
        └── features/       # auth and interview (api, hooks, context, pages, styles)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (the free tier works)
- A [Google AI Studio](https://aistudio.google.com/) API key (the free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/nikhilrautan/PrepPilot.git
cd PrepPilot
```

### 2. Set up the backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

> Use the exact variable names your code reads from `process.env`. Never commit this file.

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:3000`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## How It Works

1. A user registers and logs in. The server sets a JWT in a cookie.
2. The user uploads a resume and pastes a job description.
3. The backend parses the PDF and sends the resume, self-description, and job description to Gemini.
4. The AI response is validated against a Zod schema and saved in MongoDB as an interview report.
5. The frontend displays the match score, skill gaps, questions, and roadmap.
6. On request, the backend asks Gemini for an ATS-optimized resume as HTML and renders it to PDF with Puppeteer.

## Notes

- **Free-tier limits:** the Gemini free tier has per-minute and per-day request limits. If you see a `429` error, wait a minute and retry.
- **Privacy:** requests sent through the Gemini free tier may be used by Google to improve its products. Use a sample resume when testing.
- **Resume format:** PDF resumes are supported for upload.

## Roadmap

- [ ] Support DOCX resume uploads
- [ ] Mock interview mode with answer feedback
- [ ] Cover letter generator
- [ ] Progress dashboard across multiple reports
- [ ] Deployment (Vercel and Render)

## Screenshots

_Add screenshots of the home page, report page, and generated resume here._

## Acknowledgements

This project was built while following the full-stack Gen AI tutorial by **Ankur Prajapati** ([Sheryians Coding School](https://sheryians.com/)). Original source code: [ankurdotio/interview-ai-yt](https://github.com/ankurdotio/interview-ai-yt).

## Author

**Nikhil Rautan**: [GitHub](https://github.com/nikhilrautan)
