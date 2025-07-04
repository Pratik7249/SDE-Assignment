from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, feedback
from app import database
from app import models


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    database.Base.metadata.create_all(bind=database.engine)

app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(feedback.router)
