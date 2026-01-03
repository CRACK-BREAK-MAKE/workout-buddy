# Exercise Buddy - MVP Implementation Plan

**Project:** AI-Powered Exercise Counter
**Timeline:** Weekend Project (4 focused development days)
**Goal:** Working MVP with production-grade CI/CD

---

## 🎯 Success Criteria

- [ ] Camera feed with real-time pose detection (30 FPS)
- [ ] Automatic counting for push-ups and jump rope (>90% accuracy)
- [ ] User authentication (register, login, logout)
- [ ] Save and view workout history
- [ ] Basic statistics dashboard
- [ ] Fully containerized with Docker
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Deployed to Vercel (frontend) + Railway (backend)

---

## 📅 Day-by-Day Plan

### Day 1: Foundation & Infrastructure (Saturday Morning)
**Focus:** Set up project structure, Docker, CI/CD

#### Morning (4 hours)
1. **Project Setup (1h)**
   - Create monorepo structure
   - Initialize Git repository
   - Create .gitignore, .env.example
   - Set up GitHub repository

2. **Docker Configuration (1.5h)**
   - Create Dockerfiles for client and server
   - Set up docker-compose.yml for local development
   - Test: `docker-compose up -d` should start all services

3. **CI/CD Pipeline (1.5h)**
   - Create `.github/workflows/ci-frontend.yml`
   - Create `.github/workflows/ci-backend.yml`
   - Create `.github/workflows/deploy-production.yml`
   - Test: Push to GitHub should trigger workflows

#### Afternoon (4 hours)
4. **Frontend Foundation (2h)**
   - Initialize Vite + React + TypeScript
   - Install dependencies (TailwindCSS, MediaPipe, Zustand, React Router)
   - Set up folder structure (features, shared, pages)
   - Create basic routing (Home, Login, Register, Workout)

5. **Backend Foundation (2h)**
   - Set up FastAPI project structure
   - Configure PostgreSQL with SQLAlchemy
   - Set up Alembic for migrations
   - Create User and Workout models
   - Test: FastAPI should serve at http://localhost:8000/docs

**Deliverables Day 1:**
- ✅ Monorepo with Docker running locally
- ✅ GitHub Actions workflows configured
- ✅ Frontend skeleton with routing
- ✅ Backend skeleton with database

---

### Day 2: Camera & Pose Detection (Saturday Afternoon/Evening)
**Focus:** MediaPipe integration and pose visualization

#### Session 1 (3 hours)
1. **Camera Access (1h)**
   - Create `useCamera` hook for webcam access
   - Handle camera permissions and errors
   - Create CameraFeed component
   - Test: Camera feed visible in browser

2. **MediaPipe Integration (2h)**
   - Create `useMediaPipe` hook for pose detection
   - Initialize PoseLandmarker
   - Set up video processing at 30 FPS
   - Create PoseCanvas component to draw skeleton
   - Test: Skeleton overlay visible on camera feed

#### Session 2 (3 hours)
3. **Pose Utilities (1h)**
   - Create `calculateAngle()` utility
   - Create `calculateDistance()` utility
   - Write unit tests for calculations
   - Test: Utilities correctly calculate angles

4. **Exercise Selection UI (2h)**
   - Create ExerciseSelector component
   - Create WorkoutControls (Start/Stop/Reset)
   - Create RepCounter display component
   - Create WorkoutTimer component
   - Test: UI components render and respond to clicks

**Deliverables Day 2:**
- ✅ Camera feed working with pose detection
- ✅ Skeleton visualization overlay
- ✅ Basic workout UI components
- ✅ Angle calculation utilities tested

---

### Day 3: Exercise Counting Logic (Sunday Morning)
**Focus:** Implement push-up and jump rope counters

#### Morning (4 hours)
1. **Push-up Counter (2h)**
   - Create `PushUpCounter` class
   - Implement elbow angle detection logic
   - Track down position (<90°) and up position (>160°)
   - Write unit tests with mock pose data
   - Test: Counter accurately counts push-ups

