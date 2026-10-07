import unicodedata

PLATFORM_RULES = {
    "instagram": (
        "Instagram: el contenido se lee rápido y en el móvil. Estructura "
        "adaptada al formato indicado (caption, carrusel o reel), con un "
        "inicio que enganche en la primera línea. Hashtags solo si el "
        "usuario los pide y con los que aporte. Tono cercano y visual, sin "
        "texto de relleno."
    ),
    "linkedin": (
        "LinkedIn: audiencia profesional. Primeras líneas con valor concreto, "
        "párrafos cortos y separados, lenguaje profesional pero natural. Sin "
        "clickbait ni tono de hype. Hashtags solo si el usuario los solicita."
    ),
    "x": (
        "X: mensajería breve y directa. Cada frase aporta; nada de relleno ni "
        "de introducciones. Si el tema no cabe en un solo mensaje, estructura "
        "el contenido en hilo. Sin hashtags salvo que el usuario los pida."
    ),
    "blog": (
        "Blog: artículo con título, subtítulos y párrafos pensados para "
        "leerse en pantalla. Estructura según el tipo de contenido indicado. "
        "Desarrolla con la información aportada; no alargues con relleno."
    ),
    "pinterest": (
        "Pinterest: título descriptivo y natural, orientado a quien busca la "
        "idea. Descripción clara con las palabras que usaría quien busca el "
        "tema, sin repetirlas de forma artificial. El contenido debe invitar "
        "a guardar o probar la idea."
    ),
}

ALIASES = {
    "twitter": "x",
}

PLATFORM_UNKNOWN = (
    "Plataforma no reconocida: adapta la estructura, la extensión y el "
    "vocabulario a la plataforma indicada en el brief, sin inventar nada "
    "que no esté aportado."
)

KNOWN_PLATFORMS = sorted(PLATFORM_RULES)

PLATFORM_EXPECTATIONS = {
    "instagram": {
        "content_types": ("caption", "carrusel", "reel"),
        "max_sections": 10,
        "title_expected": False,
    },
    "linkedin": {
        "content_types": ("post", "artículo"),
        "max_sections": None,
        "title_expected": False,
    },
    "x": {
        "content_types": ("tweet", "hilo"),
        "max_sections": 8,
        "title_expected": False,
    },
    "blog": {
        "content_types": ("artículo",),
        "max_sections": None,
        "title_expected": True,
    },
    "pinterest": {
        "content_types": ("pin",),
        "max_sections": 1,
        "title_expected": True,
    },
}


def platform_expectations(platform: str) -> dict | None:
    return PLATFORM_EXPECTATIONS.get(_normalize(platform))


def _join_types(types: tuple) -> str:
    if len(types) == 1:
        return types[0]
    return "{} o {}".format(", ".join(types[:-1]), types[-1])


def expectations_text(platform: str) -> str:
    exp = platform_expectations(platform)
    if not exp:
        return ""
    titulo = "incluye título" if exp["title_expected"] else "título opcional"
    return "Salida esperada ({}): formatos válidos: {}; {}.".format(
        platform,
        _join_types(exp["content_types"]),
        titulo,
    )


def platform_warnings(platform: str, content_type: str, content) -> list[str]:
    exp = platform_expectations(platform)
    if not exp:
        return []
    warnings = []
    normalized_type = _normalize(content_type)
    if not any(_normalize(t) in normalized_type for t in exp["content_types"]):
        warnings.append(
            "Formato «{}» no reconocido como habitual en {}: "
            "la salida puede no ajustarse al canal.".format(
                content_type, platform
            )
        )
    max_sections = exp["max_sections"]
    section_count = len(content.sections)
    if max_sections is not None and section_count > max_sections:
        warnings.append(
            "{} secciones supera lo habitual en {} (hasta {}): "
            "revisa la adaptación al formato.".format(
                section_count, platform, max_sections
            )
        )
    if exp["title_expected"] and not (content.title or "").strip():
        warnings.append(
            "{}: el formato «{}» debería llevar título "
            "y la respuesta no incluye uno.".format(platform, content_type)
        )
    return warnings


def _normalize(platform: str) -> str:
    key = unicodedata.normalize("NFKD", platform or "")
    key = key.encode("ascii", "ignore").decode("ascii")
    key = key.strip().lower()
    return ALIASES.get(key, key)


def platform_rules(platform: str) -> str:
    return PLATFORM_RULES.get(_normalize(platform), PLATFORM_UNKNOWN)
