import google.generativeai as genai
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Google Gemini client
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def analyze_feedback(text: str) -> dict:
    """
    Sends customer feedback text to Gemini to classify:
    1. Sentiment: Positive, Neutral, Negative
    2. Category: Bug, Feature Request, Customer Support, Billing, Other
    
    Returns a dict with keys: 'sentiment' and 'category'.
    If the API call fails or key is missing, falls back to rule-based heuristics.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY environment variable is missing. Using heuristic fallback.")
        return fallback_analyze(text)
    
    prompt = f"""
You are an expert AI customer feedback analyzer. Analyze the sentiment, category, and draft a support response for the following customer feedback.

Feedback:
"{text}"

You must return a JSON object with exactly three keys:
1. "sentiment": must be one of: "Positive", "Neutral", "Negative"
2. "category": must be one of: "Bug", "Feature Request", "Customer Support", "Billing", "Other"
3. "suggested_response": must be a short, professional, and friendly email response addressing the customer's comment (greeting them, answering their request/apologizing for the issue, and closing professionally). Keep it under 4 sentences.

Do not return any other text, markdown formatting, or explanation. Return only valid raw JSON.
"""
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        data = json.loads(response.text.strip())
        
        # Validate values to match expected database categories
        sentiment = data.get("sentiment", "Neutral")
        if sentiment not in ["Positive", "Neutral", "Negative"]:
            sentiment = "Neutral"
            
        category = data.get("category", "Other")
        if category not in ["Bug", "Feature Request", "Customer Support", "Billing", "Other"]:
            category = "Other"
            
        suggested_response = data.get("suggested_response", "")
        if not suggested_response:
            # Generate a standard text fallback if it returned empty
            suggested_response = f"Thank you for sharing your feedback. We have shared your comments with our product team. Feel free to reach out if you have any questions."
            
        return {
            "sentiment": sentiment, 
            "category": category, 
            "suggested_response": suggested_response
        }
        
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}. Falling back to rule-based heuristic.")
        return fallback_analyze(text)

def fallback_analyze(text: str) -> dict:
    """
    Local heuristic fallback function to determine sentiment, category,
    and generate a response draft without calling remote LLMs.
    """
    lower_text = text.lower()
    
    # Basic keyword mapping for sentiment
    pos_words = ["love", "great", "excellent", "awesome", "good", "happy", "amazing", "perfect", "easy", "satisfied"]
    neg_words = ["bad", "hate", "terrible", "worst", "bug", "broken", "slow", "error", "fail", "poor", "annoyed", "frustrated"]
    
    pos_score = sum(1 for w in pos_words if w in lower_text)
    neg_score = sum(1 for w in neg_words if w in lower_text)
    
    if pos_score > neg_score:
        sentiment = "Positive"
    elif neg_score > pos_score:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
        
    # Basic keyword mapping for categories
    if any(w in lower_text for w in ["bug", "broken", "error", "crash", "fail", "freeze", "issue"]):
        category = "Bug"
    elif any(w in lower_text for w in ["feature", "suggest", "add", "want", "wish", "hope", "improve"]):
        category = "Feature Request"
    elif any(w in lower_text for w in ["price", "billing", "charge", "pay", "subscription", "cost", "fee"]):
        category = "Billing"
    elif any(w in lower_text for w in ["support", "help", "contact", "agent", "service", "ticket"]):
        category = "Customer Support"
    else:
        category = "Other"
        
    # Generate heuristic support response email draft
    if sentiment == "Positive":
        suggested_response = "Hi there,\n\nThank you so much for your kind words! We are thrilled to hear that you love our app. Your feedback keeps our team motivated to build great features.\n\nBest regards,\nCustomer Support Team"
    elif category == "Bug":
        suggested_response = "Hi there,\n\nWe apologize for the inconvenience. Our engineering team has been notified of this bug and is working to resolve it as quickly as possible.\n\nBest regards,\nCustomer Support Team"
    elif category == "Billing":
        suggested_response = "Hi there,\n\nThank you for reaching out. We apologize for the billing issue. Our finance team will review the transaction history and get back to you shortly.\n\nBest regards,\nCustomer Support Team"
    elif category == "Feature Request":
        suggested_response = "Hi there,\n\nThank you for your suggestion! We have shared this request with our product management team to guide our future development roadmap.\n\nBest regards,\nCustomer Support Team"
    else:
        suggested_response = "Hi there,\n\nThank you for sharing your feedback. We have shared your comments with our product team to help us improve your experience.\n\nBest regards,\nCustomer Support Team"
        
    return {
        "sentiment": sentiment, 
        "category": category, 
        "suggested_response": suggested_response
    }
