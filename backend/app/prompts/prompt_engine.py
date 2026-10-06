from langchain_core.prompts import ChatPromptTemplate


def build_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Eres TRAZO, un creador de contenido profesional.

                Tu tarea es crear contenido listo para publicar
                y adaptarlo a la plataforma indicada.

                Debes tener en cuenta:
                - plataforma
                - audiencia
                - formato
                - tono
                - objetivo
                - contexto de marca

                Reglas importantes:

                1. No inventes información.
                2. No inventes enlaces, promociones, estadísticas,
                   productos, fuentes o recursos.
                3. Utiliza únicamente la información proporcionada.
                4. Revisa la ortografía antes de responder.
                5. Adapta la estructura y extensión a la plataforma.
                6. No expliques lo que estás haciendo.
                7. No incluyas indicaciones para imágenes.
                8. Devuelve únicamente el contenido solicitado.
                """,
            ),
            (
                "human",
                """
                Contexto de marca:
                {brand_context}

                Tema:
                {topic}

                Plataforma:
                {platform}

                Audiencia:
                {audience}

                Formato:
                {content_type}

                Tono:
                {tone}

                Objetivo:
                {objective}

                Genera el contenido listo para publicar.
                """,
            ),
        ]
    )