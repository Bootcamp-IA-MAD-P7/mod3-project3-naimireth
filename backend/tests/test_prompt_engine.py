from app.prompts.base_rules import OBJECTIVE_RULES, objective_rules_text
from app.prompts.platform_rules import (
    KNOWN_PLATFORMS,
    PLATFORM_UNKNOWN,
    platform_rules,
)
from app.prompts.prompt_engine import build_prompt


BRAND = "Aula Norte, escuela online de costura"
TOPIC = "cómo elegir la tela para un primer proyecto"
AUDIENCE = "personas que están empezando a coser"
CONTENT_TYPE = "publicación"
TONE = "cercano y claro"
OBJECTIVE = "explicar"

FIELDS = {
    "brand_context": BRAND,
    "topic": TOPIC,
    "platform": "Instagram",
    "audience": AUDIENCE,
    "content_type": CONTENT_TYPE,
    "tone": TONE,
    "objective": OBJECTIVE,
}


def format_for(platform, **overrides):
    fields = dict(FIELDS)
    fields["platform"] = platform
    fields.update(overrides)
    return build_prompt(platform).format_messages(**fields)


def texts_for(platform, **overrides):
    return [message.content for message in format_for(platform, **overrides)]


def test_01_instagram_engagement():
    system, human = texts_for("Instagram", objective="engagement", content_type="caption")
    assert "Instagram" in system
    assert "caption" in human and "Instagram" in human
    assert "invita a la conversación" in system
    assert "LinkedIn" not in system


def test_02_linkedin_educar():
    system, human = texts_for("LinkedIn", objective="educar", content_type="artículo")
    assert "LinkedIn" in system
    assert "orden lógico" in system
    assert "Instagram" not in system
    assert "LinkedIn" in human


def test_03_x_audiencia_principiantes():
    system, human = texts_for("X", audience="principiantes absolutos", content_type="hilo")
    assert platform_rules("X") in system
    assert "principiantes absolutos" in human
    assert "hilo" in system and "hilo" in human


def test_04_blog_tono_profesional():
    system, human = texts_for("Blog", tone="profesional y cercano", content_type="artículo")
    assert "Blog" in system
    assert "profesional y cercano" in human
    assert "párrafos" in system
    assert "Pinterest" not in system


def test_05_pinterest_promocionar():
    system, human = texts_for("Pinterest", objective="promocionar", content_type="pin")
    assert "Pinterest" in system
    assert "invitar a guardar" in system
    assert "sin inventar características" in system
    assert "Pinterest" in human


def test_06_brand_context_presente():
    _, human = texts_for("Instagram", brand_context=BRAND)
    assert BRAND in human
    assert "Contexto de marca:" in human


def test_07_brand_context_vacio():
    system, human = texts_for("Instagram", brand_context="")
    assert "Contexto de marca:" in human
    assert "no la supongas" in system


def test_08_informacion_insuficiente():
    system, _ = texts_for("Instagram", brand_context="", topic="lanzamiento del nuevo producto")
    assert "Utiliza únicamente la información proporcionada" in system
    assert "no la supongas ni la rellenes" in system


def test_09_plataforma_no_soportada():
    assert platform_rules("TikTok") == PLATFORM_UNKNOWN
    system, human = texts_for("TikTok")
    assert "Plataforma no reconocida" in system
    assert "TikTok" in human


def test_10_contrato_siete_campos():
    for platform in KNOWN_PLATFORMS:
        messages = format_for(platform)
        assert len(messages) == 2
        assert messages[0].type == "system"
        assert messages[1].type == "human"


def test_11_build_prompt_sin_argumentos():
    fields = dict(FIELDS)
    messages = build_prompt().format_messages(**fields)
    assert len(messages) == 2
    assert "no la supongas" in messages[0].content


def test_12_normalizacion_nombre_plataforma():
    assert platform_rules("Instagram") == platform_rules("  instagram  ")
    assert platform_rules("Twitter") == platform_rules("X")
    assert platform_rules("") == PLATFORM_UNKNOWN


def test_13_sin_counts_rigidos():
    prohibido = ("exactamente 5", "exactamente cinco", "5 hashtags", "máximo 280")
    for platform in KNOWN_PLATFORMS:
        system, human = texts_for(platform)
        for frase in prohibido:
            assert frase not in system
            assert frase not in human


def test_14_reglas_base_completas():
    system, _ = texts_for("Instagram")
    frases = (
        "No inventes información",
        "No inventes enlaces, productos, promociones, descuentos, fuentes ni recursos",
        "únicamente la información proporcionada",
        "no la supongas ni la rellenes",
        "Adapta el vocabulario a la audiencia indicada",
        "Adapta la comunicación al objetivo indicado",
        "el tono cambia la forma de escribir, nunca los hechos",
        "listo para publicar tal cual",
        "No expliques lo que estás haciendo",
    )
    for frase in frases:
        assert frase in system


def test_15_los_tres_objetivos_presentes():
    system, _ = texts_for("Instagram", objective="promocionar")
    for name, guidance in OBJECTIVE_RULES.items():
        assert name in system
        assert guidance in system
    assert objective_rules_text() in system


def test_16_utf8_integro():
    system, _ = texts_for("Instagram")
    assert "información" in system
    assert "ortografía" in system


def test_17_independencia_por_plataforma():
    for platform in KNOWN_PLATFORMS:
        system, _ = texts_for(platform)
        assert system.count(platform_rules(platform)) == 1
        for other in KNOWN_PLATFORMS:
            if other != platform:
                assert platform_rules(other) not in system
