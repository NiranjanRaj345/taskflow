# FlowBoard - Team Collaboration & Task Management

A production-ready full-stack web application for team collaboration and task management, built with **React**, **Node.js**, **Express.js**, **MongoDB**, and **Redis**.

## Architecture

```
flowboard/
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API service layer
│   └── Dockerfile
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Database & Redis configuration
│   │   ├── models/         # Mongoose schemas
│   │   ├── repositories/   # Data access layer (Repository pattern)
│   │   ├── services/       # Business logic layer
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── utils/          # Logger & utilities
│   └── Dockerfile
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Design Patterns Used

- **Repository Pattern**: Data access abstraction (UserRepository, TaskRepository, TeamRepository)
- **Service Layer Pattern**: Business logic separation (AuthService, TaskService, TeamService)
- **Middleware Pattern**: Request/response processing (auth, validation, error handling)
- **Factory Pattern**: Notification service factory (extensible)
- **Strategy Pattern**: Task filtering strategies
- **Singleton Pattern**: Database & Redis connection management

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database (with connection pooling)
- **Mongoose** - MongoDB ODM
- **Redis** - Caching layer
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

## Features

### Authentication & Users
- JWT-based registration and login
- Profile page with editable name, email, and avatar
- Unique `userId` per user for validation and lookup
- Password hashing with bcrypt

### Teams
- Create public or private teams
- Public teams are discoverable; private teams are invite-only
- Join requests and admin/owner approval flow
- Role-based access: `owner`, `admin`, `member`
- Add/remove members
- Update member roles
- Invite links for joining teams
- Team creator/owner detection with safe ObjectId handling

### Tasks
- Create tasks assigned to team members
- Task status workflow: `todo` → `in-progress` → `review` → `done`
- Status and priority filtering
- "My Tasks" filter for assigned users
- Assigned users can update task status
- Owners/admins can update any task field
- Completion indicators and done-task highlighting

### Security & Production Readiness
- Helmet security headers
- Rate limiting
- Input validation with Joi
- MongoDB sanitization and XSS protection
- Redis caching with invalidation
- Request ID tracking
- Graceful shutdown
- Health check endpoints

## Database Connection Pooling

MongoDB connection is configured with connection pooling:
- `maxPoolSize: 10` (configurable via `MONGODB_POOL_SIZE`)
- `serverSelectionTimeoutMS: 10000`
- `socketTimeoutMS: 45000`
- `family: 4` - Force IPv4
- Connection event handlers for monitoring

## Caching Strategy

Redis is used for caching frequently accessed data:
- GET requests cached with configurable TTL
- Cache invalidation on data mutations
- Pattern-based cache clearing

## Git Workflow

This project follows a **Feature Branch Workflow**:

1. `main` branch - Production-ready code
2. `develop` branch - Integration branch
3. `feature/*` branches - New features
4. `hotfix/*` branches - Production fixes

### Common Git Commands

```bash
# Clone repository
  git clone <repo-url>
  cd flowboard

# Create feature branch
git checkout -b feature/task-assignment

# Stage and commit
git add .
git commit -m "feat: add task assignment feature"

# Push to remote
git push origin feature/task-assignment

# Create pull request
gh pr create --base develop --title "feat: add task assignment"

# Merge and cleanup
git checkout develop
git merge feature/task-assignment
git branch -d feature/task-assignment
```

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 7+
- Redis 7+
- Docker & Docker Compose (optional)

### Option 1: Using Docker

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

### Option 2: Manual Setup

#### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/users` - List users

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/user` - Get current user's assigned tasks
- `GET /api/tasks/team/:teamId` - Get team tasks
- `GET /api/tasks/stats/:teamId` - Get task statistics

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all public teams
- `GET /api/teams/public` - Get public teams
- `GET /api/teams/my` - Get my teams
- `GET /api/teams/:id` - Get team by ID
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/request-join` - Request to join team
- `POST /api/teams/:id/approve` - Approve join request
- `POST /api/teams/:id/reject` - Reject join request
- `GET /api/teams/:id/requests` - Get join requests
- `POST /api/teams/:id/invite` - Generate invite link
- `POST /api/invite/:token/accept` - Accept invite
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members` - Remove member
- `PATCH /api/teams/:id/members/role` - Update member role

## Project Structure Details

### Backend Architecture (Layered)

```
src/
├── config/           # Database, Redis, environment configs
├── models/           # Mongoose schemas
├── repositories/     # Data access layer (CRUD operations)
├── services/         # Business logic layer
├── controllers/      # Request/response handlers
├── routes/           # API route definitions
├── middleware/       # Auth, validation, error handling
└── utils/            # Logger, helpers
```

### Frontend Architecture

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-level components
├── hooks/            # Custom React hooks
├── services/         # API service layer
└── utils/            # Helper functions
```

## Security Features

- Helmet.js for security headers
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Joi
- Rate limiting
- CORS configuration
- MongoDB sanitization
- XSS protection
- Request ID tracking
- Graceful error handling

## Future Enhancements

- Refresh tokens
- Pagination for large task lists
- Real-time updates with Socket.io
- File uploads with S3
- Integration tests for full auth flow
- Switch to @tanstack/react-query v5

## License

MIT
