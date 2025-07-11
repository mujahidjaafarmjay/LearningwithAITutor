# Comprehensive AI-Powered LMS Development Prompt

## Project Overview
Build a complete AI-Powered Conversational Learning Management System exactly as specified in the PDF requirements. This system must use Django backend with Hugging Face AI integration, React frontend, and PostgreSQL database.

## Critical Architecture Requirements

### 1. Backend Framework: Django ONLY
- **IMPORTANT**: Use Django as the primary and only backend framework
- **AVOID**: Express.js, Node.js backend, or any other backend frameworks
- **REASON**: Prevents port conflicts and session table errors

### 2. Database Configuration
- Use PostgreSQL as the primary database
- Ensure proper Django migrations are created and applied
- Create custom User model in Django (not default User model)
- Include proper foreign key relationships between models

### 3. AI Integration: Hugging Face API
- **REQUIRED**: Use Hugging Face Inference API (not OpenAI)
- Implement fallback responses for when API is unavailable
- Use educational-focused models like microsoft/DialoGPT-medium
- Handle API rate limiting and errors gracefully

## Step-by-Step Implementation Guide

### Phase 1: Project Structure Setup
```
ai-lms/
├── backend/
│   ├── manage.py
│   ├── lms_core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── ai/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services.py
│   └── quiz/
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       └── serializers.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── requirements.txt
```

### Phase 2: Django Backend Setup

#### Django Settings Configuration
```python
# backend/lms_core/settings.py
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ['*']  # For development

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'users',
    'ai',
    'quiz',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'lms_core.urls'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('PGDATABASE', default='ai_lms'),
        'USER': config('PGUSER', default='postgres'),
        'PASSWORD': config('PGPASSWORD', default='password'),
        'HOST': config('PGHOST', default='localhost'),
        'PORT': config('PGPORT', default='5432'),
    }
}

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

#### Custom User Model
```python
# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    learning_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Hugging Face AI Service
```python
# backend/ai/services.py
import requests
from django.conf import settings
from typing import Dict, Any, List

class HuggingFaceAIService:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        self.headers = {
            "Authorization": f"Bearer {settings.HUGGING_FACE_API_TOKEN}",
            "Content-Type": "application/json"
        }
    
    def generate_tutor_response(self, user_input: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        try:
            # Prepare educational context
            context = self._prepare_educational_context(user_input, conversation_history)
            
            # Call Hugging Face API
            response = self._call_hugging_face_api(context)
            
            if response and 'generated_text' in response:
                ai_response = response['generated_text']
                formatted_response = self._format_educational_response(ai_response, user_input)
                
                return {
                    'response': formatted_response,
                    'topic': self._categorize_topic(user_input),
                    'suggested_topics': self._generate_suggested_topics(user_input),
                    'status': 'success'
                }
            else:
                return self._get_fallback_response(user_input)
                
        except Exception as e:
            print(f"AI Service Error: {e}")
            return self._get_fallback_response(user_input)
    
    def _prepare_educational_context(self, user_input: str, conversation_history: List[Dict] = None) -> str:
        context = f"As an educational AI tutor, help the student learn: {user_input}"
        
        if conversation_history:
            context += "\n\nConversation history:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages
                context += f"{msg['role']}: {msg['content']}\n"
        
        return context
    
    def _call_hugging_face_api(self, input_text: str) -> Dict[str, Any]:
        try:
            payload = {
                "inputs": input_text,
                "parameters": {
                    "max_length": 200,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
            
            response = requests.post(self.api_url, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"API Call Error: {e}")
            return None
    
    def _format_educational_response(self, ai_response: str, user_input: str) -> str:
        # Clean and format the AI response for educational use
        formatted = ai_response.strip()
        
        # Add educational context if missing
        if not any(word in formatted.lower() for word in ['learn', 'understand', 'concept', 'example']):
            formatted = f"Let me help you understand this concept. {formatted}"
        
        return formatted
    
    def _get_fallback_response(self, user_input: str) -> Dict[str, Any]:
        # Educational fallback responses when AI is unavailable
        fallback_responses = {
            'python': "Python is a versatile programming language. Let's start with variables and basic syntax. Would you like to learn about data types first?",
            'programming': "Programming is about solving problems with code. What specific programming concept would you like to explore?",
            'math': "Mathematics is fundamental to many fields. What area of math interests you most?",
            'science': "Science helps us understand the world around us. Which scientific topic would you like to learn about?",
        }
        
        topic = self._categorize_topic(user_input)
        response = fallback_responses.get(topic, 
            f"I'd be happy to help you learn about {user_input}. Could you tell me more about what specific aspect you'd like to understand?")
        
        return {
            'response': response,
            'topic': topic,
            'suggested_topics': self._generate_suggested_topics(user_input),
            'status': 'fallback'
        }
    
    def _categorize_topic(self, user_input: str) -> str:
        user_input_lower = user_input.lower()
        
        if any(word in user_input_lower for word in ['python', 'programming', 'code', 'function']):
            return 'programming'
        elif any(word in user_input_lower for word in ['math', 'mathematics', 'algebra', 'calculus']):
            return 'math'
        elif any(word in user_input_lower for word in ['science', 'physics', 'chemistry', 'biology']):
            return 'science'
        else:
            return 'general'
    
    def _generate_suggested_topics(self, user_input: str) -> List[str]:
        topic = self._categorize_topic(user_input)
        
        suggestions = {
            'programming': ['Variables and Data Types', 'Functions and Methods', 'Loops and Conditionals', 'Object-Oriented Programming'],
            'math': ['Algebra Basics', 'Geometry Fundamentals', 'Statistics', 'Calculus Introduction'],
            'science': ['Scientific Method', 'Physics Laws', 'Chemistry Basics', 'Biology Concepts'],
            'general': ['Study Techniques', 'Problem Solving', 'Critical Thinking', 'Research Methods']
        }
        
        return suggestions.get(topic, suggestions['general'])
```

