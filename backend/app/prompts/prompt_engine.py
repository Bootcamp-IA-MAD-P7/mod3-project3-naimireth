from langchain_core.prompts import ChatPromptTemplate

from app.prompts.base_rules import BASE_RULES, objective_rules_text
from app.prompts.platform_rules import expectations_text, platform_rules


PROMPT_VERSION = "1.1"


HUMAN_TEMPLATE = """
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
                """


def build_prompt(platform: str = "") -> ChatPromptTemplate:
    base_rules = "{}\n\n{}".format(BASE_RULES, objective_rules_text())

    return ChatPromptTemplate.from_messages(
        [
            ("system", "{base_rules}\n\n{platform_rules}\n\n{platform_expectations}"),
            ("human", HUMAN_TEMPLATE),
        ]
    ).partial(
        base_rules=base_rules,
        platform_rules=platform_rules(platform),
        platform_expectations=expectations_text(platform),
    )
