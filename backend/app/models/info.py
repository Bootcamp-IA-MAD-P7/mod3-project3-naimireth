from pydantic import BaseModel, Field

from app.models.content import GenerateRequest


class PlatformInfo(BaseModel):
    id: str = Field(description="Identificador de la plataforma, en minúsculas.")
    name: str = Field(description="Nombre visible de la plataforma.")
    content_types: list[str] = Field(
        description="Tipos de contenido admitidos en esta plataforma."
    )
    max_sections: int | None = Field(
        description="Número de secciones habitual en esta plataforma, si procede."
    )
    title_expected: bool = Field(
        description="Si el formato de esta plataforma espera título."
    )


class PlatformsResponse(BaseModel):
    platforms: list[PlatformInfo]


class Example(BaseModel):
    id: str
    label: str
    brief: GenerateRequest


class ExamplesResponse(BaseModel):
    examples: list[Example]


class StructuredOutputInfo(BaseModel):
    method: str
    strict: bool


class MetaResponse(BaseModel):
    name: str
    version: str
    provider: str
    model: str
    prompt_version: str
    structured_output: StructuredOutputInfo
    platforms: list[str]
    documentation: str


class PromptPreviewMessage(BaseModel):
    role: str
    content: str


class PromptPreviewResponse(BaseModel):
    platform: str
    prompt_version: str
    model: str
    messages: list[PromptPreviewMessage]
