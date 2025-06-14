# SaaS Template

A complete, production-ready SaaS template built with modern technologies. Get started building your next SaaS product with authentication, user management, dashboard, and more - all included out of the box.

## 🚀 Features

- **Complete Authentication System**: User registration, login, password reset, email verification
- **Modern React Frontend**: Built with React 18, TypeScript, TanStack Router, and Chakra UI
- **FastAPI Backend**: Scalable Python backend with automatic API documentation
- **Database Ready**: PostgreSQL with SQLModel/SQLAlchemy and Alembic migrations
- **User Management**: Profile management, user settings, admin functionality
- **Multi-language Support**: i18next integration for internationalization
- **Dark/Light Mode**: Built-in theme switching with Chakra UI
- **Email System**: Transactional emails with customizable templates
- **Production Ready**: Docker containerization and deployment scripts
- **Developer Experience**: Type-safe API client generation, comprehensive testing

## 📋 Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)

## 🛠️ Quick Start

### Using Docker (Recommended)

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/saas-template.git
cd saas-template

# Start all services
docker-compose up -d
```

Then visit http://localhost:3000 in your browser.

### Manual Setup

#### Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your settings

# Run migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🎯 What's Included

### Backend (FastAPI)
- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: Registration, login, profile management
- **API Documentation**: Automatic Swagger/ReDoc generation
- **Database**: PostgreSQL with SQLModel/SQLAlchemy
- **Email**: Transactional email system
- **Testing**: Comprehensive test suite
- **Security**: CORS, rate limiting, input validation

### Frontend (React)
- **Modern Stack**: React 18, TypeScript, Vite
- **Routing**: TanStack Router with type-safe navigation
- **State Management**: TanStack Query for server state
- **UI Components**: Chakra UI component library
- **Forms**: React Hook Form with validation
- **Internationalization**: i18next for multi-language support
- **Theme**: Dark/light mode with system preference detection

### Infrastructure
- **Containerization**: Docker and Docker Compose setup
- **Database**: PostgreSQL with connection pooling
- **Environment**: Configurable environment variables
- **Deployment**: Production-ready deployment scripts
- **Monitoring**: Health checks and logging

## 🧪 Usage Examples

### Creating a New Feature

1. **Add Backend API**:
```python
# backend/app/api/routes/your_feature.py
@router.post("/", response_model=YourFeaturePublic)
async def create_feature(
    *, session: SessionDep, feature_in: YourFeatureCreate, current_user: CurrentUser
) -> Any:
    feature = YourFeature.model_validate(
        {**feature_in.model_dump(), "user_id": current_user.id}
    )
    session.add(feature)
    session.commit()
    session.refresh(feature)
    return feature
```

2. **Add Frontend Component**:
```tsx
// frontend/src/components/YourFeature/YourFeature.tsx
export const YourFeature: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['yourFeature'],
    queryFn: () => YourFeatureService.getFeatures(),
  });

  if (isLoading) return <Spinner />;
  
  return (
    <Box>
      {/* Your component content */}
    </Box>
  );
};
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 Configuration

Configuration is done through environment variables. See `.env.example` files in both backend and frontend directories.

Key configurations:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT token generation
- `CORS_ORIGINS`: Allowed origins for CORS
- `EMAIL_*`: Email service configuration
- `VITE_API_URL`: Backend API URL for frontend

## 🚀 Deployment

### Using Docker

```bash
# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The template includes deployment configurations for:
- Google Cloud Platform (GCP)
- AWS (coming soon)
- Azure (coming soon)

See the `deploy_gcp/` directory for GCP-specific deployment scripts.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend library
- [Chakra UI](https://chakra-ui.com/) for the UI components
- [TanStack](https://tanstack.com/) for routing and state management
- [SQLModel](https://sqlmodel.tiangolo.com/) for database ORM

## 📊 Architecture

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── core/           # Core functionality
│   │   │   ├── models.py       # Database models
│   │   │   └── main.py         # Application entry point
│   │   ├── tests/              # Backend tests
│   │   └── alembic/            # Database migrations
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── routes/         # Application routes
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── utils/          # Utility functions
│   │   └── tests/              # Frontend tests
│   ├── deploy_gcp/             # GCP deployment configs
│   └── terraform/              # Infrastructure as code
└── docker-compose.yml      # Development environment
```

## 🔮 What's Next?

This template is actively maintained and improved. Upcoming features:
- Payment integration (Stripe)
- Email marketing integration
- Advanced admin dashboard
- Multi-tenancy support
- Real-time notifications
- API rate limiting dashboard