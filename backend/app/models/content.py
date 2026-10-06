from pydantic import BaseModel


class GenerateRequest(BaseModel):
    topic: str
    platform: str
    audience: str
    content_type: str
    tone: str
    objective: str
    brand_context: str = ""


class GenerateResponse(BaseModel):
    content: str
    platform: str
    content_type: str