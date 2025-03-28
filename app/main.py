from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import router
from database import engine, Base, SessionLocal
from db_init import initialize_calendar

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
app.mount("/", StaticFiles(directory="out", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