2. **Jump Rope Counter (1.5h)**
   - Create `JumpRopeCounter` class
   - Implement ankle height detection logic
   - Track jump (ankles up) and land (ankles down)
   - Write unit tests
   - Test: Counter accurately counts jump rope reps

3. **Exercise Counter Hook (0.5h)**
   - Create `useExerciseCounter` hook
   - Integrate with MediaPipe pose results
   - Handle exercise type switching
   - Test: Counter updates in real-time

#### Afternoon (4 hours)
4. **Manual Testing & Calibration (2h)**
   - Test push-up counting with real exercises
   - Adjust angle thresholds for accuracy
   - Test jump rope counting
   - Fix edge cases (partial reps, false positives)

5. **UI Polish (2h)**
   - Add visual feedback on rep counted (animation, sound)
   - Add progress indicator
   - Add form tips/instructions
   - Style components with TailwindCSS
   - Test: UI feels responsive and intuitive

**Deliverables Day 3:**
- ✅ Push-up counting working (>90% accuracy)
- ✅ Jump rope counting working (>90% accuracy)
- ✅ Real-time counter updates
- ✅ Polished workout UI

---

### Day 4: Authentication & Backend Integration (Sunday Afternoon/Evening)
**Focus:** Complete full-stack integration

#### Session 1 (3 hours)
1. **Backend Authentication (1.5h)**
   - Implement User registration endpoint
   - Implement Login endpoint (JWT tokens)
   - Create password hashing with bcrypt
   - Create JWT token generation/validation
   - Test: Can register and login via Swagger UI

2. **Workout Endpoints (1.5h)**
   - Implement POST /workouts (save workout)
   - Implement GET /workouts (get user workouts)
   - Implement GET /statistics/summary
   - Add authentication middleware
   - Test: Endpoints work with JWT token

#### Session 2 (3 hours)
3. **Frontend Authentication (1.5h)**
   - Create Login and Register forms
   - Create `authService` with API calls
   - Create `useAuth` hook with Zustand store
   - Implement protected routes (AuthGuard)
   - Store JWT in localStorage
   - Test: Can login and access protected routes

4. **Workout Integration (1.5h)**
   - Create `workoutService` to save workouts
   - Submit workout on completion
   - Create workout history page
   - Create basic statistics page
   - Test: Workouts saved to database and displayed

#### Final Polish (2 hours)
5. **Testing & Bug Fixes (1h)**
   - End-to-end test: Register → Login → Workout → View History
   - Fix any bugs found
   - Test error handling (network errors, invalid inputs)

6. **Deployment (1h)**
   - Connect GitHub to Vercel (frontend)
   - Connect GitHub to Railway (backend)
   - Set environment variables
   - Merge to main branch (trigger production deploy)
   - Test: Production URLs work correctly

**Deliverables Day 4:**
- ✅ Full authentication system working
- ✅ Workouts saved to database
- ✅ Statistics page showing workout history
- ✅ Deployed to production

---

## 📋 Detailed Task Checklist

### Infrastructure
- [ ] Create monorepo structure (client, server, shared, docker, docs)
- [ ] Initialize Git repository with .gitignore
- [ ] Create .env.example with all required variables
- [ ] Set up GitHub repository
- [ ] Create Dockerfile for frontend
- [ ] Create Dockerfile for backend
- [ ] Create docker-compose.yml (dev environment)
- [ ] Test: `docker-compose up -d` starts all services
- [ ] Create GitHub Actions workflow for frontend CI
- [ ] Create GitHub Actions workflow for backend CI
- [ ] Create GitHub Actions workflow for production deploy
- [ ] Test: Push to GitHub triggers CI checks

### Frontend Setup
- [ ] Initialize Vite + React + TypeScript
- [ ] Install and configure TailwindCSS
- [ ] Install dependencies (MediaPipe, Zustand, React Router, Axios)
- [ ] Set up ESLint and Prettier
- [ ] Create folder structure (features, shared, pages)
- [ ] Set up React Router with routes
- [ ] Create basic page components (HomePage, LoginPage, WorkoutPage)
- [ ] Test: Navigate between pages

