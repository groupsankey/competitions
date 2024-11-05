# 🎓 EduPro - AI-Powered International Education Platform

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-brightgreen)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue)](https://deepmind.google/technologies/gemini/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-blue)](https://tailwindcss.com/)

EduPro is a comprehensive digital education platform that transforms the learning experience with AI-powered features, interactive whiteboards, and personalized study paths for international exam preparation.

</div>

## 📚 Contents

- [Key Features](#-key-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Technologies](#-technologies)
- [Development](#-development)
- [License](#-license)

## ⭐ Key Features

### 🤖 AI-Powered Learning
- **Personalized Study Plans**
  - Google Gemini API powered learning path generation
  - Custom curriculum development
  - Progress tracking and adjustments

- **Interactive Practice**
  - AI-generated practice questions
  - Real-time feedback
  - Performance analytics

### 📊 Interactive Tools
- **Digital Whiteboard**
  - Real-time collaboration
  - PDF annotation support
  - Multi-user drawing capabilities
  - Shape and text tools

- **Graphing Calculator**
  - 2D/3D function plotting
  - Multiple equation support
  - Interactive visualization
  - Mathematical analysis tools

### 🌟 Educational Features
- **Curriculum Management**
  - International exam preparation
  - Structured learning paths
  - Resource organization

- **Progress Tracking**
  - Performance analytics
  - Study time monitoring
  - Achievement tracking

## 🚀 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/edu-pro.git
cd edu-pro
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env file with your credentials
VITE_GEMINI_API_KEY=your_api_key_here
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## 💻 Usage

1. **Getting Started**
   - Create an account
   - Complete your profile
   - Set learning goals

2. **Study Planning**
   - Generate personalized study plans
   - Track your progress
   - Access interactive materials

3. **Interactive Learning**
   - Use the digital whiteboard
   - Collaborate with peers
   - Solve practice problems

4. **Performance Analysis**
   - View progress reports
   - Analyze learning patterns
   - Track achievements

## 🛠 Technologies

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.5.3
- **Build Tool:** Vite 5.4.2
- **Styling:** TailwindCSS 3.4.1
- **Icons:** Lucide React
- **Charts:** Plotly.js
- **3D Graphics:** Three.js

### Backend
- **Runtime:** Node.js
- **WebSocket:** Socket.io
- **Server:** Express.js

### AI/ML
- **AI Engine:** Google Gemini Pro API
- **Math Processing:** Math.js

### Development Tools
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Version Control:** Git

## 👨‍💻 Development

### Project Structure
\`\`\`
edu-pro/
├── src/
│   ├── components/
│   │   ├── graphing/       # Graphing calculator components
│   │   ├── whiteboard/     # Interactive whiteboard
│   │   └── GetStarted/     # Onboarding components
│   ├── lib/
│   │   └── gemini.ts       # AI integration
│   └── App.tsx            # Main application
├── public/
└── package.json
\`\`\`

### Key Components

1. **Whiteboard**
   - Real-time drawing
   - PDF annotation
   - Collaboration features

2. **Graphing Calculator**
   - 2D/3D plotting
   - Mathematical functions
   - Interactive controls

3. **Study Plan Generator**
   - AI-powered planning
   - Custom curriculum
   - Progress tracking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 Want to help improve EduPro?

[![GitHub issues](https://img.shields.io/github/issues/yourusername/edu-pro)](https://github.com/yourusername/edu-pro/issues)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/edu-pro)](https://github.com/yourusername/edu-pro/stargazers)

**Don't forget to give us a ⭐ if you like this project!**

</div>