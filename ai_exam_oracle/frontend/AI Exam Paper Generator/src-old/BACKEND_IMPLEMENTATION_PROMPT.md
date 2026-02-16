# AI Exam Oracle - Complete Backend Implementation Prompt

## Project Overview
Build a **production-ready Python backend** for AI Exam Oracle - a premium offline-capable academic tool that trains local AI on subject files/folders and generates highly customized exam papers. The system must work seamlessly across **web (local), Firebase hosting, and Android APK**.

**Working Directory:** `C:\Users\Vinz\Downloads\Internship Project\ai_exam_oracle\frontend`

---

## Critical Requirements

### 1. Technology Stack
- **Backend Framework:** FastAPI (Python-only)
- **AI/ML:** Local language models optimized for fast question generation
- **Database:** SQLite for offline support + Firebase Firestore for cloud sync
- **Vector Store:** ChromaDB or FAISS for RAG pipeline
- **Embeddings:** Sentence-Transformers or similar lightweight model
- **Android:** Python backend wrapped with Kivy/BeeWare OR FastAPI serving React Native WebView
- **Deployment:** Firebase Hosting for web, local server for desktop/Android

### 2. Language Model Requirements
- **Must be fast** - optimized for question generation (not general chat)
- **Offline-capable** - runs locally without internet
- **Lightweight** - suitable for mobile/desktop deployment
- **Specialized** - fine-tuned or prompted for educational content generation
- **Suggested Models:**
  - Google Gemini Flash 3 (if available via API)
  - Mistral 7B quantized (GGUF format)
  - Phi-3 Mini (Microsoft)
  - TinyLlama fine-tuned for education
  - Custom model using LoRA adapters

### 3. RAG Pipeline Architecture
```
1. Subject Upload → Document Processing (PDF/DOCX/TXT)
2. Text Chunking → Semantic Embeddings → Vector Database
3. Topic-Specific Indexing → Question Generation Context Retrieval
4. Prompt Engineering → LLM Generation → Quality Validation
5. OBE Course Outcome Mapping → Bloom's Taxonomy Classification
```

---

## Complete Feature Set (Frontend Already Built)

### **Dashboard & Home**
- Quick stats (subjects, exams, questions)
- Recent activity feed
- Streak tracking with animations
- Today's goals system
- Achievement badges

### **Subject Library & Management**
- **Subject Cards:** Display all subjects with color-coded gradients
- **Subject Detail Page:**
  - View introduction, total questions, syllabus coverage
  - Textbook reference upload section
  - Topics list with expandable actions
  - Stats cards with animations
  
- **Subject Editing (Modal):**
  - Edit subject name, code, introduction
  - Color theme picker (6 gradient options)
  - Delete subject with confirmation modal
  
- **Topic Management:**
  - Add new topics to any subject
  - Inline topic editing (rename topics)
  - Delete topics with confirmation
  - Per-topic actions:
    - Upload Questions (bulk import)
    - Update Syllabus (RAG context update)
    - Generate Questions (AI-powered)
  - Question count per topic
  - Syllabus status indicator

### **Training Lab**
- Upload subject materials (PDF, DOCX, TXT, folders)
- Train AI on specific subjects/topics
- OBE Course Outcome mapping interface
- Progress tracking with visual feedback
- Training history and logs