### Backend Setup
- [ ] Set up FastAPI project structure
- [ ] Install dependencies (FastAPI, SQLAlchemy, Alembic, python-jose, passlib)
- [ ] Configure PostgreSQL connection
- [ ] Set up Alembic for migrations
- [ ] Create User model (SQLAlchemy)
- [ ] Create Workout model (SQLAlchemy)
- [ ] Create Pydantic schemas (UserCreate, WorkoutCreate, etc.)
- [ ] Run initial migration
- [ ] Test: FastAPI serves at /docs

### Camera & Pose Detection
- [ ] Create `useCamera` hook
- [ ] Create CameraFeed component
- [ ] Handle camera permissions
- [ ] Initialize MediaPipe PoseLandmarker
- [ ] Create `useMediaPipe` hook
- [ ] Set up video processing loop (30 FPS)
- [ ] Create PoseCanvas component
- [ ] Draw skeleton overlay on canvas
- [ ] Create `calculateAngle` utility
- [ ] Create `calculateDistance` utility
- [ ] Write tests for utilities
- [ ] Test: Skeleton visible on camera feed

### Exercise Counting
- [ ] Create `PushUpCounter` class
- [ ] Implement push-up detection logic
- [ ] Write tests for PushUpCounter
- [ ] Create `JumpRopeCounter` class
- [ ] Implement jump rope detection logic
- [ ] Write tests for JumpRopeCounter
- [ ] Create `useExerciseCounter` hook
- [ ] Integrate counter with MediaPipe
- [ ] Test: Counters work with real exercises
- [ ] Calibrate angle thresholds
- [ ] Fix edge cases (partial reps, false positives)

### UI Components
- [ ] Create ExerciseSelector component
- [ ] Create WorkoutControls (Start/Stop/Reset)
- [ ] Create RepCounter display
- [ ] Create WorkoutTimer component
- [ ] Add visual feedback on rep counted
- [ ] Add form instructions/tips
- [ ] Style with TailwindCSS
- [ ] Make responsive (mobile & desktop)
- [ ] Test: UI responsive on different screen sizes

### Authentication
- [ ] Create User registration endpoint
- [ ] Create Login endpoint
- [ ] Implement password hashing (bcrypt)
- [ ] Implement JWT token generation
- [ ] Implement JWT token validation
- [ ] Create authentication middleware
- [ ] Test: Register and login via API
- [ ] Create Login form component
- [ ] Create Register form component
- [ ] Create `authService`
- [ ] Create `useAuth` hook
- [ ] Implement protected routes
- [ ] Store JWT in localStorage
- [ ] Test: Login flow works end-to-end

### Workout Tracking
- [ ] Create POST /workouts endpoint
- [ ] Create GET /workouts endpoint
- [ ] Create GET /statistics/summary endpoint
- [ ] Test: Endpoints work with Postman
- [ ] Create `workoutService`
- [ ] Submit workout on completion
- [ ] Create WorkoutHistory page
- [ ] Create Statistics page
- [ ] Display workout list
- [ ] Display statistics (total reps, workouts)
- [ ] Test: Workouts saved and displayed

### Deployment
- [ ] Create Vercel account
- [ ] Create Railway account
- [ ] Connect GitHub to Vercel
- [ ] Connect GitHub to Railway
- [ ] Set environment variables (Vercel)
- [ ] Set environment variables (Railway)
- [ ] Test: Merge to main triggers deploy
- [ ] Test: Production frontend URL works
- [ ] Test: Production backend URL works
- [ ] Test: Full app works in production

### Testing & Polish
- [ ] Write unit tests for counter logic
- [ ] Write unit tests for utilities
- [ ] Write integration tests for API endpoints
- [ ] Run end-to-end test (full user flow)
- [ ] Test error handling
- [ ] Fix bugs found during testing
- [ ] Test on Chrome and Edge
- [ ] Test on mobile device
- [ ] Update README with setup instructions
- [ ] Document API endpoints

