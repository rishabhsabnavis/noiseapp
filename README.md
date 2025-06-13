# Urban Noise Pollution Classifier

A full-stack web application that uses AI to classify noise pollution levels in urban environments through audio analysis. Upload an MP3 file and get real-time classification results showing whether the noise level is low, moderate, high, or very high.

## 🎯 Features

- **Audio Upload**: Drag-and-drop or click-to-browse MP3 file upload
- **Real-time Classification**: AI-powered noise pollution level detection
- **Visual Results**: Color-coded badges and progress bars for different noise levels
- **Location Tracking**: Associate audio samples with specific locations
- **Upload History**: View previously uploaded files with their classification results
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓ HTTP Request
Backend (Node.js + Express)
    ↓ API Call
Hugging Face Inference Endpoint
    ↓ Classification Results
MongoDB (Data Storage)
```

## 🛠️ Tech Stack

### Frontend
- **React** with **Vite** - Fast development and build tool
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components

### Backend
- **Node.js** with **Express** - Server and API endpoints
- **Multer** - File upload handling
- **MongoDB** with **Mongoose** - Database and ODM

### AI/ML
- **Hugging Face Transformers** - Model training and inference
- **Wav2Vec2** - Base model for audio classification
- **UrbanSound8K Dataset** - Training data for noise classification

### Deployment
- **Hugging Face Inference Endpoints** - Model hosting and inference
- **MongoDB Atlas** - Cloud database hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Hugging Face account and API token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/urban-noise-classifier
cd urban-noise-classifier
```

2. **Install frontend dependencies**
```bash
cd client
npm install
```

3. **Install backend dependencies**
```bash
cd ../server
npm install
```

4. **Environment Setup**

Create `.env` files:

**Frontend (.env)**
```bash
VITE_HF_API_TOKEN=your_hugging_face_token
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**
```bash
HF_API_TOKEN=your_hugging_face_token
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

5. **Start the development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

## 🤖 Model Training

The AI model was trained using the UrbanSound8K dataset with custom noise pollution level mappings:

### Noise Level Categories
- **Low**: Air conditioner sounds (≤45 dB)
- **Moderate**: Dog bark, children playing, street music (46-55 dB)
- **High**: Car horn, siren, jackhammer, drilling (56-70 dB)
- **Very High**: Gun shot (>70 dB)

### Training Process
1. **Dataset Preparation**: Map UrbanSound8K classes to noise pollution levels
2. **Model Fine-tuning**: Fine-tune Wav2Vec2-base on the labeled dataset
3. **Evaluation**: Achieve accuracy and F1-score metrics during training
4. **Deployment**: Upload trained model to Hugging Face Hub

## 📁 Project Structure

```
urban-noise-classifier/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── public/
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Route controllers
│   └── package.json
├── model/                # AI model training
│   ├── train.py         # Training script
│   ├── data_prep.py     # Data preprocessing
│   └── requirements.txt
└── README.md
```

## 🔧 API Endpoints

### Audio Classification
```http
POST /api/audio/classify
Content-Type: multipart/form-data

Body: audio file + location
Response: Classification results with confidence scores
```

### Upload History
```http
GET /api/audio/history
Response: List of previously uploaded files with results
```

## 🎨 UI Components

The application uses custom React components built with shadcn/ui:

- **FileUpload**: Main upload interface with drag-and-drop
- **ClassificationCard**: Display results with color-coded badges
- **ProgressBar**: Visual representation of confidence scores
- **UploadHistory**: List of previous uploads and results

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend Deployment (Railway/Render)
```bash
# Set environment variables on your platform
# Deploy from GitHub repository
```

### Model Deployment (Hugging Face)
The trained model is deployed on Hugging Face Inference Endpoints for scalable, production-ready inference.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UrbanSound8K Dataset** - For providing urban sound classification data
- **Hugging Face** - For the Transformers library and model hosting
- **shadcn/ui** - For beautiful and accessible UI components
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for urban noise pollution awareness and environmental monitoring.**
