from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import pytesseract
from PIL import Image
import io

class OCRView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'image' not in request.data:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.data['image']
        
        try:
            image = Image.open(io.BytesIO(image_file.read()))
            # You might need to preprocess the image here (e.g., grayscale, thresholding)
            # for better OCR results.
            text = pytesseract.image_to_string(image)
            
            # Basic parsing logic (can be significantly improved with regex, NLP)
            # This is a very naive implementation for demonstration.
            amount = None
            date = None
            
            # A more robust solution would use regular expressions.
            # For now, we just return the raw text.
            
            return Response({'raw_text': text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
