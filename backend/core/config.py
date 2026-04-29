"""
core/config.py

Ce module contient la configuration globale de l'application :
- Connexion à Supabase
- Configuration du client OpenAI
- Gestion des variables d'environnement
"""

import os
from supabase import create_client
from openai import OpenAI
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are not defined")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenAI configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key is not defined")

openai_client = OpenAI(api_key=OPENAI_API_KEY)