---

## 🛠️ Skills to Build

### Skill 1: `setup-frontend`
**Purpose:** Bootstrap React + Vite + TypeScript frontend with all dependencies
**What it does:**
- Initialize Vite project
- Install dependencies (TailwindCSS, MediaPipe, Zustand, React Router)
- Set up folder structure
- Configure ESLint, Prettier, tsconfig.json
- Create basic routing

### Skill 2: `setup-backend`
**Purpose:** Bootstrap FastAPI backend with PostgreSQL
**What it does:**
- Set up FastAPI project structure
- Install dependencies (FastAPI, SQLAlchemy, Alembic)
- Configure PostgreSQL connection
- Set up Alembic
- Create initial models

### Skill 3: `create-exercise-counter`
**Purpose:** Generate a new exercise counter class
**What it does:**
- Create counter class with template
- Add angle/distance calculation logic
- Generate unit tests
- Update exercise type enum

### Skill 4: `create-api-endpoint`
**Purpose:** Generate a new FastAPI endpoint with tests
**What it does:**
- Create endpoint in correct feature folder
- Add Pydantic schemas
- Add route to router
- Generate integration test

### Skill 5: `create-react-feature`
**Purpose:** Generate a new React feature with component, hook, service
**What it does:**
- Create feature folder structure
- Generate component template
- Generate custom hook
- Generate service (API calls)
- Generate types

---

## 🚀 Quick Start Commands

### Local Development
```bash
# Clone repository
git clone <repo-url>
cd exercise-buddy

# Start all services with Docker
docker-compose up -d

# Frontend: http://localhost:5173
# Backend: http://localhost:8000/docs
# Database: localhost:5432
```

### Without Docker
```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
uvicorn app.main:app --reload

# Database
# Install PostgreSQL and create database 'exercise_counter_dev'
```

---

## 📊 Progress Tracking

Track progress by updating this checklist:

- [x] Day 0: Architecture & Planning
- [ ] Day 1: Foundation & Infrastructure
- [ ] Day 2: Camera & Pose Detection
- [ ] Day 3: Exercise Counting Logic
- [ ] Day 4: Authentication & Backend Integration
- [ ] Deployment & Production Launch

---

## 🎯 MVP vs Future Features

### ✅ In MVP (Build This Weekend)
- Camera feed with pose detection
- Push-up counter
- Jump rope counter
- User authentication (register/login)
- Save workout history
- Basic statistics page
- Docker containerization
- CI/CD pipeline
- Production deployment

### 🔮 Post-MVP (Future)
- More exercises (squats, lunges, planks)
- Form feedback (AI-powered coaching)
- Social features (friends, leaderboards)
- Mobile app (React Native)
- Voice commands
- Workout programs/challenges
- Advanced analytics
- Apple Health / Google Fit integration

---

## 📝 Notes

- **Focus on getting it working first, optimize later**
- **Write tests alongside features, not after**
- **Commit frequently with conventional commit messages**
- **Use feature branches, merge via PRs**
- **Test on real exercises, adjust thresholds as needed**
- **Keep scope tight - no feature creep during MVP**
- **Document as you go (comments, README updates)**

---

## 🆘 Troubleshooting

### Camera not working
- Check browser permissions (Settings → Privacy → Camera)
- Use Chrome or Edge (best MediaPipe support)
- Ensure HTTPS (camera requires secure context)

### Pose detection slow
- Reduce video resolution (640x480 instead of 1280x720)
- Use MediaPipe Lite model (already configured)
- Close other browser tabs

### Docker issues
- Run `docker-compose down -v` to reset
- Check ports not already in use (5173, 8000, 5432)
- Rebuild images: `docker-compose build --no-cache`

### Database connection errors
- Check DATABASE_URL in .env
- Ensure PostgreSQL container is running: `docker ps`
- Check logs: `docker-compose logs db`

---

**Ready to start building! Let's make it work this weekend! 🚀**
