from app.models.content import ContentSection, GeneratedContent
from app.prompts.platform_rules import (
    KNOWN_PLATFORMS,
    PLATFORM_EXPECTATIONS,
    expectations_text,
    platform_expectations,
    platform_warnings,
)
from app.prompts.prompt_engine import PROMPT_VERSION
from test_generate_contract import mock_provider, payload
from test_prompt_engine import texts_for


def content_with(section_count=2, title="Título"):
    return GeneratedContent(
        title=title,
        sections=[ContentSection(text="texto {}".format(i + 1)) for i in range(section_count)],
    )


def test_plataformas_cubiertas():
    assert set(PLATFORM_EXPECTATIONS) == set(KNOWN_PLATFORMS)
    assert set(PLATFORM_EXPECTATIONS) == {
        "instagram",
        "linkedin",
        "x",
        "blog",
        "pinterest",
    }
    for exp in PLATFORM_EXPECTATIONS.values():
        assert isinstance(exp["content_types"], tuple)
        assert len(exp["content_types"]) >= 1
        assert exp["max_sections"] is None or (
            isinstance(exp["max_sections"], int) and exp["max_sections"] >= 1
        )
        assert isinstance(exp["title_expected"], bool)


def test_desconocida_sin_expectativas():
    assert platform_expectations("TikTok") is None
    assert expectations_text("TikTok") == ""
    assert platform_warnings("TikTok", "cualquiera", content_with()) == []


def test_salida_esperada_en_el_prompt():
    for platform in KNOWN_PLATFORMS:
        system, _ = texts_for(platform)
        assert "Salida esperada ({})".format(platform) in system
        for other in KNOWN_PLATFORMS:
            if other != platform:
                assert "Salida esperada ({})".format(other) not in system
    unknown, _ = texts_for("TikTok")
    assert "Salida esperada" not in unknown


def test_texto_formatos_y_titulo():
    instagram = expectations_text("Instagram")
    assert "caption" in instagram
    assert "carrusel" in instagram
    assert "reel" in instagram
    assert "título opcional" in instagram

    blog = expectations_text("Blog")
    assert "artículo" in blog
    assert "incluye título" in blog

    assert "post" in expectations_text("LinkedIn")
    assert "tweet" in expectations_text("X")
    assert "pin" in expectations_text("Pinterest")


def test_warning_formato_valido_sin_aviso():
    assert platform_warnings("Instagram", "carrusel educativo", content_with()) == []


def test_warning_formato_no_habitual():
    warnings = platform_warnings("Instagram", "artículo", content_with())
    assert len(warnings) == 1
    assert "no reconocido" in warnings[0]
    assert "Instagram" in warnings[0]
    assert "artículo" in warnings[0]


def test_warning_normalizacion_formato():
    assert platform_warnings("Blog", "ARTÍCULO de opinión", content_with()) == []
    assert platform_warnings("X", "Hilo de 6 mensajes", content_with()) == []
    assert platform_warnings("Pinterest", "Pin creativo", content_with(1)) == []


def test_warning_maximo_secciones():
    exceso = content_with(section_count=9)
    limite = content_with(section_count=8)

    warnings = platform_warnings("X", "hilo", exceso)
    assert len(warnings) == 1
    assert "secciones" in warnings[0]
    assert "X" in warnings[0]

    assert platform_warnings("X", "hilo", limite) == []
    assert platform_warnings("Instagram", "carrusel", content_with(10)) == []
    assert (
        platform_warnings("Instagram", "carrusel", content_with(11)) != []
    )


def test_warning_titulo_blog():
    sin_titulo = content_with(title=None)
    con_titulo = content_with(title="Guía de tejido")

    warnings = platform_warnings("Blog", "artículo", sin_titulo)
    assert len(warnings) == 1
    assert "título" in warnings[0]
    assert "Blog" in warnings[0]

    assert platform_warnings("Blog", "artículo", con_titulo) == []


def test_warning_titulo_pinterest():
    sin_titulo = content_with(section_count=1, title=None)
    con_titulo = content_with(section_count=1, title="Ideas para guardar")

    warnings = platform_warnings("Pinterest", "pin", sin_titulo)
    assert len(warnings) == 1
    assert "título" in warnings[0]

    assert platform_warnings("Pinterest", "pin", con_titulo) == []
    assert platform_warnings("Pinterest", "pin", content_with(2)) != []


def test_endpoint_warnings_de_plataforma():
    with mock_provider() as provider_cls:
        provider_cls.return_value.generate_structured.return_value = content_with()
        data = client_post(content_type="artículo")

    assert any("no reconocido" in w for w in data["warnings"])
    assert any("Instagram" in w for w in data["warnings"])


def client_post(**overrides):
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app).post("/api/generate", json=payload(**overrides)).json()


def test_endpoint_sin_warnings_de_plataforma():
    data = client_post()
    assert data["warnings"] == []
    assert data["metadata"]["prompt_version"] == PROMPT_VERSION
    assert PROMPT_VERSION == "1.1"
