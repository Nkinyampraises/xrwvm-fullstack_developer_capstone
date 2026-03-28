import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

if 'your' in backend_url.lower():
    backend_url = "http://localhost:3030"
if 'your' in sentiment_analyzer_url.lower():
    sentiment_analyzer_url = "http://localhost:5050/"

def _build_url(base_url, endpoint):
    return f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"


def get_request(endpoint, **kwargs):
    request_url = _build_url(backend_url, endpoint)
    response = requests.get(request_url, params=kwargs or None, timeout=10)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    request_url = _build_url(sentiment_analyzer_url, f"analyze/{quote(text)}")
    try:
        response = requests.get(request_url, timeout=10)
        response.raise_for_status()
        json_data = response.json()
        if isinstance(json_data, dict):
            return (
                json_data.get('sentiment')
                or json_data.get('label')
                or json_data.get('result')
                or 'neutral'
            )
        if isinstance(json_data, str):
            return json_data
    except Exception:
        return 'neutral'
    return 'neutral'


def post_review(data_dict):
    request_url = _build_url(backend_url, 'insert_review')
    response = requests.post(request_url, json=data_dict, timeout=10)
    response.raise_for_status()
    return response.json()
