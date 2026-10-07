from fastapi import APIRouter

from app.models.content import GenerateRequest, GenerateResponse
from app.prompts.prompt_engine import build_prompt
from app.providers.groq_provider import GroqProvider


router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
def generate_content(request: GenerateRequest):
    prompt = build_prompt(request.platform)

    messages = prompt.format_messages(
        brand_context=request.brand_context,
        topic=request.topic,
        platform=request.platform,
        audience=request.audience,
        content_type=request.content_type,
        tone=request.tone,
        objective=request.objective,
    )

    provider = GroqProvider()

    content = provider.generate(messages)

    return GenerateResponse(
        content=content,
        platform=request.platform,
        content_type=request.content_type,
    )