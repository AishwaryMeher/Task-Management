# TaskPop - Full Stack Task Management Application

A modern, full-featured task management application built with React, Express.js, and MongoDB. TaskPop helps teams organize projects, manage tasks, and collaborate effectively.

## Features

- User Authentication with JWT
- Team Management
- Project Organization
- Task Tracking
- Dark/Light Theme Support
- Responsive Design
- Advanced Filtering
- Pagination

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Validation**: Zod
- **API**: RESTful architecture

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd taskflow
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management-app
JWT_SECRET=your-secret-key
```

4. Start the development servers:

```bash
# Start both frontend and backend concurrently
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Routes

### Authentication Routes

- `POST /api/auth/signup`

  - Create a new user account
  - Body: `{ name: string, email: string, password: string }`

- `POST /api/auth/login`

  - Login to existing account
  - Body: `{ email: string, password: string }`

- `GET /api/auth/me`
  - Get current user details
  - Requires: Authentication token

### Team Routes

- `GET /api/teams`

  - List all team members
  - Query params: `page`, `limit`

- `GET /api/teams/:id`

  - Get specific team member details

- `POST /api/teams`

  - Create new team member
  - Body: `{ name: string, email: string, designation: string }`

- `PUT /api/teams/:id`

  - Update team member
  - Body: `{ name?: string, email?: string, designation?: string }`

- `DELETE /api/teams/:id`
  - Remove team member

### Project Routes

- `GET /api/projects`

  - List all projects
  - Query params: `page`, `limit`

- `GET /api/projects/:id`

  - Get specific project details

- `POST /api/projects`

  - Create new project
  - Body: `{ name: string, description: string, teamMembers: string[] }`

- `PUT /api/projects/:id`

  - Update project
  - Body: `{ name?: string, description?: string, teamMembers?: string[] }`

- `DELETE /api/projects/:id`
  - Remove project

### Task Routes

- `GET /api/tasks`

  - List all tasks
  - Query params:
    - `page`: Page number
    - `limit`: Items per page
    - `project`: Filter by project ID
    - `member`: Filter by team member ID
    - `status`: Filter by status
    - `search`: Search in title/description
    - `startDate`: Filter by start date
    - `endDate`: Filter by end date

- `GET /api/tasks/:id`

  - Get specific task details

- `POST /api/tasks`

  - Create new task
  - Body:
    ```typescript
    {
      title: string
      description: string
      deadline: string
      project: string
      assignedMembers: string[]
      status: 'to-do' | 'in-progress' | 'done' | 'cancelled'
    }
    ```

- `PUT /api/tasks/:id`

  - Update task
  - Body: Same as POST (all fields optional)

- `DELETE /api/tasks/:id`
  - Remove task

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Response Format

All API responses follow this format:

### Success Response

```json
{
  "data": [...],
  "totalCount": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend concurrently
- `npm run dev:client` - Start frontend development server only
- `npm run dev:server` - Start backend server with auto-reload
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run server` - Start backend server in production mode

## Project Structure

```
├── server/
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── validators/     # Request validation
│   └── index.ts        # Server entry point
├── src/
│   ├── api/           # API client
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   ├── pages/         # Page components
│   ├── types/         # TypeScript types
│   └── main.tsx       # Frontend entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
