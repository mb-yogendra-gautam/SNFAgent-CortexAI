# Cortex Analyst Application

This is a full-stack application that provides a chat interface for interacting with Snowflake Cortex AI. The application is split into a FastAPI backend and a React frontend.

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── main.py       # Main FastAPI application
│   └── requirements.txt
└── frontend/         # React frontend
    ├── src/
    │   ├── App.tsx
    │   ├── index.tsx
    │   └── types.ts
    └── package.json
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Snowflake account with Cortex AI access

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DATABASE=your_database
SCHEMA=your_schema
STAGE=your_stage
FILE=your_file
WAREHOUSE=your_warehouse
HOST=your_host
ACCOUNT=your_account
USER=your_user
PASSWORD=your_password
ROLE=your_role
```

## Setup and Running

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at http://localhost:8000

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at http://localhost:3000

## Features

- Chat interface for interacting with Snowflake Cortex AI
- Support for text responses, SQL queries, and suggestions
- Interactive data visualization for SQL query results
- Request ID tracking for debugging
- Modern Material-UI based interface

## API Endpoints

### POST /api/chat

Send a chat message to the Cortex AI and receive a response.

Request body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Your question here"
        }
      ]
    }
  ]
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Response text"
    },
    {
      "type": "sql",
      "statement": "SQL query",
      "results": [...]
    },
    {
      "type": "suggestions",
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    }
  ],
  "request_id": "request-id-here"
}
```
