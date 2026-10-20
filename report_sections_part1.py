import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from report_builder_base import (
    add_p, add_heading1, add_heading2, add_heading3, 
    add_bullet, add_table_styled, add_figure_image
)

def build_preliminary_pages(doc):
    # ---------------- PAGE 1: TITLE PAGE ----------------
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(36)
    p_top.paragraph_format.space_after = Pt(12)
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_top.add_run("NEIGHBOURLY: A HYPERLOCAL SERVICE MARKETPLACE CONNECTING RESIDENTS WITH TRUSTED LOCAL SERVICE PROVIDERS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(24)
    p_sub.paragraph_format.space_after = Pt(24)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("A PROJECT REPORT\n\nSubmitted by\n\nPUSHKAR R (Reg. No: 310621104000)\n\nin partial fulfillment for the award of the Degree\nof\nBACHELOR OF ENGINEERING\nin\nCOMPUTER SCIENCE AND ENGINEERING")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(12)
    r_sub.font.bold = True

    p_col = doc.add_paragraph()
    p_col.paragraph_format.space_before = Pt(60)
    p_col.paragraph_format.space_after = Pt(12)
    p_col.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_col = p_col.add_run("EASWARI ENGINEERING COLLEGE\n(AN AUTONOMOUS INSTITUTION) – AFFILIATED TO ANNA UNIVERSITY\nCHENNAI – 600089\n\nOCTOBER 2026")
    r_col.font.name = 'Times New Roman'
    r_col.font.size = Pt(12)
    r_col.font.bold = True
    
    doc.add_page_break()

    # ---------------- PAGE 2: BONAFIDE CERTIFICATE ----------------
    p_c1 = doc.add_paragraph()
    p_c1.paragraph_format.space_before = Pt(18)
    p_c1.paragraph_format.space_after = Pt(6)
    p_c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c1 = p_c1.add_run("EASWARI ENGINEERING COLLEGE\n(Autonomous Institution, Affiliated to Anna University, Chennai)\nRAMAPURAM, CHENNAI – 600089")
    r_c1.font.name = 'Times New Roman'
    r_c1.font.size = Pt(13)
    r_c1.font.bold = True

    p_c2 = doc.add_paragraph()
    p_c2.paragraph_format.space_before = Pt(24)
    p_c2.paragraph_format.space_after = Pt(24)
    p_c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c2 = p_c2.add_run("BONAFIDE CERTIFICATE")
    r_c2.font.name = 'Times New Roman'
    r_c2.font.size = Pt(14)
    r_c2.font.bold = True
    r_c2.underline = True

    add_p(doc, "Certified that this project report titled \"NEIGHBOURLY: A HYPERLOCAL SERVICE MARKETPLACE CONNECTING RESIDENTS WITH TRUSTED LOCAL SERVICE PROVIDERS\" is the bonafide work of PUSHKAR R (Reg. No: 310621104000), who carried out the project work under my supervision.", space_after=36)

    # Signature Block
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.columns[0].width = Inches(3.2)
    sig_table.columns[1].width = Inches(3.2)
    c_left = sig_table.cell(0, 0)
    c_right = sig_table.cell(0, 1)

    p_l = c_left.paragraphs[0]
    p_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_l = p_l.add_run("HEAD OF THE DEPARTMENT\nDepartment of Computer Science & Engg.\nEaswari Engineering College\nRamapuram, Chennai - 600089")
    r_l.font.name = 'Times New Roman'
    r_l.font.size = Pt(11)
    r_l.font.bold = True

    p_r = c_right.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_r = p_r.add_run("PROJECT SUPERVISOR\nDepartment of Computer Science & Engg.\nEaswari Engineering College\nRamapuram, Chennai - 600089")
    r_r.font.name = 'Times New Roman'
    r_r.font.size = Pt(11)
    r_r.font.bold = True

    doc.add_page_break()

    # ---------------- PAGE 3: VIVA VOCE EXAMINATION ----------------
    p_v1 = doc.add_paragraph()
    p_v1.paragraph_format.space_before = Pt(18)
    p_v1.paragraph_format.space_after = Pt(6)
    p_v1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_v1 = p_v1.add_run("EASWARI ENGINEERING COLLEGE\n(Autonomous Institution, Affiliated to Anna University, Chennai)\nRAMAPURAM, CHENNAI – 600089")
    r_v1.font.name = 'Times New Roman'
    r_v1.font.size = Pt(13)
    r_v1.font.bold = True

    p_v2 = doc.add_paragraph()
    p_v2.paragraph_format.space_before = Pt(24)
    p_v2.paragraph_format.space_after = Pt(24)
    p_v2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_v2 = p_v2.add_run("CERTIFICATE OF VIVA-VOCE EXAMINATION")
    r_v2.font.name = 'Times New Roman'
    r_v2.font.size = Pt(14)
    r_v2.font.bold = True
    r_v2.underline = True

    add_p(doc, "This is to certify that the Viva-Voce Examination of the Project Work entitled \"NEIGHBOURLY: A HYPERLOCAL SERVICE MARKETPLACE CONNECTING RESIDENTS WITH TRUSTED LOCAL SERVICE PROVIDERS\" submitted by PUSHKAR R (Reg. No. 310621104000) in partial fulfillment of the requirements for the award of the degree of Bachelor of Engineering in Computer Science and Engineering was conducted on ________________ (Date) in the Department of Computer Science and Engineering, Easwari Engineering College, Ramapuram – Chennai.", space_after=48)

    sig_viva = doc.add_table(rows=1, cols=2)
    sig_viva.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_viva.columns[0].width = Inches(3.2)
    sig_viva.columns[1].width = Inches(3.2)
    cv_l = sig_viva.cell(0, 0)
    cv_r = sig_viva.cell(0, 1)

    pv_l = cv_l.paragraphs[0]
    pv_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    rv_l = pv_l.add_run("INTERNAL EXAMINER\nName: _______________________\nDesignation: __________________\nAddress: _____________________\nDate: ________________________")
    rv_l.font.name = 'Times New Roman'
    rv_l.font.size = Pt(11)

    pv_r = cv_r.paragraphs[0]
    pv_r.alignment = WD_ALIGN_PARAGRAPH.LEFT
    rv_r = pv_r.add_run("EXTERNAL EXAMINER\nName: _______________________\nDesignation: __________________\nAddress: _____________________\nDate: ________________________")
    rv_r.font.name = 'Times New Roman'
    rv_r.font.size = Pt(11)

    doc.add_page_break()

    # ---------------- PAGE 4: ACKNOWLEDGEMENT ----------------
    p_ack = doc.add_paragraph()
    p_ack.paragraph_format.space_before = Pt(18)
    p_ack.paragraph_format.space_after = Pt(18)
    p_ack.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_ack = p_ack.add_run("ACKNOWLEDGEMENT")
    r_ack.font.name = 'Times New Roman'
    r_ack.font.size = Pt(14)
    r_ack.font.bold = True
    r_ack.underline = True

    add_p(doc, "We express our sincere gratitude to our respected Principal Dr. P. Deiva Sundari and the Management of Easwari Engineering College for providing us with the state-of-the-art infrastructural facilities, academic atmosphere, and opportunity to carry out this comprehensive project work.")
    add_p(doc, "We convey our heartfelt thanks to the Head of the Department, Department of Computer Science and Engineering, for continuous encouragement, valuable suggestions, and constant administrative support throughout the tenure of our engineering program.")
    add_p(doc, "We are extremely grateful and deeply indebted to our Project Supervisor for the exemplary guidance, continuous constructive criticism, insightful technical mentorship, and invaluable motivation throughout the conceptualization, system architecture design, and software implementation of the Neighbourly platform.")
    add_p(doc, "We also take immense pleasure in extending our gratitude to all teaching and non-teaching faculty members of the Department of Computer Science and Engineering for their direct and indirect support, technical discussions, and academic backing.")
    add_p(doc, "Finally, we place on record our profound sense of reverence and thanks to our parents and friends for their constant patience, moral encouragement, and selfless sacrifices throughout the course of this academic undertaking.")

    p_sign = doc.add_paragraph()
    p_sign.paragraph_format.space_before = Pt(36)
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_s = p_sign.add_run("PUSHKAR R\n(Reg. No: 310621104000)")
    r_s.font.name = 'Times New Roman'
    r_s.font.size = Pt(11)
    r_s.font.bold = True

    doc.add_page_break()

    # ---------------- PAGE 5: ABSTRACT (Page i) ----------------
    p_abs = doc.add_paragraph()
    p_abs.paragraph_format.space_before = Pt(18)
    p_abs.paragraph_format.space_after = Pt(18)
    p_abs.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_abs = p_abs.add_run("ABSTRACT")
    r_abs.font.name = 'Times New Roman'
    r_abs.font.size = Pt(14)
    r_abs.font.bold = True
    r_abs.underline = True

    add_p(doc, "Rapid urbanization and nuclear family structures in contemporary metropolitan areas have significantly accelerated the domestic demand for on-demand home maintenance, repair, and personal services. However, the existing urban service ecosystem remains deeply fragmented, inefficient, and untrusted. Residents are predominantly compelled to choose between informal, unverified local technicians sourced via word-of-mouth with zero accountability, or monopolistic aggregator platforms that impose exorbitant commission surcharges (ranging from 20% to 35%), enforce rigid one-size-fits-all scheduling, and obscure transparent peer-to-peer communication. Concurrently, skilled independent neighborhood tradespeople—such as certified electricians, licensed plumbers, carpenters, tutors, and appliance mechanics—struggle with poor digital discoverability and excessive platform fees.")

    add_p(doc, "To resolve these systemic challenges, this project conceptualizes, architects, and implements 'NEIGHBOURLY'—an advanced, production-grade Hyperlocal Service Marketplace that seamlessly bridges urban community residents with verified neighborhood service professionals through a transparent, high-trust, and decentralized operational paradigm. The platform is engineered on modern full-stack web engineering standards (React 18 Single Page Application, Node.js and Express RESTful API gateway, and MongoDB Atlas distributed database) fortified by real-time bi-directional WebSocket communication (Socket.IO) and cryptographically secured financial transactions (Razorpay Escrow Gateway).")

    add_p(doc, "A paramount engineering innovation of Neighbourly is its Dual-Tier Artificial Intelligence Architecture. First, to lower digital entry barriers for non-technical residents, an AI-powered Natural Language Service Request Assistant is integrated using large language models (Google Gemini 1.5/3.5 Flash) coupled with a deterministic heuristic NLP fallback parser. This subsystem automatically analyzes unstructured conversational prompts (e.g., 'My kitchen sink is leaking heavily, need someone tomorrow morning, budget around 600'), and maps them into strictly typed schema entities encompassing service categories, calendar dates, time windows, budget boundaries, and required trade skills. Second, the platform executes a deterministic Multi-Factor Hybrid Provider Matching Algorithm that evaluates candidates across five orthogonal dimensions: official identity verification, geographic proximity within neighborhood radius, historical customer ratings, cumulative job completion volume, and price compatibility.")

    add_p(doc, "Neighbourly incorporates a formal Finite State Machine (FSM) to govern the complete lifecycle of service bookings (from PENDING, ACCEPTED, PAYMENT_PENDING, PAID, IN_PROGRESS, to COMPLETED), strictly preventing illegal status tampering. Financial safety is guaranteed through a server-side verified Razorpay payment workflow utilizing HMAC-SHA256 signature validation and idempotency controls. An administrative control dashboard offers platform analytics, dispute arbitration, and a provider credential verification pipeline. Comprehensive test suites executing across unit, integration, and security layers validate 100% test pass rates and demonstrate robust fault tolerance, cementing Neighbourly as an equitable, scalable, and resilient technological solution for localized service economies.")

    add_p(doc, "Keywords: Hyperlocal Marketplace, MERN Stack, Large Language Models, Natural Language Parsing, Hybrid Provider Matching, State Machine, Razorpay Escrow, Socket.IO, Role-Based Access Control.", bold=True, space_after=12)

    doc.add_page_break()

    # ---------------- PAGE 6: LIST OF FIGURES (Page ii) ----------------
    p_lof = doc.add_paragraph()
    p_lof.paragraph_format.space_before = Pt(18)
    p_lof.paragraph_format.space_after = Pt(18)
    p_lof.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_lof = p_lof.add_run("LIST OF FIGURES")
    r_lof.font.name = 'Times New Roman'
    r_lof.font.size = Pt(14)
    r_lof.font.bold = True
    r_lof.underline = True

    lof_headers = ["Figure No.", "Figure Title", "Page No."]
    lof_data = [
        ["Figure 3.1", "Multi-Tier System Architecture of Neighbourly Platform", "14"],
        ["Figure 3.2", "UML Use Case Diagram of Neighbourly Platform Actors and Interactions", "17"],
        ["Figure 3.3", "UML Class Diagram of Domain Models and Entity Relationships", "20"],
        ["Figure 3.4", "UML Sequence Diagram of End-to-End Service Booking and Fulfillment Workflow", "23"],
        ["Figure 3.5", "Context-Level DFD (Level 0) and Functional Decomposition DFD (Level 1)", "25"],
        ["Figure 3.6", "Algorithmic Flowcharts: AI Request Extraction and Booking State Machine", "28"],
        ["Figure 5.1", "High-Fidelity User Interface Screenshots of Neighbourly Platform Modules", "37"],
    ]
    add_table_styled(doc, lof_headers, lof_data, col_widths=[1.4, 4.2, 0.9])

    doc.add_page_break()

    # ---------------- PAGE 7: LIST OF TABLES (Page iii) ----------------
    p_lot = doc.add_paragraph()
    p_lot.paragraph_format.space_before = Pt(18)
    p_lot.paragraph_format.space_after = Pt(18)
    p_lot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_lot = p_lot.add_run("LIST OF TABLES")
    r_lot.font.name = 'Times New Roman'
    r_lot.font.size = Pt(14)
    r_lot.font.bold = True
    r_lot.underline = True

    lot_headers = ["Table No.", "Table Title", "Page No."]
    lot_data = [
        ["Table 2.1", "Comparative Evaluation: Existing Traditional/Aggregator Systems vs Neighbourly", "9"],
        ["Table 3.1", "Hardware Requirements Specification for Server and Client Environments", "11"],
        ["Table 3.2", "Software Requirements and Technology Stack Specification", "12"],
        ["Table 3.3", "Database Entity Collections and Attribute Specifications", "19"],
        ["Table 3.4", "Booking Lifecycle State Transition Feasibility Matrix", "27"],
        ["Table 3.5", "Multi-Factor Hybrid Provider Scoring Weightage and Parameter Mapping", "29"],
        ["Table 4.1", "Core RESTful API Endpoints and Security Authorization Matrix", "33"],
        ["Table 5.1", "Automated Unit and Integration Test Case Suite Execution Log", "39"],
        ["Table 5.2", "Platform Performance Benchmark and Latency Evaluation Results", "42"],
    ]
    add_table_styled(doc, lot_headers, lot_data, col_widths=[1.4, 4.2, 0.9])

    doc.add_page_break()

    # ---------------- PAGE 8: LIST OF ABBREVIATIONS (Page iv) ----------------
    p_loa = doc.add_paragraph()
    p_loa.paragraph_format.space_before = Pt(18)
    p_loa.paragraph_format.space_after = Pt(18)
    p_loa.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_loa = p_loa.add_run("LIST OF ABBREVIATIONS")
    r_loa.font.name = 'Times New Roman'
    r_loa.font.size = Pt(14)
    r_loa.font.bold = True
    r_loa.underline = True

    loa_headers = ["Abbreviation", "Expanded Description"]
    loa_data = [
        ["API", "Application Programming Interface"],
        ["CORS", "Cross-Origin Resource Sharing"],
        ["CSP", "Content Security Policy"],
        ["CSS", "Cascading Style Sheets"],
        ["DFD", "Data Flow Diagram"],
        ["DOM", "Document Object Model"],
        ["FSM", "Finite State Machine"],
        ["HMAC", "Hash-based Message Authentication Code"],
        ["HTTP", "Hypertext Transfer Protocol"],
        ["HTTPS", "Hypertext Transfer Protocol Secure"],
        ["IDOR", "Insecure Direct Object Reference"],
        ["JSON", "JavaScript Object Notation"],
        ["JWT", "JSON Web Token"],
        ["LLM", "Large Language Model"],
        ["MERN", "MongoDB, Express.js, React.js, Node.js"],
        ["MVC", "Model View Controller"],
        ["NLP", "Natural Language Processing"],
        ["NoSQL", "Not Only Structured Query Language"],
        ["ODM", "Object Document Mapper"],
        ["OWASP", "Open Web Application Security Project"],
        ["RBAC", "Role-Based Access Control"],
        ["REST", "Representational State Transfer"],
        ["SHA", "Secure Hash Algorithm"],
        ["SPA", "Single Page Application"],
        ["UI / UX", "User Interface / User Experience"],
        ["URI", "Uniform Resource Identifier"],
        ["URL", "Uniform Resource Locator"],
        ["WSS", "WebSocket Secure Protocol"],
        ["ZOD", "TypeScript-first Schema Declaration and Validation Library"],
    ]
    add_table_styled(doc, loa_headers, loa_data, col_widths=[1.8, 4.7])

    doc.add_page_break()

    # ---------------- TABLE OF CONTENTS ----------------
    p_toc = doc.add_paragraph()
    p_toc.paragraph_format.space_before = Pt(18)
    p_toc.paragraph_format.space_after = Pt(18)
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_toc = p_toc.add_run("TABLE OF CONTENTS")
    r_toc.font.name = 'Times New Roman'
    r_toc.font.size = Pt(14)
    r_toc.font.bold = True
    r_toc.underline = True

    toc_headers = ["S. No.", "Contents", "Page No."]
    toc_data = [
        ["1", "Abstract", "i"],
        ["2", "List of Figures", "ii"],
        ["3", "List of Tables", "iii"],
        ["4", "List of Abbreviations", "iv"],
        ["5", "Chapter 1 – Introduction", "1"],
        ["5.1", "Project Overview", "1"],
        ["5.2", "Problem Statement", "3"],
        ["5.3", "Objectives of the Project", "4"],
        ["5.4", "Scope of the Project", "5"],
        ["6", "Chapter 2 – Existing System and Proposed System", "7"],
        ["6.1", "Existing System", "7"],
        ["6.2", "Limitations of the Existing System", "8"],
        ["6.3", "Proposed Solution", "9"],
        ["6.4", "Advantages of the Proposed System", "10"],
        ["7", "Chapter 3 – System Analysis and Design", "11"],
        ["7.1", "Hardware and Software Requirements", "11"],
        ["7.2", "System Architecture", "13"],
        ["7.3", "Module Description", "15"],
        ["7.4", "UML Diagrams / Data Flow Diagram", "17"],
        ["7.5", "Algorithm / Flowchart", "26"],
        ["8", "Chapter 4 – Implementation", "30"],
        ["8.1", "Implementation Details", "30"],
        ["8.2", "Module Implementation", "31"],
        ["8.3", "Tools and Technologies Used", "34"],
        ["9", "Chapter 5 – Results and Testing", "37"],
        ["9.1", "Screenshots and Outputs", "37"],
        ["9.2", "Testing and Validation", "39"],
        ["9.3", "Results and Discussion", "41"],
        ["10", "Chapter 6 – Conclusion and Future Enhancement", "43"],
        ["10.1", "Conclusion", "43"],
        ["10.2", "Future Enhancements", "44"],
        ["11", "References / Bibliography", "45"],
        ["12", "Appendices (Source Code)", "47"],
    ]
    add_table_styled(doc, toc_headers, toc_data, col_widths=[1.0, 4.6, 0.9])

    doc.add_page_break()

def build_chapter_1(doc):
    # ---------------- CHAPTER 1 - INTRODUCTION ----------------
    add_heading1(doc, "CHAPTER 1 – INTRODUCTION")
    
    add_heading2(doc, "5.1 Project Overview")
    add_p(doc, "In the modern economic landscape, rapid urbanization, rising disposable incomes, and the widespread proliferation of nuclear households have precipitated an unprecedented surge in consumer demand for localized home maintenance, technical installation, and domestic personal assistance. Routine household requirements—ranging from emergency plumbing repairs, electrical short-circuit rectifications, air conditioner servicing, and carpentry fittings to home tutoring, professional deep cleaning, and gardening—form the critical operational backbone of urban day-to-day life.")

    add_p(doc, "Despite this burgeoning demand, the hyperlocal service sector in developing urban economies remains deeply unorganized, highly fragmented, and technically antiquated. The majority of domestic service interactions continue to rely on informal, offline word-of-mouth networks, fragmented community message boards, or roadside business listings. In this unvetted ecosystem, residents frequently encounter unreliable service delivery, arbitrary price inflation, lack of transparent qualifications, and significant domestic security risks when admitting unverified individuals into their homes. On the opposite end of the spectrum, skilled independent micro-entrepreneurs and neighborhood technicians struggle with irregular job discovery, severe geographic travel overheads, and an inability to build a verified digital reputation that reflects their true trade competence.")

    add_p(doc, "To bridge this critical socio-technical gap, 'NEIGHBOURLY' has been conceptualized and implemented as a next-generation, Hyperlocal Service Marketplace. Built on contemporary full-stack web architectures, Neighbourly unites three primary stakeholders—Residents, Service Providers, and Platform Administrators—within a unified, high-trust digital ecosystem. Unlike conventional centralized platforms that treat service providers as commoditized labor and charge prohibitive intermediary fees, Neighbourly fosters a transparent peer-to-peer paradigm where verified neighborhood specialists directly negotiate, submit competitive quotes, and deliver specialized services within localized residential clusters.")

    add_p(doc, "Neighbourly distinguishes itself by pioneering a dual-tier artificial intelligence workflow. First, it eliminates the rigid, multi-step booking questionnaires that historically hinder non-technical citizens by introducing an AI-powered Natural Language Service Request Assistant. Powered by Large Language Models (LLMs) with an embedded deterministic heuristic fallback engine, this subsystem allows a homeowner to articulate their problem in plain conversational prose (e.g., 'My ceiling fan in the master bedroom makes a loud humming sound and stops running, need someone tomorrow afternoon, budget under ₹400'). The system automatically deduces the service classification, operational time slot, calendar schedule, budget ceiling, and trade competencies required. Second, Neighbourly deploys a Multi-Factor Hybrid Provider Matching Algorithm that evaluates verified credentials, geographic proximity, historical customer ratings, job completion velocity, and pricing compatibility to surface the most optimal neighborhood providers.")

    add_heading2(doc, "5.2 Problem Statement")
    add_p(doc, "The domestic and personal services industry in metropolitan ecosystems suffers from acute structural, technological, and economic inefficiencies that degrade user trust and stifle provider livelihood. The primary dimensions of the problem include:")

    add_bullet(doc, "Pervasive Trust Deficit & Safety Hazards", 
               "Traditional informal hiring mechanisms lack systematic identity verification, background validation, and criminal credential checks. Admitting unknown laborers into private residences exposes households to acute safety vulnerabilities, theft, and substandard workmanship without recourse.")

    add_bullet(doc, "Exorbitant Aggregator Commissions", 
               "Contemporary corporate gig aggregators (such as Urban Company and TaskRabbit) extract exploitative platform commissions ranging between 20% and 35% from every service transaction. This substantial deduction severely erodes the net earnings of skilled blue-collar workers while artificially inflating final invoices for residents.")

    add_bullet(doc, "Opaque Pricing & Inflexible Quotations", 
               "Informal technicians routinely practice predatory, unstandardized pricing where costs are arbitrarily inflated on-site after service commencement. Conversely, existing platforms enforce rigid, predefined service packages that fail to accommodate nuanced, non-standard household repair scenarios.")

    add_bullet(doc, "Digital Usability & Friction Barriers", 
               "Existing applications force users through exhaustive, multi-tier hierarchical dropdown menus and technical checkboxes to categorize a household defect. Non-technical citizens, senior citizens, and busy homeowners frequently abandon digital bookings due to cognitive friction and unintuitive user flows.")

    add_bullet(doc, "Absence of Escrow & Financial Security", 
               "In informal offline transactions, advance cash payments often result in contractor abscondment or incomplete work. Simultaneously, service providers face chronic payment defaults and protracted collection disputes after successfully finishing demanding manual labor.")

    add_bullet(doc, "Fragile Cloud & Single-Point AI Dependencies", 
               "Modern web applications that integrate external generative artificial intelligence APIs frequently collapse or experience crippling latency during third-party API rate limits, network outages, or model deprecations, rendering the core booking application inoperable.")

    add_heading2(doc, "5.3 Objectives of the Project")
    add_p(doc, "The principal objective of the Neighbourly project is to engineer, validate, and deploy a secure, resilient, and intelligent Hyperlocal Service Marketplace that democratizes urban service discovery and guarantees transactional trust. The specific engineering objectives are structured as follows:")

    add_bullet(doc, "Architect a Robust Full-Stack MERN Platform", 
               "Construct an enterprise-grade, responsive single-page web application using React 18, Vite, and Tailwind CSS on the client side, decoupled from an asynchronous Node.js and Express RESTful API gateway supported by a MongoDB Atlas NoSQL document database.")

    add_bullet(doc, "Implement Role-Based Access Control (RBAC)", 
               "Establish a cryptographically sound authentication and authorization subsystem utilizing JSON Web Tokens (JWT) and Bcrypt salted password hashing, enforcing granular authorization barriers across Resident, Provider, and Administrator personas.")

    add_bullet(doc, "Develop an AI Natural Language Request Assistant", 
               "Engineer an intelligent parsing engine that extracts structured parameters (category, title, description, budget, scheduled date, time slot, and trade skills) from unstructured free-text user prompts using Google Gemini 1.5/3.5 Flash APIs.")

    add_bullet(doc, "Construct a Resilient Heuristic Fallback NLP Parser", 
               "Design and implement a deterministic, rule-based regular expression fallback parser that automatically intercepts and processes service extraction requests whenever external LLM cloud services experience latency spikes, HTTP 503 unavailability, or network timeouts.")

    add_bullet(doc, "Formulate a Multi-Factor Hybrid Provider Matching Engine", 
               "Implement an algorithmic scoring framework that combines deterministic hard filtering (category alignment, neighborhood boundary containment, active availability) with multi-factor mathematical scoring (verification status, locality proximity, star rating, completed booking volume, price compatibility).")

    add_bullet(doc, "Enforce a Deterministic Booking Finite State Machine", 
               "Design and strictly enforce a server-side state machine governing booking progression across nine explicit states: PENDING, ACCEPTED, PAYMENT_PENDING, PAID, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED, and DISPUTED, disallowing unauthorized state tampering.")

    add_bullet(doc, "Integrate Cryptographically Verified Escrow Payments", 
               "Incorporate the Razorpay Payment Gateway operating in test mode, supporting server-side order generation in paise and client-side checkout validated via HMAC-SHA256 cryptographic signature verification and idempotent webhook event handlers.")

    add_bullet(doc, "Enable Real-Time Bi-Directional Messaging & Notifications", 
               "Deploy a persistent WebSocket server using Socket.IO to facilitate instantaneous private in-app chat between residents and assigned providers, complemented by automated real-time booking lifecycle notifications.")

    add_bullet(doc, "Establish Trust Profiles & Dispute Resolution Mechanics", 
               "Implement an algorithmic Trust Score formulation (0-100) reflecting provider credentials and reviews, coupled with a formal dispute arbitration workflow managed through an administrative control panel.")

    add_bullet(doc, "Execute Comprehensive Automated Testing & Validation", 
               "Author and execute automated unit, integration, and security test suites using the native Node.js test runner to guarantee 100% test pass rates across core marketplace lifecycles.")

    add_heading2(doc, "5.4 Scope of the Project")
    add_p(doc, "The scope of Neighbourly encompasses the technical, geographical, and functional boundaries defined below:")

    add_p(doc, "1. Functional Scope: The platform delivers end-to-end functionality across three distinct user roles. Residents can register, post requests via conversational AI or manual forms, browse catalog services, compare provider offers, execute secure escrow payments, chat in real time, track service execution, and submit verified reviews. Service Providers can curate professional profiles, submit trade credentials for administrative verification, define operational radii and hourly pricing, receive real-time request leads, dispatch competitive quotes, and manage their assigned bookings. Administrators possess system-wide oversight to review provider identity documentation, arbitrate contested disputes, inspect analytical platform metrics (booking velocity, category distribution, revenue volume), and manage service categories.")

    add_p(doc, "2. Geographical & Hyperlocal Scope: The platform is specifically optimized for localized urban clusters (e.g., Indiranagar, Koramangala, Whitefield, HSR Layout) operating within a customizable operational radius of 1 to 50 kilometers (defaulting to 10 kilometers). This ensures minimal provider travel latency, rapid emergency response times, and authentic neighborhood accountability.")

    add_p(doc, "3. Technical & Security Scope: The system adheres to OWASP Top 10 security standards. All incoming requests are validated against strict Zod schemas; Cross-Origin Resource Sharing (CORS) is explicitly constrained; HTTP headers are fortified via Helmet; API abuse is mitigated through Express Rate Limiter; and sensitive credentials are encrypted using Bcrypt and environment isolation.")

    add_p(doc, "4. Limitations & Exclusions: In its current scope, Neighbourly operates payment processing under the Razorpay Sandbox Test Environment, simulating live banking rails without executing actual fiat monetary deductions. Real-time GPS geographic tracking is simulated through neighborhood string mapping and radial mathematical calculations rather than live background telemetry. Native mobile deployment (iOS/Android) is realized through fully responsive progressive web standards rather than compiled native binaries.")

    doc.add_page_break()

def build_chapter_2(doc):
    # ---------------- CHAPTER 2 - EXISTING SYSTEM AND PROPOSED SYSTEM ----------------
    add_heading1(doc, "CHAPTER 2 – EXISTING SYSTEM AND PROPOSED SYSTEM")

    add_heading2(doc, "6.1 Existing System")
    add_p(doc, "The existing landscape of domestic service acquisition is bifurcated into two primary paradigms: the Traditional Informal Offline Ecosystem and Centralized Aggregator Gig Platforms.")

    add_p(doc, "1. The Traditional Informal Offline Ecosystem: Historically, urban households have secured domestic trade technicians through unorganized channels, including local hardware shop referrals, residential security guard recommendations, paper pamphlets, or directory listing services such as JustDial and Sulekha. In this model, transactions are completely unregulated. The directory services operate purely as contact brokers—selling user phone numbers to multiple independent contractors simultaneously without vetting their competence, identity, or criminal history. The resident is inundated with unsolicited calls, must engage in strenuous verbal price bargaining, and bears total financial and physical vulnerability.")

    add_p(doc, "2. Centralized Aggregator Gig Platforms: Over the past decade, venture-backed digital aggregators such as Urban Company, TaskRabbit, and Housejoy emerged to standardize domestic services. These platforms enforce standardized pricing, uniform worker uniforms, and centralized dispatch algorithms. While they introduced baseline scheduling convenience, they introduced severe structural distortions. These platforms operate as centralized monopolies: they treat local workers as commoditized, disposable labor; dictate punitive commission deductions (up to 35%); penalize technicians for rejecting inconvenient jobs; and completely restrict direct communication between residents and workers until minutes before scheduled service delivery.")

    add_heading2(doc, "6.2 Limitations of the Existing System")
    add_p(doc, "A critical analysis of existing systems reveals severe technical, operational, and financial limitations:")

    add_bullet(doc, "Prohibitive Intermediary Overhead", 
               "Aggregator platforms deduct 20% to 35% commission on every transaction, causing inflation of consumer prices and severe erosion of technician livelihoods. Informal directories charge hefty subscription fees to technicians without guaranteeing authentic leads.")

    add_bullet(doc, "Lack of Transparent Peer-to-Peer Communication", 
               "Existing platforms deliberately obscure technician phone numbers and prevent direct in-app messaging prior to payment, preventing residents from discussing nuanced problem details or requesting custom estimates.")

    add_bullet(doc, "Cognitive Overload in Service Discovery", 
               "Users are forced to navigate rigid, static category trees consisting of dozens of nested menus. If a specific household malfunction does not conform exactly to a predefined package (e.g., an unusual pipe leakage combined with wall dampness), the user cannot accurately request assistance.")

    add_bullet(doc, "Single Point of Failure in Cloud Services", 
               "Conventional platforms lack resilient graceful degradation mechanics. If third-party AI services or search indexing clusters fail, the entire customer intake pipeline crashes, resulting in severe business disruption.")

    add_bullet(doc, "Asymmetric Trust & Biased Review Systems", 
               "Aggregator review systems are frequently manipulated through algorithmic curation, suppressing unfavorable feedback to protect platform margins. Conversely, informal offline hiring offers zero historical performance metrics or customer testimonials.")

    add_bullet(doc, "Unenforced State Lifecycles & Dispute Vulnerability", 
               "Informal channels lack transactional audit trails. In the event of damaged property, incomplete installations, or billing extortion, residents have no structured mechanism to freeze payments or seek impartial dispute arbitration.")

    add_heading2(doc, "6.3 Proposed Solution")
    add_p(doc, "To overcome the acute limitations of both informal hiring and monopolistic aggregators, 'NEIGHBOURLY' introduces an intelligent, decentralized, and community-centric Hyperlocal Service Marketplace. Neighbourly restores autonomy and economic equity to local service transactions while maximizing technological efficiency, trust, and transactional safety.")

    add_p(doc, "The proposed solution is founded upon four core architectural pillars:")

    add_p(doc, "1. Dual-Tier Artificial Intelligence Integration: To eliminate cognitive friction, Neighbourly incorporates an AI Natural Language Service Request Assistant powered by Google Gemini LLMs. Users simply describe their issue in natural everyday language. The engine parses the unstructured text and extracts structured booking metadata. Crucially, to prevent system failure during external API outages, Neighbourly features a deterministic Heuristic NLP Parser that operates completely offline on the local server, guaranteeing 100% operational uptime.")

    add_p(doc, "2. Transparent Multi-Factor Hybrid Provider Matching: Rather than assigning arbitrary technicians via an opaque black-box algorithm, Neighbourly implements a transparent scoring framework. Qualified local providers are evaluated across verification credentials, neighborhood radial proximity, customer satisfaction ratings, completed booking volume, and pricing alignment. Residents receive clear, human-readable match explanations (e.g., 'Top Match: Verified Provider • Operates locally in Indiranagar • 4.9★ rating • Budget-friendly rate') while retaining full autonomy to select their preferred technician.")

    add_p(doc, "3. Cryptographically Verified Escrow & State Machine Protection: Transactions within Neighbourly are governed by an immutable Finite State Machine (FSM). Booking transitions from booking creation to completion are strictly enforced on the server. Payments are integrated via Razorpay Escrow (Test Mode), where funds are locked securely upon booking acceptance and disbursed only after authenticated service delivery and mutual resident confirmation, with full support for dispute arbitration.")

    add_p(doc, "4. Real-Time WebSocket Communication & Trust Transparency: Integrated Socket.IO bi-directional channels enable instant, private chat and automated event notifications between residents and providers. Provider profiles exhibit transparent Trust Scores (0-100), calculated dynamically based on administrative document verification, customer review averages, and historical completion rates.")

    add_heading2(doc, "6.4 Advantages of the Proposed System")
    add_p(doc, "The architectural paradigm of Neighbourly provides significant qualitative and quantitative advantages over both traditional offline channels and modern corporate aggregators, as summarized in Table 2.1.")

    tbl_headers = ["Evaluation Metric", "Informal Offline Channels", "Centralized Aggregators", "Neighbourly Platform"]
    tbl_data = [
        ["Platform Commission", "0% (Unregulated)", "20% - 35% (Exorbitant)", "0% - 5% (Equitable Micro-Fee)"],
        ["Identity Verification", "None / Self-Reported", "Internal Platform Check", "Admin Verified Govt ID & Trade Licenses"],
        ["Request Formulation", "Manual Phone Explanation", "Rigid Static Dropdown Menus", "Conversational AI NLP + Manual Override"],
        ["System Fault Tolerance", "N/A (Manual Dependency)", "Prone to Cloud Outages", "Dual-Tier Architecture with Heuristic Fallback"],
        ["Provider Selection", "Random Availability", "Opaque Centralized Dispatch", "Hybrid Scoring with Match Explanations"],
        ["Payment Security", "Unprotected Cash / Advance", "Centralized Debit", "Cryptographically Verified Escrow (Razorpay)"],
        ["Real-time Messaging", "Personal SMS / WhatsApp", "Restricted / Obfuscated", "Bi-directional In-App Socket.IO Channels"],
        ["State Transition Safety", "None (Verbal Agreement)", "Partial Server Validation", "Strict Deterministic Finite State Machine"],
        ["Dispute Resolution", "Police / Civil Litigation", "Slow In-App Support Bots", "Structured Admin Dispute Arbitration Panel"],
        ["Community Trust Metric", "Word-of-Mouth Hearsay", "Filtered Star Rating", "Transparent Algorithmic Trust Score (0-100)"],
    ]
    add_table_styled(doc, tbl_headers, tbl_data, col_widths=[1.5, 1.6, 1.7, 1.7])

    doc.add_page_break()

print("Part 1 built successfully.")
