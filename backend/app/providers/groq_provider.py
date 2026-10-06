from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()


class GroqProvider:
    def __init__(self):
        self.llm = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.7,
        )

    def generate(self, messages):
        response = self.llm.invoke(messages)
        return response.content