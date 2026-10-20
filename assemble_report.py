import os
import docx
from docx import Document
from report_builder_base import add_header_footer
from report_sections_part1 import build_preliminary_pages, build_chapter_1, build_chapter_2
from report_sections_part2 import build_chapter_3
from report_sections_part3 import build_chapter_4
from report_sections_part4 import build_chapter_5_and_beyond

def main():
    print("Initializing Document...")
    doc = Document()
    
    # 1. Apply 1-inch margins and headers/footers
    add_header_footer(doc)
    
    # 2. Build Preliminary Pages (Title, Certificate, Viva Voce, Acknowledgement, Abstract, Lists, TOC)
    print("Building Preliminary Pages...")
    build_preliminary_pages(doc)
    
    # 3. Build Chapter 1 - Introduction
    print("Building Chapter 1 - Introduction...")
    build_chapter_1(doc)
    
    # 4. Build Chapter 2 - Existing System and Proposed System
    print("Building Chapter 2 - Existing System and Proposed System...")
    build_chapter_2(doc)
    
    # 5. Build Chapter 3 - System Analysis and Design
    print("Building Chapter 3 - System Analysis and Design...")
    build_chapter_3(doc)
    
    # 6. Build Chapter 4 - Implementation
    print("Building Chapter 4 - Implementation...")
    build_chapter_4(doc)
    
    # 7. Build Chapter 5, 6, References, Appendices
    print("Building Chapter 5, Chapter 6, References, Appendices...")
    build_chapter_5_and_beyond(doc)
    
    # 8. Save Document in documentation/ and root
    out_path_doc = "documentation/Neighborly_Project_Report.docx"
    out_path_root = "Neighborly_Project_Report.docx"
    
    os.makedirs("documentation", exist_ok=True)
    doc.save(out_path_doc)
    doc.save(out_path_root)
    
    file_size = os.path.getsize(out_path_root)
    print(f"SUCCESS: Report saved successfully to:")
    print(f"  -> {out_path_root} ({file_size / 1024:.1f} KB)")
    print(f"  -> {out_path_doc}")

if __name__ == '__main__':
    main()
