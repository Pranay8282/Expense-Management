from django.urls import path
from .views import OCRView

urlpatterns = [
    path('scan-receipt/', OCRView.as_view(), name='scan_receipt'),
]



