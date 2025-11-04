# 🎙️ Meeting Whisperer

Real-time AI meeting assistant that transcribes discussions, detects action items, and automatically generates Jira tasks and PR descriptions.

## ✨ Features

- 🎧 **Real-time Transcription**: Live audio capture and speech-to-text using OpenAI Whisper
- 📝 **Smart Summarization**: AI-powered meeting summaries with key points and decisions
- ✅ **Action Item Detection**: Automatically identifies tasks, assignees, and priorities
- 🎯 **Jira Integration**: Generates professional task descriptions and creates tickets
- 💬 **Team Communication**: Posts summaries to Microsoft Teams or Slack
- 👥 **Speaker Diarization**: Identifies who said what (optional)
- 🎨 **Beautiful UI**: Professional Partner Portal-inspired design

## 🏗️ Architecture

### Multi-Agent System
```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  Listener       │─────▶│  Summarizer      │─────▶│  Task Generator    │
│  Agent          │      │  Agent           │      │  Agent             │
│  (Whisper API)  │      │  (GPT-4)         │      │  (GPT-4)           │
└─────────────────┘      └──────────────────┘      └────────────────────┘
         │                        │                          │
         │                        ▼                          │
         │               ┌──────────────────┐               │
         └──────────────▶│  Integration     │◀──────────────┘
                         │  Agent           │
                         │  (Jira/Teams/    │
                         │   Slack)         │
                         └──────────────────┘
```

### Tech Stack
- **Backend**: Python 3.11, FastAPI, WebSockets, asyncio
- **Frontend**: React 18, TypeScript, Styled Components, React Query
- **AI/ML**: OpenAI Whisper API, GPT-4 Turbo
- **Integrations**: Jira REST API, MS Teams Webhooks, Slack Webhooks
- **Design**: CRB Partner Portal Design System

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+** (with pip)
- **Node.js 18+** (with npm)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Jira Account** (optional, for task creation)
- **Teams/Slack Webhook** (optional, for posting summaries)

### Quick Start (Development)

#### 1. Clone and Navigate
```powershell
cd c:\Users\mkaplan\source\repos\Hakton\meeting-whisperer
```

#### 2. Backend Setup
```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your OpenAI API key

# Start backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at `http://localhost:8000`

#### 3. Frontend Setup (New Terminal)
```powershell
cd c:\Users\mkaplan\source\repos\Hakton\meeting-whisperer\frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:3000`

### 🐳 Docker Setup (Production)
```powershell
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Configuration

### Backend Configuration (.env)

Create `backend/.env` from `backend/.env.example`:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
WHISPER_MODEL=whisper-1

# Jira Configuration (Optional)
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=PROJ

# Microsoft Teams (Optional)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Application Settings
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Agent Settings
ENABLE_SPEAKER_DIARIZATION=True
ACTION_ITEM_CONFIDENCE_THRESHOLD=0.7
AUTO_CREATE_JIRA_TASKS=False
```

### Frontend Configuration (.env)

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 📖 Usage Guide

### Starting a Meeting

1. **Open the App**: Navigate to `http://localhost:3000`
2. **Go to Meeting Page**: Click on "Meeting" in the sidebar
3. **Start Recording**: Click the 🎙️ button to begin
4. **Speak Naturally**: The AI will transcribe in real-time
5. **View Action Items**: Watch as tasks are detected automatically

### During the Meeting

- **Live Transcript**: See real-time transcription with speaker identification
- **Action Item Detection**: Tasks appear automatically as they're mentioned
- **Timer**: Track meeting duration
- **Stop Recording**: Click ⏹️ to end

### After the Meeting

1. **Review Summary**: Check the AI-generated summary
2. **Edit Action Items**: Modify tasks if needed
3. **Create Jira Tasks**: Click "Create Jira Tasks" button
4. **Post to Teams/Slack**: Share summary with team
5. **View History**: Access past meetings in History page

## 🎯 API Endpoints

### REST API

```
GET  /                           - Health check
GET  /api/health                 - Detailed health status
POST /api/meeting/{id}/end       - End meeting & generate summary
POST /api/meeting/{id}/create-jira-tasks - Create Jira tasks
POST /api/meeting/{id}/post-summary      - Post to Teams/Slack
GET  /api/sessions               - List active sessions
```

### WebSocket API

```
WS /ws/meeting/{session_id}      - Real-time meeting connection
```

**Messages:**
- `type: "transcript"` - Live transcription
- `type: "action_items"` - Detected tasks

## 🧪 Testing

```powershell
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 🎨 UI Components

The UI follows the CRB Partner Portal design system:

- **Colors**: Primary blue (#03A0EF), success green, error red
- **Typography**: System fonts, clear hierarchy
- **Components**: Cards, Buttons, Forms with consistent styling
- **Layout**: Sidebar navigation, fixed header, content area
- **Responsive**: Mobile-friendly breakpoints

## 🔒 Security Notes

- **API Keys**: Never commit `.env` files
- **CORS**: Configure allowed origins in production
- **Authentication**: Add auth layer for production use
- **Recording Consent**: Ensure meeting participants are aware
- **Data Privacy**: Audio data is sent to OpenAI API

## 🐛 Troubleshooting

### Backend Won't Start
```powershell
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check OpenAI API key
echo $env:OPENAI_API_KEY
```

### Frontend Won't Start
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Check Node version
node --version  # Should be 18+
```

### No Audio Transcription
- Verify OpenAI API key is set correctly
- Check microphone permissions in browser
- Ensure audio format is supported (WAV, MP3)

### TypeScript Errors
```powershell
# Install dependencies first
cd frontend
npm install

# Errors will resolve after installing packages
```

## 📚 Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [React Documentation](https://react.dev/)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for your hackathon or production!

## 👏 Acknowledgments

- OpenAI for Whisper and GPT-4 APIs
- CRB Design System for UI inspiration
- FastAPI and React communities

---

**Built with ❤️ for the Hackathon**

*Questions? Open an issue or reach out to the team!*
