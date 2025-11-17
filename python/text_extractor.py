#!/usr/bin/env python3
import sys
import json
import pdfplumber
from docx import Document
from PIL import Image
import pytesseract

def extract_from_pdf(filepath):
    """Extract text from PDF using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")
    return text

def extract_from_docx(filepath):
    """Extract text from DOCX using python-docx"""
    try:
        doc = Document(filepath)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        raise Exception(f"DOCX extraction failed: {str(e)}")
    return text

def extract_from_image(filepath):
    """Extract text from image using pytesseract OCR"""
    try:
        image = Image.open(filepath)
        text = pytesseract.image_to_string(image)
    except Exception as e:
        raise Exception(f"Image OCR failed: {str(e)}")
    return text

def extract_from_text(filepath):
    """Read plain text file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        raise Exception(f"Text file read failed: {str(e)}")
    return text

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: text_extractor.py <file_path> <file_type>"}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    filetype = sys.argv[2].lower()
    
    try:
        if filetype == 'pdf':
            text = extract_from_pdf(filepath)
        elif filetype == 'docx':
            text = extract_from_docx(filepath)
        elif filetype in ['jpg', 'jpeg', 'png']:
            text = extract_from_image(filepath)
        elif filetype == 'txt':
            text = extract_from_text(filepath)
        else:
            raise Exception(f"Unsupported file type: {filetype}")
        
        if not text or len(text.strip()) < 10:
            raise Exception("No meaningful text could be extracted from the file")
        
        print(json.dumps({"text": text, "success": True}))
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
