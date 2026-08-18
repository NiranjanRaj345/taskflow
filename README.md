# TaskFlow - Team Collaboration & Task Management

A production-ready full-stack web application for team collaboration and task management, built with **React**, **Node.js**, **Express.js**, **MongoDB**, and **Redis**.

## Architecture

```
taskflow/
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

## Database Connection Pooling

MongoDB connection is configured with connection pooling:
- `maxPoolSize: 10` (configurable via `MONGODB_POOL_SIZE`)
- `serverSelectionTimeoutMS: 10000`
- `socketTimeoutMS: 45000`
- `family: 4` - Force IPv4
- `directConnection: true` - Direct TCP connection
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
cd taskflow

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

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/user` - Get current user's tasks
- `GET /api/tasks/team/:teamId` - Get team tasks
- `GET /api/tasks/stats/:teamId` - Get task statistics

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members` - Remove member

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

## AI & Engineering Knowledge

### Generative AI
- Generative AI creates new content rather than classifying existing data.
- Common approaches include GANs, VAEs, and transformer-based generation.
- In software, it is used for code assistance, content generation, and test-data synthesis.

### LLMs
- Large Language Models are transformer-based models trained on large text corpora.
- They excel at natural language understanding, summarization, translation, and code generation.
- In this project, LLM concepts are relevant to automation like smart task description generation, chat-based assistance, and semantic search over tasks or documentation.

### RAG
- Retrieval-Augmented Generation combines retrieval with generation.
- It improves accuracy by grounding model responses in retrieved documents instead of relying only on parametric memory.
- Here, RAG could be applied to build an internal assistant that answers from task docs, wikis, or past tickets.

### MCP
- Model Context Protocol standardizes how applications expose context to models.
- It enables consistent integration between tools, data sources, and models across environments.
- This project follows a similar separation of concerns: routes → controllers → services → repositories, which maps cleanly to tool/data/model interaction boundaries.

### Vector Databases
- Vector databases store embeddings and support similarity search.
- They are used for semantic search, recommendation, and RAG retrieval.
- A production extension could add embeddings for task descriptions and use a vector store for semantic task lookup.

### Agentic AI
- Agentic AI refers to systems that plan, use tools, and act autonomously toward goals.
- Key ideas include tool calling, memory, planning, and feedback loops.
- This project already has agent-ready structure: discrete services, middleware, auth, and external integrations can become tool calls for an AI task assistant or workflow agent.

## Future Enhancements

- Real-time notifications with Socket.io
- File upload with Multer/S3
- Email notifications
- Advanced reporting & analytics
- Mobile app (React Native)
- OAuth integration (Google, GitHub)

## License

MIT
