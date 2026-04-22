import logging

logger = logging.getLogger(__name__)

class DatasetLoader:
    """
    Mock service to represent the dataset loading for judge discussions.
    In a real environment, this connects to PostgreSQL or Firebase.
    """
    
    def __init__(self):
        self.public_datasets = [
            "SMS Spam Collection",
            "PhishTank URL Dataset",
            "Public Phishing Email Corpora"
        ]
        
        self.synthetic_india_examples = [
            {"text": "Pay now or account blocked", "label": "fraud"},
            {"text": "Police case against you", "label": "fraud"},
            {"text": "KYC update urgently", "label": "fraud"},
            {"text": "Refund pending click now", "label": "fraud"},
            {"text": "RBI notice immediate payment", "label": "fraud"},
        ]

    def get_info(self):
        return {
            "strategy": "We use public benchmark datasets plus India-specific augmented fraud examples.",
            "public_sources": self.public_datasets,
            "synthetic_count": 1000 # Representative of the 300-1000 scale
        }

dataset_loader = DatasetLoader()
