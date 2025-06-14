# YouTube MindMap Generator

Transform YouTube videos into interactive mind maps with just a URL! This project uses FastAPI backend and React frontend to create beautiful, interactive mindmaps from YouTube video content.

## 🚀 Features

- **Generate Mind Maps from YouTube URLs**: Simply paste any YouTube video URL and get a structured mind map of the content
- **Interactive Visualization**: Explore the mind map with pan and zoom controls
- **Smart Summarization**: AI-powered summarization of video content
- **Key Takeaways**: Automatically extract the most important points
- **Multiple Detail Levels**: Choose between different levels of detail
- **Multi-language Support**: Generate mind maps in different languages
- **Save & Share**: Save your mind maps and share them with others

## 📋 Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)

## 🛠️ Quick Start

### Using Docker (Recommended)

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/youtube-mindmap.git
cd youtube-mindmap

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

## 🧠 How to Use

1. Open your browser and navigate to http://localhost:3000
2. Sign up or log in to your account
3. Click on "Create New Mindmap"
4. Paste a YouTube URL in the input field
5. Select your preferences (language, detail level, etc.)
6. Click "Generate MindMap"
7. Wait for the mind map to be generated
8. Explore your mind map!

## 📖 Example

```
# Original YouTube video
https://www.youtube.com/watch?v=7j_NE6Pjv-E

# Generated MindMap
- Mindfulness Meditation (Root)
  - Benefits of Meditation (2:15)
    - Reduced Stress (3:42)
    - Improved Focus (5:18)
    - Better Sleep (8:30)
  - Mindfulness Techniques (10:45)
    - Body Scan (12:30)
    - Breath Awareness (14:20)
    - Loving-kindness (18:50)
  - Daily Practice Tips (22:15)
    - Morning Routine (23:40)
    - Mindful Eating (26:15)
    - Evening Wind-down (28:30)
```

## 🧪 Jupyter Notebook Integration

While this project offers a comprehensive web application for generating mind maps from YouTube videos, you might find that using a Jupyter Notebook provides more flexibility and customization options for your specific needs. 

Jupyter notebooks allow you to:
- Run custom code to process the video transcripts
- Create your own visualizations
- Integrate with other data sources
- Apply advanced natural language processing techniques

> 📝 **Note**: For advanced users or researchers, a Jupyter Notebook approach might offer more powerful capabilities than our web application.

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 Configuration

Configuration is done through environment variables. See `.env.example` files in both backend and frontend directories.

Key configurations:
- `AI_API_KEY`: Your OpenAI or other AI provider API key
- `AI_MODEL_NAME`: AI model to use for generating mindmaps
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT token generation
- `CORS_ORIGINS`: Allowed origins for CORS

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
- [Markmap](https://markmap.js.org/) for mind map visualization
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api) for fetching video transcripts


### Backend logs (continuous)
gcloud compute ssh try@mindtube-server --zone us-central1-a --project tranquil-buffer-459009-r5 --tunnel-through-iap --command 'cd /home/try/code/my-fastapi-app && sudo docker compose logs -f backend'

### Frontend logs (continuous) 
gcloud compute ssh try@mindtube-server --zone us-central1-a --project tranquil-buffer-459009-r5 --tunnel-through-iap --command 'cd /home/try/code/my-fastapi-app && sudo docker compose logs -f frontend'

### All services logs (continuous)
gcloud compute ssh try@mindtube-server --zone us-central1-a --project tranquil-buffer-459009-r5 --tunnel-through-iap --command 'cd /home/try/code/my-fastapi-app && sudo docker compose logs -f'

### VM system logs
gcloud logging tail --resource-type=gce_instance --resource-id=mindtube-server --project=tranquil-buffer-459009-r5

### All logs for your project
gcloud logging tail --project=tranquil-buffer-459009-r5

gcloud compute ssh try@mindtube-server --zone us-central1-a --project tranquil-buffer-459009-r5 --tunnel-through-iap --command 'cd /home/try/code/my-fastapi-app && sudo docker compose logs -f backend'