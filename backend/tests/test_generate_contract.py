from fastapi.testclient import TestClient
from langchain_core.exceptions import OutputParserException
from pydantic import ValidationError

from app.main import app
from app.models.content import (
    ContentSection,
    GeneratedContent,
    GenerationMetadata,
    GenerateRequest,
    GenerateResponse,
)
from app.prompts.prompt_engine import PROMPT_VERSION


client = TestClient(app)


def payload(**overrides):
    base = {
        "topic": "cómo elegir la tela para un primer proyecto",
        "platform": "Instagram",
        "audience": "personas que están empezando a coser",
        "content_type": "carrusel",
        "tone": "cercano y claro",
        "objective": "explicar",
        "brand_context": "Aula Norte, escuela online de costura",
    }
    base.update(overrides)
    return base


def sample_content() -> GeneratedContent:
    return GeneratedContent(
        title="Elige tu primera tela",
        sections=[
            ContentSection(heading="Tócala", text="Arrastra la tela entre los dedos."),
            ContentSection(heading="Mira la caída", text="Sujétala en alto y observa cómo cae."),
        ],
        hashtags=["costuraprincipiantes"],
        cta="Guarda este carrusel para tu primer proyecto",
    )


def mock_provider():
    from contextlib import contextmanager
    from unittest.mock import patch

    @contextmanager
    def opened():
        with patch("app.api.routes.generate.GroqProvider") as provider_cls:
            provider_cls.return_value.model = "openai/gpt-oss-20b"
            provider_cls.return_value.generate_structured.return_value = (
                sample_content()
            )
            yield provider_cls

    return opened()


def test_request_con_siete_campos():
    fields = set(GenerateRequest.model_fields)
    assert fields == {
        "brand_context",
        "topic",
        "platform",
        "audience",
        "content_type",
        "tone",
        "objective",
    }
    assert GenerateRequest.model_fields["brand_context"].default == ""
    for name in fields - {"brand_context"}:
        assert GenerateRequest.model_fields[name].is_required()


def test_response_obligatorios():
    valid = GenerateResponse.model_validate(
        {
            "platform": "Instagram",
            "content_type": "carrusel",
            "content": {"sections": [{"text": "hola"}]},
            "metadata": {"model": "m", "prompt_version": "1.0", "latency_ms": 1},
        }
    )
    assert valid.warnings == []
    assert valid.content.title is None
    assert valid.content.hashtags == []
    assert valid.content.cta is None

    for missing in ("content", "metadata", "platform", "content_type"):
        broken = {
            "platform": "Instagram",
            "content_type": "carrusel",
            "content": {"sections": [{"text": "hola"}]},
            "metadata": {"model": "m", "prompt_version": "1.0", "latency_ms": 1},
        }
        broken.pop(missing)
        try:
            GenerateResponse.model_validate(broken)
        except ValidationError:
            pass
        else:
            raise AssertionError("faltaba el campo obligatorio: " + missing)


def test_sections_minimo_una():
    try:
        GeneratedContent(sections=[])
    except ValidationError:
        pass
    else:
        raise AssertionError("sections vacías deberían fallar")


def test_section_text_obligatorio():
    try:
        ContentSection(heading="x")
    except ValidationError:
        pass
    else:
        raise AssertionError("sin text debería fallar")

    try:
        ContentSection(text="   ")
    except ValidationError:
        pass
    else:
        raise AssertionError("text en blanco debería fallar")

    section = ContentSection(text="contenido")
    assert section.heading is None


def test_metadata_valida():
    meta = GenerationMetadata(model="m", prompt_version="1.0", latency_ms=0)
    assert meta.latency_ms == 0
    try:
        GenerationMetadata(model="m", prompt_version="1.0", latency_ms=-1)
    except ValidationError:
        pass
    else:
        raise AssertionError("latency_ms negativo debería fallar")


def test_tipos_de_contenido():
    content = sample_content()
    assert isinstance(content.sections, list)
    assert all(isinstance(s, ContentSection) for s in content.sections)
    assert isinstance(content.hashtags, list)
    assert isinstance(content.title, str)
    assert isinstance(content.cta, str)


def test_endpoint_groq_mockeado():
    with mock_provider() as provider_cls:
        provider_cls.return_value.model = "openai/gpt-oss-20b"
        provider_cls.return_value.generate_structured.return_value = sample_content()
        response = client.post("/api/generate", json=payload())

    assert response.status_code == 200
    data = response.json()
    GenerateResponse.model_validate(data)

    assert data["platform"] == "Instagram"
    assert data["content_type"] == "carrusel"
    assert data["content"]["title"] == "Elige tu primera tela"
    assert len(data["content"]["sections"]) == 2
    assert data["content"]["sections"][0]["heading"] == "Tócala"
    assert data["content"]["hashtags"] == ["costuraprincipiantes"]
    assert data["content"]["cta"].startswith("Guarda")