### Phase 3: React Frontend Setup

#### Package.json for Frontend
```json
{
  "name": "ai-lms-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

#### API Integration Hook
```javascript
// frontend/src/hooks/useApi.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login/', credentials);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout/');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register/', userData);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get('/auth/user/');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { user, loading, login, logout, register };
};

export const useAIChat = () => {
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message, conversationId = null) => {
    setLoading(true);
    try {
      const response = await axios.post('/ai/chat/', {
        message,
        conversation_id: conversationId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    } finally {
      setLoading(false);
    }
  };

  const getConversations = async () => {
    try {
      const response = await axios.get('/ai/conversations/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  return { sendMessage, getConversations, loading };
};
```

### Phase 4: Critical Error Prevention

#### Common Issues and Solutions

1. **Port Conflicts**
   - Run Django on port 8000 (not 5000)
   - Run React on port 3000
   - Never run Express.js alongside Django

2. **Database Session Errors**
   - Use Django's built-in session management
   - Don't mix Node.js session stores with Django

3. **CORS Issues**
   - Configure CORS properly in Django settings
   - Use django-cors-headers package
   - Set CORS_ALLOW_CREDENTIALS = True

4. **API Authentication**
   - Use Django REST Framework authentication
   - Configure CSRF tokens properly
   - Handle authentication in React hooks

5. **AI Service Reliability**
   - Always implement fallback responses
   - Handle API rate limiting
   - Use try-catch blocks for all API calls

### Phase 5: Deployment Checklist

1. **Environment Variables**
   - DATABASE_URL
   - SECRET_KEY
   - HUGGING_FACE_API_TOKEN
   - DEBUG=False for production

2. **Static Files**
   - Configure STATIC_ROOT
   - Run collectstatic command
   - Serve static files properly

3. **Database Setup**
   - Run migrations
   - Create superuser
   - Set up sample data

### Phase 6: Testing Commands

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# Frontend setup
cd frontend
npm install
npm run dev

# Test endpoints
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"testpass"}'
```

### Phase 7: Requirements.txt
```
Django==5.0.0
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-decouple==3.8
requests==2.31.0
whitenoise==6.6.0
gunicorn==21.2.0
```

## Key Success Factors

1. **Architecture First**: Always start with Django-only backend
2. **Database Design**: Create proper models with relationships
3. **API Design**: Use Django REST Framework patterns
4. **Error Handling**: Implement comprehensive error handling
5. **Testing**: Test each component thoroughly
6. **Documentation**: Document all API endpoints
7. **Security**: Implement proper authentication and CSRF protection

## Final Verification Steps

1. ✅ Django server starts without errors
2. ✅ Database migrations apply successfully
3. ✅ User registration and login work
4. ✅ AI chat responses are generated
5. ✅ Quiz system functions properly
6. ✅ Frontend connects to backend APIs
7. ✅ No port conflicts or session errors
8. ✅ All PDF requirements are met

This comprehensive guide ensures a smooth development process and prevents the common errors experienced in the current implementation.