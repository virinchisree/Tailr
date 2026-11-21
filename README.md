# Tailr

Check how well your resume matches a job description, see which required skills are missing,
and get honest rewrites of your bullet points. Tailr rewords what's already true and never invents experience.

**Stack:** React + TypeScript (Vite) · Spring Boot (Java 21) · Spring AI

## Project structure

- `frontend/`: React app (landing, check and results pages)
- `backend/`: Spring Boot REST API (`POST /api/match`)

## Run locally

**Requirements:** Node 22+, Java 21, Maven (or the included `mvnw`)

```bash
# backend: http://localhost:8080
cd backend
./mvnw spring-boot:run

# frontend: http://localhost:5173 (calls to /api are proxied to the backend)
cd frontend
npm install
npm run dev