def test_metadata_la_construye_el_backend():
    with mock_provider() as provider_cls:
        provider_cls.return_value.model = "openai/gpt-oss-20b"
        provider_cls.return_value.generate_structured.return_value = sample_content()
        data = client.post("/api/generate", json=payload()).json()

    meta = data["metadata"]
    assert meta["model"] == "openai/gpt-oss-20b"
    assert meta["prompt_version"] == PROMPT_VERSION
    assert isinstance(meta["latency_ms"], int)
    assert meta["latency_ms"] >= 0
    assert set(meta) == {"model", "prompt_version", "latency_ms"}


def test_el_llm_solo_recibe_el_contenido():
    with mock_provider() as provider_cls:
        provider_cls.return_value.model = "m"
        provider_cls.return_value.generate_structured.return_value = sample_content()
        client.post("/api/generate", json=payload())

    args, _ = provider_cls.return_value.generate_structured.call_args
    messages, schema = args
    assert schema is GeneratedContent
    assert len(messages) == 2
    assert messages[0].type == "system"
    assert messages[1].type == "human"
    assert "cómo elegir la tela" in messages[1].content
    assert "Aula Norte" in messages[1].content


def test_warnings_sin_contexto_de_marca():
    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.return_value = sample_content()
        data = client.post(
            "/api/generate", json=payload(brand_context="")
        ).json()

    assert len(data["warnings"]) == 1
    assert "marca" in data["warnings"][0]


def test_warnings_completas_vacias():
    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.return_value = sample_content()
        data = client.post("/api/generate", json=payload()).json()

    assert data["warnings"] == []


def test_warnings_sin_tema_y_audiencia():
    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.return_value = sample_content()
        data = client.post(
            "/api/generate", json=payload(topic="", audience="")
        ).json()

    joined = " ".join(data["warnings"])
    assert "tema" in joined
    assert "audiencia" in joined


def test_openapi_contrato():
    schema = app.openapi()
    post = schema["paths"]["/api/generate"]["post"]
    ok = post["responses"]["200"]["content"]["application/json"]["schema"]
    assert ok["$ref"].endswith("/GenerateResponse")

    response_schema = schema["components"]["schemas"]["GenerateResponse"]
    assert set(response_schema["required"]) == {
        "platform",
        "content_type",
        "content",
        "metadata",
    }
    assert "warnings" in response_schema["properties"]

    content = schema["components"]["schemas"]["GeneratedContent"]
    assert content["required"] == ["sections"]
    assert set(content["properties"]) == {"title", "sections", "hashtags", "cta"}

    section = schema["components"]["schemas"]["ContentSection"]
    assert section["required"] == ["text"]

    meta = schema["components"]["schemas"]["GenerationMetadata"]
    assert set(meta["required"]) == {"model", "prompt_version", "latency_ms"}


def test_respuesta_invalida_del_llm():
    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.side_effect = (
            OutputParserException("json inválido")
        )
        response = client.post("/api/generate", json=payload())

    assert response.status_code == 502
    assert "estructura no válida" in response.json()["detail"]


def test_request_invalido():
    response = client.post("/api/generate", json={"topic": "solo tema"})
    assert response.status_code == 422

    response = client.post("/api/generate", json={})
    assert response.status_code == 422


def test_hashtags_null_del_llm_se_coacciona_a_lista():
    content = GeneratedContent.model_validate(
        {"sections": [{"text": "hola"}], "hashtags": None}
    )
    assert content.hashtags == []
    assert isinstance(content.hashtags, list)

    omitido = GeneratedContent.model_validate({"sections": [{"text": "hola"}]})
    assert omitido.hashtags == []

    schema = GeneratedContent.model_json_schema()["properties"]["hashtags"]
    assert {"type": "null"} in schema["anyOf"]

    with mock_provider() as provider_cls:
        nulo = sample_content()
        nulo.hashtags = None
        provider_cls.return_value.generate_structured.return_value = nulo
        data = client.post("/api/generate", json=payload()).json()

    assert data["content"]["hashtags"] == []


def test_error_de_la_api_de_groq_devuelve_502():
    import httpx
    from groq import APIStatusError

    response_429 = httpx.Response(
        429,
        request=httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions"),
    )
    error = APIStatusError(
        "Rate limit reached",
        response=response_429,
        body=None,
    )

    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.side_effect = error
        response = client.post("/api/generate", json=payload())

    assert response.status_code == 502
    detail = response.json()["detail"]
    assert "Groq" in detail
    assert "429" in detail
    assert "APIStatusError" in detail
    assert "Rate limit reached" in detail
