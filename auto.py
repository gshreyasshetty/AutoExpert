import streamlit as st
import os
from langchain.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI
from langchain_core.runnables import RunnableLambda
import langchain.globals as lcg
from dotenv import load_dotenv

load_dotenv()

lcg.set_verbose(True)

os.getenv('GOOGLE_API_KEY')
generation_config = {"temperature": 0.6, "top_p": 1, "top_k": 1, "max_output_tokens": 2048}
model = GoogleGenerativeAI(model="gemini-pro", generation_config=generation_config)

prompt_template_auto = PromptTemplate(
    input_variables=['make', 'model', 'year', 'mileage', 'problem', 'symptoms'],
    template="You are an automobile expert. Given the make, model, year, mileage, problem description, and symptoms of a vehicle, provide the following information: "
             "1. **Problem Diagnosis** (in headline font and output in a detailed table)\n"
             "2. **Possible Causes** (with a list of potential causes)\n"
             "3. **Recommended Solutions** (with step-by-step instructions and any necessary tools or parts listed)\n"
             "4. **Maintenance Tips** (to prevent the problem in the future, provided in a detailed table)\n"
             "Vehicle make: {make}\n"
             "Vehicle model: {model}\n"
             "Vehicle year: {year}\n"
             "Vehicle mileage: {mileage}\n"
             "Problem description: {problem}\n"
             "Symptoms: {symptoms}."
)

chain_auto = RunnableLambda(lambda inputs: prompt_template_auto.format(**inputs)) | model

st.markdown(
    f"""
    <style>
        .title {{
            font-size: 32px;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
            text-align: center;
            color: #FFFFFF;
            margin-bottom: 20px;
            background: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 10px;
        }}
        .subtitle {{
            font-size: 20px;
            font-family: 'Helvetica', sans-serif;
            text-align: center;
            color: #FFFFFF;
            margin-bottom: 30px;
            background: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 10px;
        }}
        .form-label {{
            font-weight: bold;
            color: #FFFFFF;
        }}
        .form-input {{
            margin-bottom: 15px;
        }}
        .recommendations {{
            margin-top: 20px;
            font-family: 'Helvetica', sans-serif;
        }}
        .stButton button {{
            transition: background-color 0.3s, transform 0.3s;
        }}
        .stButton button:hover {{
            background-color: #4CAF50;
            transform: scale(1.05);
        }}
        .form-container {{
            background: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 10px;
        }}
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="title">AUTO-EXPERT</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Diagnose Your Vehicle Problems with AI</div>', unsafe_allow_html=True)

with st.form(key='user_input_form', clear_on_submit=True):
    st.markdown('<div class="form-label">Vehicle Make:</div>', unsafe_allow_html=True)
    make = st.text_input('Vehicle Make', key='make', placeholder='Enter the make of your vehicle (e.g., Toyota)', label_visibility='hidden')

    st.markdown('<div class="form-label">Vehicle Model:</div>', unsafe_allow_html=True)
    model = st.text_input('Vehicle Model', key='model', placeholder='Enter the model of your vehicle (e.g., Corolla)', label_visibility='hidden')

    st.markdown('<div class="form-label">Vehicle Year:</div>', unsafe_allow_html=True)
    year = st.text_input('Vehicle Year', key='year', placeholder='Enter the year of your vehicle (e.g., 2015)', label_visibility='hidden')

    st.markdown('<div class="form-label">KM Driven:</div>', unsafe_allow_html=True)
    mileage = st.text_input('Mileage (km)', key='mileage', placeholder='Enter distance covered by your vehicle (e.g., 60000)', label_visibility='hidden')

    st.markdown('<div class="form-label">Problem Description:</div>', unsafe_allow_html=True)
    problem = st.text_area('Problem Description', key='problem', placeholder='Describe the issue your vehicle is experiencing', label_visibility='hidden')

    st.markdown('<div class="form-label">Symptoms:</div>', unsafe_allow_html=True)
    symptoms = st.text_area('Symptoms', key='symptoms', placeholder='List any symptoms observed (e.g., strange noises, warning lights)', label_visibility='hidden')

    submit_button = st.form_submit_button(label='Get Recommendations')
    st.markdown('</div>', unsafe_allow_html=True)

if submit_button:
    if all([make, model, year, mileage, problem, symptoms]):
        input_data = {
            'make': make,
            'model': model,
            'year': year,
            'mileage': mileage,
            'problem': problem,
            'symptoms': symptoms
        }

        recommendations = chain_auto.invoke(input_data)

        st.markdown('<div class="subtitle">Recommendations:</div>', unsafe_allow_html=True)
        st.markdown('<div class="recommendations">', unsafe_allow_html=True)
        st.markdown(recommendations, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    else:
        st.error("Please fill in all the form fields.")
