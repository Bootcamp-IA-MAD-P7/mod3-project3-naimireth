import json
import os
import unicodedata
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models.content import GenerateRequest
from app.prompts.platform_rules import (
    KNOWN_PLATFORMS,
    PLATFORM_EXPECTATIONS,
    PLATFORM_NAMES,
    platform_expectations,
)
from app.prompts.prompt_engine import PROMPT_VERSION, build_prompt
from app.providers.groq_provider import MODEL


client = TestClient(app)


def normalize(value):
    text = unicodedata.normalize("NFKD", value or "")
    return text.encode("ascii", "ignore").decode("ascii").strip().lower()


def test_platforms_devuelve_las_cinco():
    response = client.get("/api/platforms")
    assert response.status_code == 200
    platforms = response.json()["platforms"]
    assert [p["id"] for p in platforms] == list(PLATFORM_EXPECTATIONS)
    assert {p["id"] for p in platforms} == set(KNOWN_PLATFORMS)


def test_platforms_coherentes_con_expectations():
    platforms = client.get("/api/platforms").json()["platforms"]
    for item in platforms:
        expectations = PLATFORM_EXPECTATIONS[item["id"]]
        assert item["content_types"] == list(expectations["content_types"])
        assert item["max_sections"] == expectations["max_sections"]
        assert item["title_expected"] == expectations["title_expected"]
        assert item["name"] == PLATFORM_NAMES[item["id"]]


def test_examples_validos_para_generate_request():
    response = client.get("/api/examples")
    assert response.status_code == 200
    examples = response.json()["examples"]
    assert len(examples) >= 5
    ids = [example["id"] for example in examples]
    assert len(ids) == len(set(ids))
    for example in examples:
        brief = GenerateRequest.model_validate(example["brief"])
        assert brief.platform.strip()
        assert brief.topic.strip()
        assert example["label"].strip()


def test_examples_coherentes_con_plataformas():
    examples = client.get("/api/examples").json()["examples"]
    covered = set()
    for example in examples:
        brief = example["brief"]
        expectations = platform_expectations(brief["platform"])
        assert expectations is not None, brief["platform"]
        covered.add(normalize(brief["platform"]))
        content_type = normalize(brief["content_type"])
        assert any(
            normalize(tipo) in content_type for tipo in expectations["content_types"]
        ), (brief["platform"], brief["content_type"])
    assert set(KNOWN_PLATFORMS) <= covered


def test_meta_respuesta_completa():
    response = client.get("/api/meta")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == app.title
    assert data["version"] == app.version
    assert data["prompt_version"] == PROMPT_VERSION
    assert data["model"] == MODEL
    assert data["provider"] == "groq"
    assert data["structured_output"] == {"method": "json_schema", "strict": True}
    assert data["platforms"] == sorted(PLATFORM_EXPECTATIONS)
    assert data["documentation"] == "/docs"


def test_meta_sin_secretos():
    data = client.get("/api/meta").json()
    text = json.dumps(data).lower()
    for palabra in ("key", "secret", "token", "password", "api_key"):
        assert palabra not in text
    groq_key = os.environ.get("GROQ_API_KEY", "")
    if groq_key:
        assert groq_key not in json.dumps(data)


def test_prompt_preview_reutiliza_el_prompt_real():
    brief = {
        "brand_context": "Aula Norte, escuela online de costura",
        "topic": "cómo elegir la tela para un primer proyecto",
        "platform": "Instagram",
        "audience": "personas que están empezando a coser",
        "content_type": "carrusel",
        "tone": "cercano y claro",
        "objective": "educar",
    }
    response = client.get("/api/prompt-preview", params=brief)
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "Instagram"
    assert data["prompt_version"] == PROMPT_VERSION
    assert data["model"] == MODEL

    expected = build_prompt("Instagram").format_messages(**brief)
    assert [m["role"] for m in data["messages"]] == [
        message.type for message in expected
    ]
    assert [m["content"] for m in data["messages"]] == [
        message.content for message in expected
    ]


def test_prompt_preview_sin_parametros():
    response = client.get("/api/prompt-preview")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == ""
    assert len(data["messages"]) == 2
    system = data["messages"][0]["content"]
    assert "TRAZO" in system
    assert "Plataforma no reconocida" in system


def test_prompt_preview_plataforma_desconocida():
    data = client.get("/api/prompt-preview", params={"platform": "TikTok"}).json()
    assert data["platform"] == "TikTok"
    system = data["messages"][0]["content"]
    assert "Plataforma no reconocida" in system


def test_prompt_preview_aplica_reglas_de_la_plataforma():
    system = client.get(
        "/api/prompt-preview", params={"platform": "LinkedIn"}
    ).json()["messages"][0]["content"]
    assert "LinkedIn" in system
    assert "Instagram" not in system
    assert "Salida esperada (LinkedIn)" in system


def test_prompt_preview_no_llama_al_llm():
    with patch(
        "app.providers.groq_provider.GroqProvider.generate_structured",
        side_effect=AssertionError("prompt-preview no debe llamar al LLM"),
    ) as mocked:
        response = client.get("/api/prompt-preview", params={"platform": "X"})
    assert response.status_code == 200
    assert mocked.call_count == 0


def test_health_se_mantiene_en_raiz():
    assert client.get("/health").status_code == 200
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/api/health").status_code == 404


def test_openapi_incluye_endpoints_informativos():
    paths = app.openapi()["paths"]
    for route in ("/api/platforms", "/api/examples", "/api/meta", "/api/prompt-preview"):
        assert "get" in paths[route]
    assert "post" in paths["/api/generate"]