### **Rubric Engine**
- Complexity sliders (Bloom's Taxonomy levels)
- Coverage sliders (topic distribution)
- Difficulty distribution controls
- Question type selection (MCQ, Short Answer, Essay, etc.)
- Marks allocation

### **AI Question Generation**
- Real-time question generation using local LLM
- Context-aware using RAG from uploaded materials
- Bloom's taxonomy classification
- OBE outcome tagging
- Topic-specific generation
- Batch generation support

### **Quality Vetting Center**
- Review generated questions before adding to vault
- Approve/Reject/Edit questions
- Quality scoring (relevance, difficulty, clarity)
- Batch approval actions

### **Exam Paper Generation**
- Select subjects and topics
- Apply rubric settings
- Generate formatted exam papers (PDF)
- Preview before export
- Multiple export formats

### **Analytics & Reports**
- Question bank statistics
- Coverage analysis per subject
- Bloom's taxonomy distribution
- Generation history
- Performance metrics

### **Settings & Profile**
- User preferences
- Model configuration
- Export/Import data
- Notifications management
- Streak and achievements tracking

---

## Backend API Endpoints Required

### **Authentication & User**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### **Subjects Management**
```
GET    /api/subjects                    # List all subjects
GET    /api/subjects/{id}                # Get subject details
POST   /api/subjects                     # Create new subject
PUT    /api/subjects/{id}                # Update subject (name, code, color, intro)
DELETE /api/subjects/{id}                # Delete subject
POST   /api/subjects/{id}/textbook       # Upload textbook reference
```

### **Topics Management**
```
GET    /api/subjects/{id}/topics         # List topics for subject
POST   /api/subjects/{id}/topics         # Add new topic
PUT    /api/topics/{id}                  # Update topic name
DELETE /api/topics/{id}                  # Delete topic
POST   /api/topics/{id}/syllabus         # Upload/update syllabus for topic
POST   /api/topics/{id}/upload-questions # Bulk upload questions to topic
```

### **Training & RAG**
```
POST   /api/training/upload              # Upload documents for training
POST   /api/training/process             # Process and embed documents
GET    /api/training/status/{job_id}     # Training job status
POST   /api/training/obe-mapping         # Map course outcomes
```

### **Question Generation**
```
POST   /api/generate/questions           # Generate questions for topic
GET    /api/generate/status/{job_id}     # Generation status
POST   /api/generate/batch               # Batch generation
```

### **Question Vault**
```
GET    /api/questions                    # List all questions (with filters)
GET    /api/questions/{id}               # Get question details
PUT    /api/questions/{id}               # Edit question
DELETE /api/questions/{id}               # Delete question
POST   /api/questions/{id}/approve       # Approve vetted question
POST   /api/questions/{id}/reject        # Reject question
```

### **Rubric Engine**
```
POST   /api/rubrics                      # Create rubric
GET    /api/rubrics                      # List rubrics
GET    /api/rubrics/{id}                 # Get rubric details
PUT    /api/rubrics/{id}                 # Update rubric
DELETE /api/rubrics/{id}                 # Delete rubric
```

### **Exam Generation**
```
POST   /api/exams/generate               # Generate exam paper
GET    /api/exams/{id}                   # Get exam details
GET    /api/exams/{id}/pdf               # Download exam as PDF
GET    /api/exams                        # List generated exams
```

### **Analytics**
```
GET    /api/analytics/stats              # Overall statistics
GET    /api/analytics/subject/{id}       # Subject-specific analytics
GET    /api/analytics/coverage           # Coverage analysis
GET    /api/analytics/bloom-taxonomy     # Bloom's taxonomy distribution
```

### **Notifications & Achievements**
```
GET    /api/notifications                # User notifications
POST   /api/notifications/{id}/read      # Mark as read
GET    /api/achievements                 # User achievements
GET    /api/streak                       # Streak data
```

---

## Automation Scripts Required

Create these batch/shell files in the project root:

### **1. `run_model.bat` (Windows) / `run_model.sh` (Linux/Mac)**
```batch
# Start the local language model server
# Auto-download model if not present
# Display loading status
# Open browser to model dashboard (optional)
```

### **2. `run_local.bat` / `run_local.sh`**
```batch
# Start FastAPI backend on localhost:8000
# Start React frontend on localhost:3000
# Auto-install dependencies if missing
# Display URLs and status
# Keep both servers running
```

### **3. `build_apk.bat` / `build_apk.sh`**
```batch
# Build Android APK
# Bundle Python backend with app
# Configure offline model
# Output APK to ./dist/ai_exam_oracle.apk
# Display build logs
```

### **4. `deploy_firebase.bat` / `deploy_firebase.sh`**
```batch
# Build React production bundle
# Configure Firebase hosting
# Deploy to Firebase
# Display deployed URL
# Update environment variables
```

### **5. `setup.bat` / `setup.sh`**
```batch
# One-click setup script
# Install Python dependencies
# Install Node dependencies
# Download and configure language model
# Initialize database
# Create config files
# Display setup summary
```

### **6. `test_all.bat` / `test_all.sh`**
```batch
# Run all backend tests
# Run frontend tests
# Test API endpoints
# Test model generation
# Generate test report
```

---

## Documentation Files to Generate

Create comprehensive Markdown documentation:

### **1. `BUILD_LOG.md`**
- Real-time build progress
- Dependencies installed
- Configuration steps
- Errors and warnings
- Success confirmation

### **2. `SETUP_GUIDE.md`**
- Prerequisites (Python, Node, etc.)
- Step-by-step installation
- Configuration instructions
- Troubleshooting common issues
- Platform-specific notes (Windows/Mac/Linux)

### **3. `API_DOCUMENTATION.md`**
- Complete API reference
- Request/response examples
- Authentication details
- Error codes
- Rate limiting info

### **4. `MODEL_CONFIGURATION.md`**
- Language model setup
- Model selection guide
- Performance tuning
- Memory requirements
- Offline configuration

### **5. `DEPLOYMENT_GUIDE.md`**
- Firebase deployment steps
- APK building process
- Environment variables
- Domain configuration
- SSL/HTTPS setup

### **6. `ARCHITECTURE.md`**
- System architecture diagram
- Data flow explanation
- RAG pipeline details
- Database schema
- Tech stack overview

### **7. `TESTING_GUIDE.md`**
- How to test each feature
- Sample data for testing
- API testing with Postman/curl
- Performance benchmarks
- Quality assurance checklist

### **8. `FEATURE_STATUS.md`**
- Real-time feature completion tracker
- What's working
- What's in progress
- Known issues
- Next steps

---

## Critical Implementation Notes

### **Performance Optimization**
1. **Fast Question Generation:**
   - Use quantized models (4-bit/8-bit) for speed
   - Implement caching for repeated queries
   - Batch processing for multiple questions
   - Async processing with job queue (Celery/RQ)

2. **Offline-First Architecture:**
   - SQLite for local data storage
   - Service workers for web app offline support
   - Embedded model in Android APK
   - Sync with Firebase when online

3. **Mobile Optimization:**
   - Lightweight model for Android
   - Progressive loading
   - Compressed assets
   - Efficient vector storage

### **RAG Implementation Details**
```python
# Document Processing Pipeline
1. Extract text from PDFs/DOCX
2. Clean and normalize text
3. Split into semantic chunks (512-1024 tokens)
4. Generate embeddings using sentence-transformers
5. Store in vector database with metadata (subject, topic, page)
6. Index for fast retrieval

# Question Generation Context
1. User selects topic + Bloom's level
2. Retrieve top-k relevant chunks (k=5-10)
3. Build prompt with context + instructions
4. Generate question using LLM
5. Validate output structure
6. Extract and store question components
```

### **Prompt Engineering Template**
```python
"""
You are an expert educational assessment creator.

CONTEXT:
{retrieved_context}

REQUIREMENTS:
- Subject: {subject_name}
- Topic: {topic_name}
- Bloom's Level: {blooms_level}
- Question Type: {question_type}
- Difficulty: {difficulty}

Generate a high-quality exam question following these rules:
1. Base the question on the provided context
2. Match the specified Bloom's taxonomy level
3. Include clear answer and marking rubric
4. Provide OBE course outcome mapping

OUTPUT FORMAT:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],  // if MCQ
  "correct_answer": "...",
  "explanation": "...",
  "marks": 5,
  "bloom_level": "...",
  "course_outcome": "..."
}
"""
```

### **Database Schema**
```sql
-- SQLite Schema
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    color TEXT,
    gradient TEXT,
    introduction TEXT,
    created_at TIMESTAMP
);

CREATE TABLE topics (
    id INTEGER PRIMARY KEY,
    subject_id INTEGER,
    name TEXT,
    has_syllabus BOOLEAN,
    created_at TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE questions (
    id INTEGER PRIMARY KEY,
    topic_id INTEGER,
    question_text TEXT,
    question_type TEXT,
    options JSON,
    correct_answer TEXT,
    explanation TEXT,
    marks INTEGER,
    bloom_level TEXT,
    course_outcome TEXT,
    status TEXT,  -- draft, approved, rejected
    created_at TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE documents (
    id INTEGER PRIMARY KEY,
    subject_id INTEGER,
    topic_id INTEGER,
    filename TEXT,
    content TEXT,
    embedding_id TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

---

## Expected Deliverables

### **Code Structure**
```
ai_exam_oracle/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── routes/                 # API endpoints
│   │   ├── services/               # Business logic
│   │   │   ├── rag_service.py      # RAG pipeline
│   │   │   ├── generation_service.py
│   │   │   └── training_service.py
│   │   ├── utils/                  # Helpers
│   │   └── config.py               # Configuration
│   ├── models/                     # Downloaded LLM models
│   ├── requirements.txt
│   └── tests/
├── frontend/                       # React app (already built)
├── mobile/                         # Android config
├── scripts/                        # Automation scripts
│   ├── run_model.bat
│   ├── run_local.bat
│   ├── build_apk.bat
│   ├── deploy_firebase.bat
│   └── setup.bat
├── docs/                           # Generated MD files
│   ├── BUILD_LOG.md
│   ├── SETUP_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   ├── MODEL_CONFIGURATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── TESTING_GUIDE.md
│   └── FEATURE_STATUS.md
├── .env.example                    # Environment template
├── firebase.json                   # Firebase config
└── README.md                       # Main readme
```

### **Working Features Checklist**
- [ ] FastAPI server running on localhost
- [ ] All API endpoints functional
- [ ] Language model loaded and generating questions
- [ ] RAG pipeline processing documents
- [ ] Subject CRUD operations
- [ ] Topic CRUD operations with inline editing
- [ ] Question generation with context
- [ ] Quality vetting workflow
- [ ] Exam paper PDF generation
- [ ] Analytics calculations
- [ ] Offline support
- [ ] Firebase deployment
- [ ] Android APK builds successfully
- [ ] All automation scripts working
- [ ] Documentation auto-generated
- [ ] Tests passing

---

## Testing Instructions

### **1. Quick Local Test**
```bash
# Run setup
./setup.bat

# Start model server
./run_model.bat

# Start application (separate terminal)
./run_local.bat

# Open browser to http://localhost:3000
# Test all features from UI
```

### **2. Feature Testing Sequence**
1. Create a new subject with custom color
2. Add 3 topics to the subject
3. Edit a topic name inline
4. Upload a PDF document for training
5. Wait for processing to complete
6. Generate 5 questions for a topic
7. Review questions in vetting center
8. Approve some, reject others
9. Create a rubric with custom settings
10. Generate an exam paper PDF
11. Check analytics dashboard
12. Test subject/topic deletion with modals
13. Verify all animations and UI elements

### **3. Firebase Deployment Test**
```bash
./deploy_firebase.bat
# Visit deployed URL
# Test online features
# Verify data sync
```

### **4. Android APK Test**
```bash
./build_apk.bat
# Install APK on Android device
# Test offline functionality
# Verify question generation works
```

---

## Performance Requirements

- **Question Generation:** < 5 seconds per question
- **Document Processing:** < 30 seconds per 100 pages
- **API Response Time:** < 500ms (excluding generation)
- **Mobile App Size:** < 200MB (with embedded model)
- **Offline Support:** 100% functional without internet
- **Concurrent Users:** Support 50+ simultaneous users

---

## Important Notes for Implementation

1. **Everything Must Actually Work** - This is not a prototype. Every button, every modal, every API endpoint must be fully functional.

2. **Real-Time Updates** - Use WebSockets or polling for real-time status updates during long operations (training, generation).

3. **Error Handling** - Comprehensive error messages and graceful degradation.

4. **Progress Tracking** - Show progress for all long-running operations with animations.

5. **Data Persistence** - Ensure all data is properly saved and retrievable.

6. **Cross-Platform** - Same codebase should work on web, desktop, and mobile.

7. **Automation First** - Make it incredibly easy to set up and test with batch files.

8. **Documentation During Build** - Generate MD files as you build, not after.

9. **Model Optimization** - Prioritize speed and efficiency for the LLM.

10. **UI/Backend Sync** - The frontend expects specific response formats - match them exactly.

---

## Final Deliverable

When complete, the user should be able to:
1. Run `setup.bat` - everything installs automatically
2. Run `run_local.bat` - full application launches
3. Test every single feature from the UI
4. Run `build_apk.bat` - Android app builds
5. Run `deploy_firebase.bat` - Web app deploys
6. Read generated MD files to understand the system

**Everything should work perfectly on the first try with zero manual configuration needed.**

---

## Questions for Implementation

Before starting, confirm:
1. Preferred language model (Gemini Flash 3 API vs local Mistral/Phi-3)?
2. Android approach (Kivy vs React Native WebView)?
3. Firebase project already created or need setup instructions?
4. Target minimum Android version?
5. Expected question generation speed (fast vs quality tradeoff)?

---

**END OF PROMPT**

Save this entire specification. Build a production-ready, fully-functional AI Exam Oracle backend that integrates seamlessly with the existing frontend. Generate all automation scripts and documentation as you build. Make it fast, make it work, make it easy to test.
