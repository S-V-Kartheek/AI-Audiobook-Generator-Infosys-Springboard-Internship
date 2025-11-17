#!/usr/bin/env python3
import sys
import json
from gtts import gTTS
import re

def parse_markdown_for_chapters(markdown_text):
    """Parse markdown to extract chapters with their timestamps"""
    lines = markdown_text.split('\n')
    chapters = []
    current_position = 0
    chapter_id = 0
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('#'):
            level = len(stripped.split()[0])
            title = stripped.lstrip('#').strip()
            
            if title:
                chapters.append({
                    'id': f'chapter-{chapter_id}',
                    'title': title,
                    'content': '',
                    'timestamp': current_position,
                    'level': level
                })
                chapter_id += 1
        
        words_in_line = len(stripped.split())
        if words_in_line > 0:
            current_position += words_in_line * 0.5
    
    return chapters

def generate_audio(text, output_path):
    """Generate audio file from text using gTTS"""
    try:
        cleaned_text = re.sub(r'[#*_`\[\]]', '', text)
        cleaned_text = ' '.join(cleaned_text.split())
        
        if not cleaned_text or len(cleaned_text.strip()) < 10:
            raise Exception("Text is too short for audio generation")
        
        tts = gTTS(text=cleaned_text, lang='en', slow=False)
        tts.save(output_path)
        
        return True
    except Exception as e:
        raise Exception(f"Audio generation failed: {str(e)}")

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: tts_generator.py <markdown_text> <output_path>"}))
        sys.exit(1)
    
    markdown_text = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        chapters = parse_markdown_for_chapters(markdown_text)
        
        success = generate_audio(markdown_text, output_path)
        
        if success:
            print(json.dumps({
                "success": True,
                "chapters": chapters,
                "audioPath": output_path
            }))
        else:
            raise Exception("Audio generation failed")
            
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
