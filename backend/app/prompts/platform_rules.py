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


def _normalize(platform: str) -> str:
    key = unicodedata.normalize("NFKD", platform or "")
    key = key.encode("ascii", "ignore").decode("ascii")
    key = key.strip().lower()
    return ALIASES.get(key, key)


def platform_rules(platform: str) -> str:
    return PLATFORM_RULES.get(_normalize(platform), PLATFORM_UNKNOWN)
