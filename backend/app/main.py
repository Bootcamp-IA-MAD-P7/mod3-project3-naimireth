from fastapi import FastAPI

from app.api.routes.generate import router as generate_router


app = FastAPI(
    title="TRAZO API",
    description="API for TRAZO Creative Content Studio",
    version="0.1.0",
)


app.include_router(
    generate_router,
    prefix="/api",
)


@app.get("/health")
def health():
    return {"status": "ok"}