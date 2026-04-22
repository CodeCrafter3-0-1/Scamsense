import firebase_admin
from firebase_admin import credentials, firestore
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os

logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        self.db = None
        self.sql_engine = None
        self.sql_session = None
        self._init_firebase()
        self._init_postgres()

    def _init_firebase(self):
        try:
            # Requires a serviceAccountKey.json in the backend folder
            cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'serviceAccountKey.json')
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                logger.info("Firebase initialized successfully.")
            else:
                logger.warning("Firebase serviceAccountKey.json not found. Running without Firebase.")
        except Exception as e:
            logger.error(f"Firebase init error: {e}")

    def _init_postgres(self):
        try:
            # Example: postgresql://user:password@localhost:5432/scamsense
            db_url = os.getenv("DATABASE_URL")
            if db_url:
                self.sql_engine = create_engine(db_url)
                SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.sql_engine)
                self.sql_session = SessionLocal()
                logger.info("PostgreSQL initialized successfully.")
            else:
                logger.warning("DATABASE_URL not found in .env. Running without PostgreSQL.")
        except Exception as e:
            logger.error(f"PostgreSQL init error: {e}")

    def log_scan(self, scan_data: dict):
        # Example of how it would save to Firebase
        if self.db:
            try:
                self.db.collection('scans').add(scan_data)
            except Exception as e:
                logger.error(f"Failed to save to Firebase: {e}")

db_client = DatabaseConnection()
