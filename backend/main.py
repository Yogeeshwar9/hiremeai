import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
load_dotenv()

my_api_key = os.getenv("GROQ_API_KEY")
if not my_api_key:
    raise ValueError("Api Key is missing")

client = Groq(api_key=my_api_key)
model="llama-3.3-70b-versatile"

class Skills(BaseModel):
    skills : str

class Experience(BaseModel):
    experience : str
    description: str

class Projects(BaseModel):
    name: str
    description: str
    features: list[str]
    technologies: list[str]
    github_url: str | None = None

class PersonalInfo(BaseModel):
    name : str
    email : str
    phoneNumber : str
    skills : list[Skills]
    experience : list[Experience]
    projects : list[Projects]
    education: list[str]
    certifications: list[str]
    summary : str

SkillsSchema = Skills.model_json_schema()
ExperienceSchema = Experience.model_json_schema()
ProjectsSchema = Projects.model_json_schema()
PersonalInfoSchema = PersonalInfo.model_json_schema()

def extract_pdf():
    import fitz
    # Read pdf from resume folder
    base_dir = Path(__file__).parent
    pdf_path = base_dir/"resume"/"UppulaYogeeshwar9.pdf"
    # open the pdf and store all data in text 
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text = text + page.get_text()
    #close the pdf
    doc.close()
    return text

def parse_resume(text):
    system_prompt = f"""
        Role:
        You are an intelligent resume parser and query responder.
        Task:
        Extract structured information from user-provided text into predefined Pydantic schemas.
        Answer user queries by retrieving relevant data from the previously extracted schemas.
        Constraints:
        Must strictly adhere to the provided schemas ({SkillsSchema}, {ExperienceSchema}, {ProjectsSchema}, {PersonalInfoSchema}).
        Do not hallucinate or invent data; only extract what is explicitly present in the user text.
        If queried data is missing, respond with "No data available" for that field.
        Output Format:
        JSON strictly following the schema definitions.
        Example:
        json
        {{"skills":[{{"skills":"Python"}}]}}
        Zero-shot/One-shot/Few-shots:
        Few-shot: Provide 2–3 examples of extraction and query answering to guide the model.
        Fallback:
        If extraction fails or query cannot be answered, return:
        json
        {{"error":"Unable to extract requested information"}}
    """
    system_msg = {"role": "system", "content": system_prompt}
    pdfExtract_msg = {"role": "user", "content": text}
    response_format = {"type": "json_object"}
    messages = [system_msg, pdfExtract_msg]
    response = client.chat.completions.create(
        messages=messages,
        model=model,
        temperature=0,
        response_format=response_format,
    )
    return response.choices[0].message.content


class ChatRequest(BaseModel):
    question: str


def ask_candidate(question: str, extracted_resume: PersonalInfo):
    system_prompt = f"""
You are an AI assistant representing a job candidate.
Below is everything you know about the candidate.
{extracted_resume.model_dump_json(indent=2)}
Rules:
1. Answer only using this information.
2. Never hallucinate.
3. If information is unavailable,
say
"I don't have enough information to answer that."
4. Be professional.
5. Answer as if HR is interviewing this candidate.
6. When listing items:
   - Use a numbered list.
   - Put exactly one item per line.
   - Do not add blank lines between items.
   - Do not add an introduction or conclusion unless the user asks for one.
   7 when any one ask about first mention it has Personal projects are
   8
"""
    stream = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        model=model,
        temperature=0,
        stream=True,
    )
    
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content

text = extract_pdf()
extracted_resume_json = parse_resume(text)
extracted_resume = PersonalInfo(**json.loads(extracted_resume_json))

@app.get("/")
def home():
    return {
        "message":"hiremeai started running!"
    }

@app.options("/chat")
def options_chat():
    return {}

@app.post("/chat")
def chat(request:ChatRequest):
    return StreamingResponse(
        ask_candidate(request.question, extracted_resume),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
    