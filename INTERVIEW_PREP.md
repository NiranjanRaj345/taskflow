# FlowBoard — Interview Preparation Guide

## 1. Elevator Pitch (2 min)

> "FlowBoard is a production-ready, full-stack team collaboration and task management app I built end-to-end. It has a React frontend deployed on Vercel, a Node.js/Express backend on Render, and is designed to connect to MongoDB Atlas with Redis caching. The architecture follows clean separation of concerns: routes → controllers → services → repositories, with JWT auth, input validation, rate limiting, security headers, and graceful shutdown. The key differentiator is that it's built to be production-hardened — not just a CRUD demo."

---

## 2. Demo Script (10–12 min)

### Step 1: Live URLs (30 sec)
- Frontend: https://taskflow-sepia-six.vercel.app
- Backend API: https://taskflow-gb50.onrender.com
- GitHub repo: https://github.com/RAGHUL-123/taskflow

**Say:** "Both are live right now. The backend health check returns 200, and the frontend is a fully functional SPA."

### Step 2: Register & Login (1 min)
1. Open the frontend URL
2. Click "create a new account"
3. Register a new user (or login if already registered)
4. Show the dashboard loading with "Welcome, [name]"

**Say:** "Auth uses JWT stored in localStorage. The backend validates credentials against MongoDB with bcrypt hashing. On the frontend, React Query handles server state, and the AuthProvider manages the session."

### Step 3: Create a Team (1 min)
1. Go to "Teams" → "New Team"
2. Enter a team name and description
3. Submit and show the team card appear

**Say:** "Teams have an owner, and members can be added or removed. The backend validates that the user exists, creates the team with the creator as owner, and invalidates the Redis cache."

### Step 4: Create a Task (1.5 min)
1. Go to "Tasks" → "New Task"
2. Fill in: title, description, status, priority, team ID (paste the team ID from the team you just created), assigned user ID, due date
3. Submit and show the task in the table

**Say:** "Tasks are linked to teams and users. The backend validates that the team and assigned user exist before creating the task. This prevents orphaned data."

### Step 5: Filter & Update Tasks (1 min)
1. Use the status and priority dropdowns to filter
2. Click the edit icon to toggle a task between todo and in-progress
3. Click the delete icon to remove a task

**Say:** "Filtering is done via query params. Updates invalidate the cache so React Query fetches fresh data."

### Step 6: Show the Code (3 min)
Open the repo and walk through:

**Backend structure:**
```
server/src/
├── config/         # Database & Redis
├── models/         # Mongoose schemas
├── repositories/   # Data access layer
├── services/       # Business logic
├── controllers/    # Request handlers
├── routes/         # API routes
├── middleware/     # Auth, validation, error handling
└── utils/          # Logger, helpers
```

**Point to key files:**
- `server/src/app.js` — "Here's where I set up security middleware: Helmet for CSP/HSTS, CORS with env-based origin, rate limiting, mongo-sanitize, xss-clean, compression, and request ID tracking."
- `server/src/config/database.js` — "MongoDB connection pooling with configurable pool size, timeouts, and error handlers."
- `server/src/middleware/auth.js` — "JWT verification with role-based authorization."
- `server/src/services/` — "Business logic is isolated here so routes stay thin."
- `server/src/config/redis.js` — "Cache middleware with TTL, invalidated on mutations using SCAN instead of blocking KEYS."

**Frontend structure:**
```
client/src/
├── components/     # Layout, ErrorBoundary
├── pages/          # Login, Register, Dashboard, Tasks, Teams
├── hooks/          # useAuth context
└── services/       # Axios instance with interceptors
```

**Point to key files:**
- `client/src/hooks/useAuth.jsx` — "Auth context wraps the app. On mount it validates the stored token, and 401s clear it automatically."
- `client/src/services/api.js` — "Axios with request/response interceptors. I fixed the 401 handler to avoid hard reloads."
- `client/vercel.json` — "SPA rewrite so React Router works on Vercel."

### Step 7: Security & Production Hardening (1 min)
- Helmet security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting (15 min window, 100 req default)
- Input validation with Joi on every write endpoint
- MongoDB sanitization + XSS protection
- Request ID tracking in logs
- Graceful shutdown on SIGINT/SIGTERM
- Non-root Docker user
- Health checks for load balancers

### Step 8: What I'd Improve Next (30 sec)
- Add refresh tokens (currently only access token)
- Add pagination for large task lists
- Add real-time updates with Socket.io
- Add file uploads with S3
- Add integration tests for the full auth flow
- Switch to @tanstack/react-query v5

---

## 3. Technical Deep-Dive: Key Questions & Answers

### Q: Why did you choose this architecture?
**A:** "I wanted separation of concerns so each layer has a single responsibility. Routes handle HTTP, controllers format responses, services contain business rules, and repositories abstract data access. This makes it testable — I can mock repositories in service tests — and it's easy to swap implementations, like moving from MongoDB to Postgres."

### Q: How does auth work end-to-end?
**A:** "On register/login, the backend hashes the password with bcrypt (salt rounds 12), creates a JWT signed with `JWT_SECRET`, and returns it. The frontend stores it in localStorage. Every subsequent request includes it as a Bearer token. The auth middleware verifies the JWT, loads the user from the database, and attaches `req.user`. If the token is invalid or expired, it returns 401. The frontend interceptor clears localStorage on 401."

