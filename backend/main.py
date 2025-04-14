from typing import Any, Dict, List, Optional
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import requests
import snowflake.connector
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment variables
DATABASE = os.getenv("DATABASE")
SCHEMA = os.getenv("SCHEMA")
STAGE = os.getenv("STAGE")
FILE = os.getenv("FILE")
WAREHOUSE = os.getenv("WAREHOUSE")
HOST = os.getenv("HOST")
ACCOUNT = os.getenv("ACCOUNT")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
ROLE = os.getenv("ROLE")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Snowflake connection
def get_snowflake_conn():
    conn = snowflake.connector.connect(
        user=USER,
        password=PASSWORD,
        account=ACCOUNT,
        host=HOST,
        port=443,
        warehouse=WAREHOUSE,
        role=ROLE,
    )
    try:
        yield conn
    finally:
        conn.close()

class Message(BaseModel):
    role: str
    content: List[Dict[str, Any]]

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat(request: ChatRequest, conn: snowflake.connector.SnowflakeConnection = Depends(get_snowflake_conn)):
    try:
        # Get the last user message
        last_message = request.messages[-1]

        prompt = last_message.content[0]["text"]
        
        # Prepare request to Snowflake Cortex API
        request_body = {
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
            "semantic_model_file": f"@{DATABASE}.{SCHEMA}.{STAGE}/{FILE}",
        }
        
        # Make request to Snowflake Cortex API
        resp = requests.post(
            url=f"https://{HOST}/api/v2/cortex/analyst/message",
            json=request_body,
            headers={
                "Authorization": f'Snowflake Token="{conn.rest.token}"',
                "Content-Type": "application/json",
            },
        )
        
        request_id = resp.headers.get("X-Snowflake-Request-Id")
        
        if resp.status_code >= 400:
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"Failed request (id: {request_id}): {resp.text}"
            )
            
        response_data = resp.json()

        # Process SQL queries if present in the response
        content = response_data["message"]["content"]
        for item in content:
            if item["type"] == "sql":
                try:
                    print("sql statement", item["statement"])
                    df = pd.read_sql(item["statement"], conn)
                    item["results"] = df.to_dict(orient="records")
                    print("results", item["results"])
                except Exception as e:
                    item["error"] = str(e)
        
        return {
            "content": content,
            "request_id": request_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 