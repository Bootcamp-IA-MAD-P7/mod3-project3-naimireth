from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()

MODEL = "openai/gpt-oss-20b"


class GroqProvider:
    def __init__(self):
        self.model = MODEL
        self.llm = ChatGroq(
            model=self.model,
            temperature=0.7,
        )

    def generate(self, messages):
        response = self.llm.invoke(messages)
        return response.content

    def generate_structured(self, messages, schema):
        structured = self.llm.with_structured_output(
            schema,
            method="json_schema",
            strict=True,
        )
        return structured.invoke(messages)
