from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from admin_routes import router

app = FastAPI(title="Adaptive Firewall API")

# Allow frontend (React) access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # In production, change this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(router)
