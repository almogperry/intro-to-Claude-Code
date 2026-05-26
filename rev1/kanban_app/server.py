from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
from config import PORT
from db.init import init_db
from api import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  init_db()
  yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(api_router)

static_dir = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="127.0.0.1", port=PORT)