### Q: Why Redis? What are you caching?
**A:** "Redis caches GET responses for tasks and teams with a TTL. On any mutation — create, update, delete — I invalidate the relevant cache keys. I used SCAN instead of KEYS for invalidation because KEYS is O(N) and blocks the event loop. In production with many keys, SCAN is non-blocking."

### Q: How do you handle errors?
**A:** "There are three layers: validation errors from Joi return 400 with field-level messages; business logic errors throw custom errors with status codes; and unexpected errors hit the global error handler which logs with Winston and returns 500 in production, or includes the stack in development."

### Q: What's the connection pooling config?
**A:** "Mongoose is configured with `maxPoolSize: 10` (configurable via env), `serverSelectionTimeoutMS: 10s`, and `socketTimeoutMS: 45s`. This prevents connection exhaustion under load and gives clear timeouts if Atlas is unreachable."

### Q: Why did you remove the demo store?
**A:** "The demo store was a temporary fallback for local development when MongoDB wasn't available. For production, it's dangerous because data is in-memory and resets on every deploy. I removed it so the app fails fast and clearly if the database is down, rather than silently accepting writes that disappear."

### Q: How do you deploy?
**A:** "Frontend is a static build on Vercel with a rewrite rule for SPA routing. Backend is a Docker container on Render with environment variables for MongoDB, Redis, and JWT. The Dockerfile uses a non-root user and creates the logs directory. I also set up a GitHub Actions CI/CD pipeline that runs lint, tests, and builds on every push."

### Q: What design patterns did you use?
**A:** "Repository pattern abstracts data access so services don't know about Mongoose. Service layer pattern keeps business logic out of controllers. Middleware pattern for cross-cutting concerns like auth and validation. Singleton pattern for the database and Redis connections."

---

## 4. Q&A Preparation

| Question | Key Points |
|----------|-----------|
| Biggest technical challenge? | Atlas connectivity from Render; solved by removing `directConnection` and ensuring correct network whitelist |
| How do you test? | Jest + Supertest for API smoke tests; ESLint for code quality; manual testing with curl |
| How do you handle CORS? | Env-based `CLIENT_URL` in production, `true` in dev. Credentials enabled for cookies. |
| What happens if Redis is down? | App continues without caching — `cacheMiddleware` and `invalidateCache` are no-ops when `redisClient` is null |
| How do you prevent SQL injection? | MongoDB sanitization middleware + parameterized queries via Mongoose ODM |
| How do you prevent XSS? | `xss-clean` middleware sanitizes user input in req.body |
| What happens on deploy? | In-memory data is lost. MongoDB persists. Cache is cold but repopulates on first request. |
| Why bcrypt rounds 12? | Industry standard. High enough to resist rainbow tables, low enough for acceptable latency. |
| How do you scale this? | Horizontal scaling with multiple Render instances behind a load balancer. Redis for shared cache. MongoDB replica set for read scaling. |

---

## 5. Demo Tips

- **Keep the browser tab open** before the interview starts so the app is warm
- **Have the backend health check tab open** to show `{"success": true}` instantly
- **Pre-register a user** so you don't waste time on registration during the walkthrough
- **Have a team and a task ready** so you can show filtering and updates immediately
- **Know your repo structure** — practice navigating to the key files in under 10 seconds
- **Don't get stuck on UI polish** — this is a backend-heavy project. Focus on architecture, security, and production readiness

---

## 6. Practice Flow (5 min drill)

1. Open frontend → login
2. Open API health endpoint → show JSON
3. Create team → show in list
4. Create task → show in table
5. Filter tasks → show filtering works
6. Switch to code → show `app.js` security middleware (30 sec)
7. Switch to code → show `TaskService.js` validation + cache invalidation (30 sec)
8. Switch to code → show `database.js` connection pooling (20 sec)
9. Close with: "Full stack, production-ready, live on Render and Vercel"

---

## 7. Things to Mention If Asked

- **Why no refresh tokens?** "I prioritized access tokens for simplicity in this iteration. Refresh tokens are on the roadmap."
- **Why in-memory cache vs persisted?** "Cache is a performance optimization, not a data store. If Redis is down, the app still works — it just hits MongoDB directly."
- **Why not GraphQL?** "REST was sufficient for the scope. GraphQL would add complexity without clear benefit for this use case."
- **Why Vercel for frontend?** "It's free for this scale, auto-deploys from Git, and handles SPA routing with a simple config."

---

## 8. Final Checklist Before Interview

- [ ] Frontend URL loads and login works
- [ ] Backend `/api/health` returns 200
- [ ] GitHub repo is public and up-to-date
- [ ] `README.md` is clear and complete
- [ ] You can navigate to the 3-4 key backend files in under 10 seconds each
- [ ] You can explain the request flow: browser → Vercel → Render → Express → middleware → controller → service → repository → MongoDB
- [ ] You know the exact connection pooling config (`maxPoolSize`, `serverSelectionTimeoutMS`, `socketTimeoutMS`)
- [ ] You know the rate limiting config (window, max requests, excluded health endpoints)
