from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from pathlib import Path
from routes import router
from database import engine, Base, SessionLocal
from db_init import initialize_calendar
import uvicorn
# ساخت دیتابیس
Base.metadata.create_all(bind=engine)

# مقداردهی اولیه تقویم
db = SessionLocal()
initialize_calendar(db)
db.close()

app = FastAPI()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔹 Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # 🔹 Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # 🔹 Allows all headers
)
# app.mount("/", StaticFiles(directory="out", html=True), name="static")

app.include_router(router)
app.mount("/", StaticFiles(directory=settings.FRONTEND_DIR, html=True), name="static")

if __name__ == "__main__":
    print(settings.BASE_DIR)
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        workers=settings.WORKERS if not settings.RELOAD else 1
    )
