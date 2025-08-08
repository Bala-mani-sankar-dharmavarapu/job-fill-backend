# Job Fill Backend

AI-powered backend service for the Job Fill browser extension, providing intelligent form autofill and custom resume generation.

## Features

- 🤖 **AI-Powered Form Autofill**: Intelligently maps user data to form fields using LLM
- 📄 **Custom Resume Generation**: Creates tailored resumes based on job descriptions
- 🔧 **Smart Field Matching**: Uses context and field types for accurate mapping
- 🚀 **Fast & Reliable**: Built with Express.js and optimized for performance

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key (for AI features)

### Installation

1. **Clone and navigate to the backend directory:**

   ```bash
   cd job-fill-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your Groq API key:

   ```env
   GROQ_API_KEY=your_actual_groq_api_key_here
   PORT=5001
   ```

4. **Start the server:**

   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start at `http://localhost:5001`

## API Endpoints

### 1. Form Autofill Mapping

**POST** `/autofill-map`

Intelligently maps user data to form fields using AI.

**Request Body:**

```json
{
  "fields": [
    {
      "id": "firstName",
      "labelText": "First Name",
      "placeholder": "Enter your first name",
      "surroundingText": "Personal Information"
    }
  ],
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response:**

```json
{
  "mappings": [
    {
      "fieldId": "firstName",
      "value": "John"
    }
  ]
}
```

### 2. Resume Generation

**POST** `/generate-resume`

Creates a custom resume tailored to a specific job description.

**Request Body:**

```json
{
  "jobDescription": "We are looking for a skilled JavaScript developer...",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "5 years of web development"
  }
}
```

**Response:**

```json
{
  "resume": "<h1>John Doe</h1><p>Professional summary...</p>",
  "jobDescription": "We are looking for a skilled JavaScript developer...",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Resume Update

**POST** `/update-resume`

Updates an existing resume to better match a job description using AI.

**Request Body:**

```json
{
  "originalResume": "JOHN DOE\nSoftware Developer...",
  "jobDescription": "We are looking for a senior JavaScript developer...",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

**Response:**

```json
{
  "resume": "<h1>John Doe</h1><p>Updated professional summary...</p>",
  "originalLength": 500,
  "updatedLength": 650,
  "jobDescription": "We are looking for a senior JavaScript developer...",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Health Check

**GET** `/health`

Returns server status and available endpoints.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": [
    "/autofill-map",
    "/generate-resume",
    "/update-resume",
    "/health"
  ]
}
```

## Configuration

### Environment Variables

| Variable         | Description                  | Default | Required |
| ---------------- | ---------------------------- | ------- | -------- |
| `GROQ_API_KEY`   | Groq API key for AI features | -       | Yes      |
| `PORT`           | Server port                  | 5001    | No       |
| `OPENAI_API_KEY` | OpenAI API key (alternative) | -       | No       |

### AI Models

The backend uses Groq's Llama 3.1 8B model for:

- Form field mapping (temperature: 0.1)
- Resume generation (temperature: 0.3)

## Development

### Project Structure

```
job-fill-backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
├── env.example       # Environment template
└── README.md         # This file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Adding New Features

1. **New Endpoint**: Add route handlers in `server.js`
2. **AI Integration**: Use the existing Groq API integration pattern
3. **Error Handling**: Use the existing error middleware

## Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (Future Enhancement)

```bash
docker build -t job-fill-backend .
docker run -p 5001:5001 job-fill-backend
```

## Troubleshooting

### Common Issues

1. **"LLM API error"**: Check your Groq API key in `.env`
2. **"Port already in use"**: Change PORT in `.env` or kill existing process
3. **"Missing required data"**: Ensure request body includes all required fields

### Logs

The server logs all requests and errors to console. Check the terminal output for debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
