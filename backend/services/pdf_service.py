"""
PDF Processing Service
Phase 4: LangGraph Architecture Implementation
"""

import os
import uuid
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

import PyPDF2
import pytesseract
from PIL import Image, ImageDraw, ImageFont
from pdf2image import convert_from_path

from app.config import settings, get_pdf_upload_path, get_preview_path
from models.schemas import DocumentChunk, FileUploadResponse

logger = logging.getLogger(__name__)


class PDFService:
    """Service for processing PDF documents"""
    
    def __init__(self):
        self.upload_path = get_pdf_upload_path()
        self.preview_path = get_preview_path()
        self._configure_tesseract()
    
    def _configure_tesseract(self):
        """Configure Tesseract OCR"""
        try:
            if os.path.exists(settings.tesseract_path):
                pytesseract.pytesseract.tesseract_cmd = settings.tesseract_path
            logger.info("Tesseract OCR configured successfully")
        except Exception as e:
            logger.warning(f"Failed to configure Tesseract: {str(e)}")
    
    async def process_pdf_file(self, file_path: str, file_name: str) -> FileUploadResponse:
        """Process uploaded PDF file"""
        try:
            start_time = datetime.now()
            
            # Extract text and create chunks
            chunks = await self._extract_text_chunks(file_path, file_name)
            
            # Convert PDF to images for preview
            image_paths = await self.convert_pdf_to_images(file_path, file_name)
            
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Extract sections from chunks
            sections = list(set(chunk.section for chunk in chunks))
            
            return FileUploadResponse(
                id=str(uuid.uuid4()),
                name=file_name,
                type="pdf",
                status="completed",
                chunks=len(chunks),
                indexed=True,
                processingTime=processing_time,
                extractedSections=sections
            )
            
        except Exception as e:
            logger.error(f"Failed to process PDF file: {str(e)}")
            return FileUploadResponse(
                id=str(uuid.uuid4()),
                name=file_name,
                type="pdf",
                status="error",
                chunks=0,
                indexed=False,
                processingTime=0,
                extractedSections=[]
            )
    
    async def _extract_text_chunks(self, file_path: str, file_name: str) -> List[DocumentChunk]:
        """Extract text chunks from PDF"""
        chunks = []
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    
                    if text.strip():
                        # Split text into chunks (simple approach - can be enhanced)
                        chunk_size = 1000
                        text_chunks = self._split_text_into_chunks(text, chunk_size)
                        
                        for i, chunk_text in enumerate(text_chunks):
                            chunk = DocumentChunk(
                                id=f"{file_name}_page_{page_num}_chunk_{i}",
                                content=chunk_text,
                                title=file_name,
                                page=page_num,
                                section=self._extract_section_title(chunk_text),
                                metadata={
                                    "file_path": file_path,
                                    "chunk_index": i,
                                    "total_chunks": len(text_chunks)
                                }
                            )
                            chunks.append(chunk)
            
            logger.info(f"Extracted {len(chunks)} text chunks from PDF")
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to extract text chunks: {str(e)}")
            return []
    
    def _split_text_into_chunks(self, text: str, chunk_size: int) -> List[str]:
        """Split text into chunks of specified size"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            if current_size + len(word) + 1 <= chunk_size:
                current_chunk.append(word)
                current_size += len(word) + 1
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def _extract_section_title(self, text: str) -> str:
        """Extract section title from text chunk"""
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and len(line) < 100:  # Likely a title
                return line
        return "Unknown Section"
    
    async def save_uploaded_file(self, file_content: bytes, file_name: str) -> str:
        """Save uploaded PDF file to disk"""
        try:
            print(f"=== PDF SERVICE SAVE DEBUG ===")
            print(f"Saving file: {file_name}")
            print(f"File size: {len(file_content)} bytes")
            print(f"Upload path: {self.upload_path}")
            
            # Ensure upload directory exists
            os.makedirs(self.upload_path, exist_ok=True)
            print(f"Upload directory exists: {os.path.exists(self.upload_path)}")
            print(f"Upload directory permissions: {oct(os.stat(self.upload_path).st_mode)[-3:] if os.path.exists(self.upload_path) else 'N/A'}")
            
            file_path = os.path.join(self.upload_path, file_name)
            print(f"Full file path: {file_path}")
            
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Verify file was saved
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"File saved successfully! Size: {file_size} bytes")
                print(f"File permissions: {oct(os.stat(file_path).st_mode)[-3:]}")
            else:
                print("ERROR: File was not saved!")
            
            print(f"=============================")
            
            logger.info(f"Saved uploaded PDF file: {file_path}")
            return file_path
            
        except Exception as e:
            print(f"ERROR saving PDF file: {str(e)}")
            logger.error(f"Failed to save uploaded PDF file: {str(e)}")
            raise
    
    async def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            text = pytesseract.image_to_string(Image.open(image_path))
            return text.strip()
            
        except Exception as e:
            logger.error(f"Failed to extract text from image: {str(e)}")
            return ""
    
    async def get_pdf_metadata(self, file_path: str) -> Dict[str, Any]:
        """Get PDF metadata"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                metadata = {
                    "pages": len(pdf_reader.pages),
                    "title": pdf_reader.metadata.get('/Title', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "author": pdf_reader.metadata.get('/Author', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "subject": pdf_reader.metadata.get('/Subject', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "creator": pdf_reader.metadata.get('/Creator', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "producer": pdf_reader.metadata.get('/Producer', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "creation_date": pdf_reader.metadata.get('/CreationDate', 'Unknown') if pdf_reader.metadata else 'Unknown',
                    "modification_date": pdf_reader.metadata.get('/ModDate', 'Unknown') if pdf_reader.metadata else 'Unknown'
                }
                
                return metadata
                
        except Exception as e:
            logger.error(f"Failed to get PDF metadata: {str(e)}")
            return {}

    async def convert_pdf_to_images(self, file_path: str, file_name: str) -> List[str]:
        """Convert PDF to images and save them in preview folder"""
        try:
            print(f"=== PDF TO IMAGE CONVERSION DEBUG ===")
            print(f"Converting PDF: {file_path}")
            print(f"File exists: {os.path.exists(file_path)}")
            
            # Create preview directory for this PDF
            pdf_preview_dir = os.path.join(self.preview_path, file_name.replace('.pdf', ''))
            os.makedirs(pdf_preview_dir, exist_ok=True)
            print(f"Preview directory created: {pdf_preview_dir}")
            
            # Try to convert PDF to images with different approaches
            try:
                # Method 1: Try with default settings
                print("Attempting PDF conversion with default settings...")
                images = convert_from_path(file_path, dpi=150)
                print(f"Successfully converted PDF to {len(images)} images")
            except Exception as e:
                print(f"Default conversion failed: {str(e)}")
                
                # Method 2: Try with poppler path (Windows)
                try:
                    print("Attempting PDF conversion with poppler path...")
                    # Common poppler installation paths on Windows
                    poppler_paths = [
                        r"C:\Program Files\poppler\bin",
                        r"C:\Program Files (x86)\poppler\bin",
                        r"C:\poppler\bin"
                    ]
                    
                    for poppler_path in poppler_paths:
                        if os.path.exists(poppler_path):
                            print(f"Found poppler at: {poppler_path}")
                            images = convert_from_path(file_path, dpi=150, poppler_path=poppler_path)
                            print(f"Successfully converted PDF to {len(images)} images using poppler")
                            break
                    else:
                        raise Exception("No working poppler installation found")
                        
                except Exception as e2:
                    print(f"Poppler conversion failed: {str(e2)}")
                    
                    # Method 3: Try with lower DPI as fallback
                    try:
                        print("Attempting PDF conversion with lower DPI...")
                        images = convert_from_path(file_path, dpi=100)
                        print(f"Successfully converted PDF to {len(images)} images with lower DPI")
                    except Exception as e3:
                        print(f"Low DPI conversion failed: {str(e3)}")
                        
                        # Method 4: Create simple text-based images as fallback
                        try:
                            print("Attempting fallback: creating text-based images...")
                            images = self._create_text_based_images(file_path, pdf_preview_dir)
                            print(f"Successfully created {len(images)} text-based images")
                        except Exception as e4:
                            print(f"Text-based conversion failed: {str(e4)}")
                            raise Exception(f"All conversion methods failed: {str(e)}, {str(e2)}, {str(e3)}, {str(e4)}")
            
            # Save images (only if we got images from pdf2image)
            image_paths = []
            if isinstance(images, list) and len(images) > 0:
                for i, image in enumerate(images):
                    image_path = os.path.join(pdf_preview_dir, f"page_{i+1}.png")
                    if hasattr(image, 'save'):  # PIL Image object
                        image.save(image_path, 'PNG')
                        image_paths.append(image_path)
                        print(f"Saved image: {image_path}")
                    else:  # String path (from fallback method)
                        image_paths.append(image)
                        print(f"Using fallback image: {image}")
            
            print(f"=== PDF TO IMAGE CONVERSION COMPLETED ===")
            logger.info(f"Converted PDF to {len(image_paths)} images: {file_name}")
            return image_paths
            
        except Exception as e:
            print(f"=== PDF TO IMAGE CONVERSION FAILED ===")
            print(f"Error: {str(e)}")
            print(f"========================================")
            logger.error(f"Failed to convert PDF to images: {str(e)}")
            return []
    
    def _create_text_based_images(self, file_path: str, preview_dir: str) -> List[str]:
        """Create simple text-based images as fallback when pdf2image fails"""
        try:
            print("Creating text-based images as fallback...")
            
            # Read PDF and extract text
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                image_paths = []
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    
                    # Create a simple image with the text
                    img = Image.new('RGB', (800, 1000), color='white')
                    draw = ImageDraw.Draw(img)
                    
                    # Try to use a default font, fall back to PIL's default if needed
                    try:
                        font = ImageFont.truetype("arial.ttf", 12)
                    except:
                        font = ImageFont.load_default()
                    
                    # Add header
                    header_text = f"PDF Preview - Page {page_num}"
                    draw.text((20, 20), header_text, fill='black', font=font)
                    
                    # Add a note about the fallback method
                    note_text = "Note: This is a text-based preview (poppler not installed)"
                    draw.text((20, 50), note_text, fill='red', font=font)
                    
                    # Draw a border
                    draw.rectangle([10, 10, 790, 990], outline='black', width=2)
                    
                    # Add text content (wrap text to fit)
                    if text.strip():
                        lines = self._wrap_text(text, 70)  # 70 chars per line approximately
                        y_position = 100
                        line_height = 15
                        
                        for line in lines[:50]:  # Show first 50 lines
                            if y_position > 950:  # Stop if we're near the bottom
                                draw.text((20, y_position), "... (text truncated)", fill='gray', font=font)
                                break
                            draw.text((20, y_position), line, fill='black', font=font)
                            y_position += line_height
                    else:
                        draw.text((20, 100), "No text content found on this page", fill='gray', font=font)
                    
                    # Save the image
                    image_path = os.path.join(preview_dir, f"page_{page_num}.png")
                    img.save(image_path, 'PNG')
                    image_paths.append(image_path)
                    print(f"Created text-based image: {image_path}")
                
                return image_paths
                
        except Exception as e:
            print(f"Failed to create text-based images: {str(e)}")
            logger.error(f"Failed to create text-based images: {str(e)}")
            return []
    
    def _wrap_text(self, text: str, width: int) -> List[str]:
        """Wrap text to specified width"""
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            if len(current_line + word) <= width:
                current_line += word + " "
            else:
                if current_line:
                    lines.append(current_line.strip())
                current_line = word + " "
        
        if current_line:
            lines.append(current_line.strip())
        
        return lines


# Global service instance
pdf_service = PDFService() 