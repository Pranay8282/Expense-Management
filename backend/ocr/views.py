from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import pytesseract
from PIL import Image
import io
import re
from datetime import datetime

def parse_ocr_text(text):
    """
    Parses raw text from OCR to find key information like amount, date, and description.
    This implementation is improved to be more robust.
    """
    lines = text.split('\n')
    data = {
        'amount': None,
        'date': None,
        'description': None
    }

    # --- Amount Extraction ---
    # Updated pattern to find integers (e.g., 5000) and decimals (e.g., 50.00)
    amount_pattern = re.compile(r'(\d+(?:[\.,]\d{1,2})?)')
    
    # Pass 1: Prioritize finding "total" from the bottom up.
    for line in reversed(lines):
        if 'total' in line.lower():
            match = amount_pattern.search(line)
            if match:
                data['amount'] = match.group(1).replace(',', '.')
                break  # Found the total, we are done.

    # Pass 2: If no total was found, search for other keywords from the bottom up.
    if not data['amount']:
        other_keywords = ['amount', 'balance', 'due']
        for line in reversed(lines):
            if any(keyword in line.lower() for keyword in other_keywords):
                match = amount_pattern.search(line)
                if match:
                    data['amount'] = match.group(1).replace(',', '.')
                    break # Found a good candidate, stop searching

    # If no keyword-based amount was found, use the largest candidate found as a fallback.
    if not data['amount']:
        amount_candidates = []
        for line in lines:
            matches = amount_pattern.findall(line)
            for m in matches:
                try:
                    amount_candidates.append(float(m.replace(',', '.')))
                except ValueError:
                    continue
        if amount_candidates:
            data['amount'] = f"{max(amount_candidates):.2f}"

    # --- Description Extraction ---
    # Keywords to ignore when looking for a default description (merchant name)
    ignore_keywords = [
        'receipt', 'invoice', 'claim', 'expense', 'date', 'time', 'total', 
        'amount', 'tax', 'vat', 'subtotal', 'cash', 'card', 'change', 'phone'
    ]

    # Default to the first non-empty line that doesn't seem like a header/label
    for line in lines:
        line_lower = line.strip().lower()
        if line_lower and not any(keyword in line_lower for keyword in ignore_keywords):
            data['description'] = line.strip()
            break
    
    # Look for specific remarks/description fields to override the default
    remarks_keywords = ['remarks', 'description', 'memo', 'for']
    for line in lines:
        line_lower = line.lower().strip()
        # Check if a keyword is at the start of the line
        if any(line_lower.startswith(keyword) for keyword in remarks_keywords):
            # Handle cases with a separator like "Description: ..."
            parts = re.split(r'[:\-]', line, maxsplit=1)
            if len(parts) > 1 and parts[1].strip():
                data['description'] = parts[1].strip()
                break
            # Handle cases like "For travel purpose" where there's no colon
            elif line_lower.startswith("for "):
                parts = line.split(maxsplit=1)
                if len(parts) > 1:
                    data['description'] = parts[1].strip().capitalize()
                    break

    # If no description was found at all, fall back to the very first line as a last resort.
    if not data['description']:
        for line in lines:
            if line.strip():
                data['description'] = line.strip()
                break

    # --- Date Extraction (existing logic) ---
    date_patterns = [
        r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})', # 01/25/2023, 25-01-23
        r'(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})', # 2023-01-25
        r'(\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2,4})' # 25 Jan 2023
    ]
    
    date_formats = ['%m/%d/%Y', '%m-%d-%Y', '%m/%d/%y', '%m-%d-%y', '%Y-%m-%d', '%d %b %Y']

    for pattern in date_patterns:
        date_match = re.search(pattern, text, re.IGNORECASE)
        if date_match:
            date_str = date_match.group(1)
            for fmt in date_formats:
                try:
                    data['date'] = datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
                    break # Stop after first successful parse
                except ValueError:
                    continue
            if data['date']:
                break

    return data

class OCRView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'image' not in request.data:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        
        try:
            image = Image.open(io.BytesIO(image_file.read()))
            text = pytesseract.image_to_string(image)
            
            parsed_data = parse_ocr_text(text)
            
            return Response({
                'raw_text': text,
                'parsed_data': parsed_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
