from fastapi import APIRouter, Request

from app.data.examples import EXAMPLES
from app.models.info import (
    Example,
    ExamplesResponse,
    MetaResponse,
    PlatformInfo,
    PlatformsResponse,
    PromptPreviewMessage,
    PromptPreviewResponse,
    StructuredOutputInfo,
)
from app.prompts.platform_rules import PLATFORM_EXPECTATIONS, PLATFORM_NAMES
from app.prompts.prompt_engine import PROMPT_VERSION, build_prompt
from app.providers.groq_provider import MODEL


router = APIRouter()

PROVIDER_NAME = "groq"


@router.get("/platforms", response_model=PlatformsResponse)
def list_platforms():
    return PlatformsResponse(
        platforms=[
            PlatformInfo(
                id=platform_id,
                name=PLATFORM_NAMES[platform_id],
                content_types=list(expectations["content_types"]),
                max_sections=expectations["max_sections"],
                title_expected=expectations["title_expected"],
            )
            for platform_id, expectations in PLATFORM_EXPECTATIONS.items()
        ]
    )


@router.get("/examples", response_model=ExamplesResponse)
def list_examples():
    return ExamplesResponse(
        examples=[Example.model_validate(example) for example in EXAMPLES]
    )


@router.get("/meta", response_model=MetaResponse)
def get_meta(request: Request):
    return MetaResponse(
        name=request.app.title,
        version=request.app.version,
        provider=PROVIDER_NAME,
        model=MODEL,
        prompt_version=PROMPT_VERSION,
        structured_output=StructuredOutputInfo(
            method="json_schema",
            strict=True,
        ),
        platforms=sorted(PLATFORM_EXPECTATIONS),
        documentation=request.app.docs_url or "/docs",
    )


@router.get("/prompt-preview", response_model=PromptPreviewResponse)
def prompt_preview(
    platform: str = "",
    topic: str = "",
    audience: str = "",
    content_type: str = "",
    tone: str = "",
    objective: str = "",
    brand_context: str = "",
):
    messages = build_prompt(platform).format_messages(
        brand_context=brand_context,
        topic=topic,
        platform=platform,
        audience=audience,
        content_type=content_type,
        tone=tone,
        objective=objective,
    )
    return PromptPreviewResponse(
        platform=platform,
        prompt_version=PROMPT_VERSION,
        model=MODEL,
        messages=[
            PromptPreviewMessage(role=message.type, content=message.content)
            for message in messages
        ],
    )
