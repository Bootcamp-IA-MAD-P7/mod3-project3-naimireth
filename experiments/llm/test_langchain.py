from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0.7,
)

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        Eres un creador de contenido profesional.

        Tu tarea es crear contenido listo para publicar.

        Debes adaptar siempre el contenido a:
        - la plataforma
        - la audiencia
        - el formato
        - el tono
        - el objetivo

        Revisa la ortografía antes de responder.

        No inventes datos.
        No añadas explicaciones fuera del contenido solicitado.
        """
    ),
    (
        "human",
        """
        Tema: {topic}
        Plataforma: {platform}
        Audiencia: {audience}
        Formato: {content_type}
        Tono: {tone}
        Objetivo: {objective}

        Genera el contenido listo para publicar.
        """
    ),
])

chain = prompt | llm

response = chain.invoke({
    "topic": "Inteligencia Artificial",
    "platform": "Instagram",
    "audience": "personas que están empezando a aprender IA",
    "content_type": "carrusel educativo",
    "tone": "cercano y fácil de entender",
    "objective": "explicar de forma sencilla qué es la IA",
})

print("\n--- CONTENIDO GENERADO ---\n")
print(response.content)