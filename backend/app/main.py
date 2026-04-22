from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import routers
from app.routes import fraud, url, loan, panic, media

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(fraud.router, tags=["Fraud Text & UPI"])
app.include_router(url.router, tags=["Phishing Check"])
app.include_router(loan.router, tags=["Loan App Risk"])
app.include_router(panic.router, tags=["Panic Mode"])
app.include_router(media.router, tags=["Deepfake Intelligence"])

@app.get("/")
async def root():
    return {"message": "ScamSense API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
