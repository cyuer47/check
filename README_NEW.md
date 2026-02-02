# Overhoorder - Educational Quiz Application

A modern web-based quiz application designed for Dutch VO schools, featuring real-time sessions, grading, and comprehensive teacher tools.

## Features

- **Real-time Sessions**: Server-Sent Events (SSE) for live quiz sessions
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Teacher and student roles with profile management
- **Quiz System**: Create and manage question lists with multiple question types
- **Live Grading**: Real-time grading and feedback during sessions
- **Dashboard**: Comprehensive dashboard with statistics and class management
- **Material Design**: Modern UI with Material Design 3 principles
- **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with migrations
- **Frontend**: Vanilla JavaScript with Material Design 3
- **Real-time**: Server-Sent Events (SSE)
- **Authentication**: JWT tokens
- **Security**: bcrypt for password hashing

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd overhoorder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations (if any):
```bash
npm run migrate
```

## Environment Variables

Create a `.env` file with the following variables:

```env
SECRET=your-jwt-secret-here          # JWT secret key (required)
PORT=3000                            # Server port (default: 3000)
DEBUG_REQUESTS=false                  # Enable request logging (default: false)
VIOLATION_THRESHOLD=1                 # Auto-ban threshold (default: 1)
```

## Running the Application

### Development
```bash
npm run dev
```
Starts the server with file watching for hot reloading.

### Production
```bash
npm start
```
Starts the server in production mode.

## Project Structure

```
overhoorder/
├── assets/                 # Static assets (CSS, images, fonts)
├── backups/               # Database backups
├── routes/                # API route handlers
├── middleware/            # Custom middleware
├── services/              # Business logic
├── utils/                 # Helper functions
├── config/                # Configuration files
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile

### Dashboard
- `GET /dashboard-data` - Get dashboard statistics
- `POST /create-klas` - Create new class
- `GET /klas/:id` - Get class details

### Sessions
- `POST /start-sessie` - Start new quiz session
- `GET /sessies/:id/stream` - SSE stream for live updates
- `POST /submit-answer` - Submit quiz answer

### Search
- `GET /search` - Search public profiles

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting and violation detection
- CORS configuration
- SQL injection prevention

## Development

### Adding New Features

1. Create route handlers in `routes/`
2. Implement business logic in `services/`
3. Add middleware in `middleware/`
4. Update documentation

### Database Migrations

Create migration files in the `migrations/` directory and run:
```bash
npm run migrate
```

## Deployment

### Nginx Configuration

For production deployment with Nginx, see `nginx-sse-config.conf` for SSE-specific configuration.

### Environment Setup

1. Set production environment variables
2. Configure reverse proxy (Nginx)
3. Set up SSL certificates
4. Configure database backups
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]

## Support

For support and questions, please create an issue in the repository.
