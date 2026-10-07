import time

from fastapi import APIRouter, HTTPException
from groq import APIStatusError
from langchain_core.exceptions import OutputParserException

from app.models.content import (
    GeneratedContent,
    GenerationMetadata,
    GenerateRequest,
    GenerateResponse,
)
from app.prompts.platform_rules import platform_warnings
from app.prompts.prompt_engine import PROMPT_VERSION, build_prompt
from app.providers.groq_provider import GroqProvider


router = APIRouter()


def collect_warnings(request: GenerateRequest, content: GeneratedContent) -> list[str]:
    warnings = []
    if not request.brand_context.strip():
        warnings.append(
            "Sin contexto de marca: el contenido puede resultar más genérico."
        )
    if not request.topic.strip():
        warnings.append(
            "Sin tema indicado: el contenido usa solo el contexto disponible."
        )
    if not request.audience.strip():
        warnings.append(
            "Sin audiencia indicada: la adaptación de vocabulario se limitó "
            "al tono y al objetivo."
        )
    warnings.extend(
        platform_warnings(request.platform, request.content_type, content)
    )
    return warnings


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

    started = time.perf_counter()
    try:
        content = provider.generate_structured(messages, GeneratedContent)
    except OutputParserException as exc:
        raise HTTPException(
            status_code=502,
            detail="El modelo devolvió una estructura no válida.",
        ) from exc
    except APIStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "La API de Groq devolvió un error "
                "({} {}): {}".format(
                    exc.status_code,
                    type(exc).__name__,
                    exc.message,
                )
            ),
        ) from exc
    latency_ms = int((time.perf_counter() - started) * 1000)

    return GenerateResponse(
        platform=request.platform,
        content_type=request.content_type,
        content=content,
        metadata=GenerationMetadata(
            model=provider.model,
            prompt_version=PROMPT_VERSION,
            latency_ms=latency_ms,
        ),
        warnings=collect_warnings(request, content),
    )
