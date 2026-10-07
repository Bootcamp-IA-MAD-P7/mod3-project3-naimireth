from pydantic import BaseModel, ConfigDict, Field, field_validator


class GenerateRequest(BaseModel):
    topic: str
    platform: str
    audience: str
    content_type: str
    tone: str
    objective: str
    brand_context: str = ""


class ContentSection(BaseModel):
    heading: str | None = Field(
        default=None,
        description="Subtítulo o gancho de la sección. None cuando el formato no lo admite.",
    )
    text: str = Field(description="Texto listo para publicar de esta sección.")

    @field_validator("text")
    @classmethod
    def text_no_vacio(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text no puede estar vacío")
        return value


class GeneratedContent(BaseModel):
    model_config = ConfigDict(revalidate_instances="always")

    title: str | None = Field(
        default=None,
        description="Título o gancho principal cuando el formato lo admite.",
    )
    sections: list[ContentSection] = Field(
        min_length=1,
        description=(
            "Secciones ordenadas del contenido: slides de un carrusel, "
            "mensajes de un hilo o párrafos de un artículo."
        ),
    )
    hashtags: list[str] | None = Field(
        default_factory=list,
        description="Hashtags solo si el formato y el usuario los piden.",
    )

    @field_validator("hashtags", mode="before")
    @classmethod
    def hashtags_nulas_a_lista(cls, value: list[str] | None) -> list[str]:
        return [] if value is None else value
    cta: str | None = Field(
        default=None,
        description="Llamada a la acción final, solo si el objetivo la admite.",
    )


class GenerationMetadata(BaseModel):
    model: str
    prompt_version: str
    latency_ms: int = Field(ge=0)


class GenerateResponse(BaseModel):
    model_config = ConfigDict(revalidate_instances="always")

    platform: str
    content_type: str
    content: GeneratedContent
    metadata: GenerationMetadata
    warnings: list[str] = Field(default_factory=list)
