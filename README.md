# AI-Shu: One-Stop Student Support

AI-Shu is a comprehensive educational platform designed to provide students with personalized tutoring, exam preparation, coursework guidance, and time management tools for IGCSE, IB, A-Levels, and CBSE curricula.

## Features

- **Universal Subject Help**: Step-by-step explanations across all subjects
- **Exam Preparation**: Board-specific revision notes, flashcards, and practice tests
- **Coursework Coaching**: IA/EE guidance with academic integrity guardrails
- **Homework Helper**: OCR-powered problem solving with scaffolded learning
- **Time Management**: Smart scheduling and progress tracking
- **Parent & Teacher Dashboards**: Progress monitoring and reporting

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Python 3.9+ (for AI services)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Al-Shu

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Services**: Python with FastAPI
- **Caching**: Redis
- **File Storage**: AWS S3 compatible

## Project Structure

```
Al-Shu/
├── client/          # Next.js frontend
├── server/          # Node.js backend API
├── ai-services/     # Python AI microservices
├── shared/          # Shared types and utilities
├── docs/           # Documentation
└── scripts/        # Build and deployment scripts
```

## Development

See individual README files in each service directory for detailed setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.