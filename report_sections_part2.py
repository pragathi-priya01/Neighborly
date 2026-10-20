import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from report_builder_base import (
    add_p, add_heading1, add_heading2, add_heading3, 
    add_bullet, add_table_styled, add_figure_image
)
from report_helpers import add_code_box, add_callout_box

def build_chapter_3(doc):
    # ---------------- CHAPTER 3 - SYSTEM ANALYSIS AND DESIGN ----------------
    add_heading1(doc, "CHAPTER 3 – SYSTEM ANALYSIS AND DESIGN")

    add_heading2(doc, "7.1 Hardware and Software Requirements")
    add_p(doc, "To ensure high availability, horizontal scalability, low-latency responsiveness, and platform security, the technical infrastructure of Neighbourly has been rigorously engineered across development, testing, and production deployment environments. The detailed hardware specifications and software stack dependencies are documented below.")

    add_heading3(doc, "7.1.1 Hardware Requirements Specification")
    add_p(doc, "The minimum and recommended hardware requirements for deploying the Neighbourly backend API server, database cluster, and client application runtime are outlined in Table 3.1.")

    hw_headers = ["Infrastructure Tier", "Minimum Specification", "Recommended Production Specification"]
    hw_data = [
        ["Server Processor (CPU)", "Dual-Core x86_64 or ARM64 @ 2.0 GHz", "Quad-Core Intel Xeon or AMD EPYC @ 3.2 GHz"],
        ["Server Memory (RAM)", "4 GB DDR4 RAM", "16 GB DDR4/DDR5 ECC RAM"],
        ["Server Disk Storage", "20 GB Solid State Drive (SSD)", "100 GB NVMe PCIe Gen 4 SSD"],
        ["Network Interface", "100 Mbps Ethernet / Fiber Connection", "1 Gbps Dedicated Low-Latency Uplink"],
        ["Client Workstation CPU", "Intel Core i3 / AMD Ryzen 3 or equivalent", "Intel Core i5 / Apple Silicon M-Series or higher"],
        ["Client Workstation RAM", "4 GB RAM", "8 GB to 16 GB Dual-Channel RAM"],
        ["Client Display Resolution", "1280 x 720 (Standard HD)", "1920 x 1080 (Full HD) or Mobile Retina Display"],
        ["Client Input Peripherals", "Standard Keyboard and Pointing Device", "Multi-touch Display or Trackpad"],
    ]
    add_table_styled(doc, hw_headers, hw_data, col_widths=[2.1, 2.2, 2.2])

    add_heading3(doc, "7.1.2 Software Requirements and Dependencies")
    add_p(doc, "The comprehensive software environment, encompassing operating systems, programming languages, application frameworks, database servers, and cloud developer APIs, is specified in Table 3.2.")

    sw_headers = ["Layer / Component", "Technology / Framework", "Version", "Operational Role"]
    sw_data = [
        ["Operating System", "Microsoft Windows 10/11 / Ubuntu Linux", "22.04 LTS / 64-bit", "Host Server & Development Environment"],
        ["Runtime Environment", "Node.js (JavaScript Runtime)", "v20.18+ / v22.x LTS", "Asynchronous Event-Driven API Server"],
        ["Package Manager", "Node Package Manager (NPM)", "v10.8+", "Dependency & Workspace Orchestration"],
        ["Frontend UI Framework", "React.js (SPA Architecture)", "v18.3.1", "Component-Based Reactive User Interface"],
        ["Build Tool & Dev Server", "Vite JS", "v6.0.5", "High-Speed Hot Module Replacement & Bundling"],
        ["CSS Styling Framework", "Tailwind CSS & PostCSS", "v3.4.17", "Utility-First Responsive Design System"],
        ["Iconography & UI Assets", "Lucide React", "v0.468.0", "Clean Vector Icon Suite for Dashboards"],
        ["Backend Web Framework", "Express.js", "v4.21.2", "RESTful Routing, Middleware & API Engine"],
        ["Database Management", "MongoDB Atlas (NoSQL Document Store)", "v7.0 / v8.0", "Cloud Distributed JSON Document Persistence"],
        ["In-Memory Dev DB", "mongodb-memory-server", "v10.1.3", "Zero-Friction In-Memory DB for Testing"],
        ["Object Document Mapper", "Mongoose ODM", "v8.9.5", "Strict Data Modeling, Hooks & Validation"],
        ["Real-time WebSockets", "Socket.IO (Server & Client)", "v4.8.1", "Bi-directional Real-time Chat & Push Events"],
        ["Payment Gateway API", "Razorpay Node.js SDK", "v2.9.5", "Test Mode Escrow Order Creation & Webhooks"],
        ["Generative AI Engine", "Google Gemini 1.5/3.5 Flash API", "v1beta REST", "Natural Language Service Request Parser"],
        ["Cryptographic Security", "Bcrypt.js & Node Crypto", "v3.0.2 / Native", "Password Hashing & HMAC SHA-256 Signatures"],
        ["Token Authentication", "JSON Web Token (jsonwebtoken)", "v9.0.2", "Stateless Session Management & RBAC Claims"],
        ["Schema Data Validator", "Zod Schema Validation", "v3.24.1", "Strict Runtime Input Sanitization & Typing"],
        ["Application Security", "Helmet & Express Rate Limit", "v8.0.0 / v7.5.0", "HTTP Header Fortification & DDoS Defense"],
        ["Structured Logging", "Pino & Pino-Pretty", "v9.6.0 / v13.0.0", "High-Throughput JSON Asynchronous Logging"],
    ]
    add_table_styled(doc, sw_headers, sw_data, col_widths=[1.5, 1.9, 1.2, 1.9])

    add_heading2(doc, "7.2 System Architecture")
    add_p(doc, "The Neighbourly platform is engineered in strict accordance with the Classical 3-Tier Layered Architectural Pattern, augmented by an asynchronous real-time WebSocket communication layer and an external cloud microservices bridge. This multi-tiered paradigm enforces absolute separation of concerns, guarantees modular extensibility, facilitates horizontal scalability, and fortifies the system against cross-tier security vulnerabilities. Figure 3.1 delineates the complete multi-tier system architecture.")

    add_figure_image(doc, 'documentation/report_assets/fig3_1_system_architecture.png', 
                     "Figure 3.1: Multi-Tier System Architecture of Neighbourly Platform")

    add_p(doc, "The architectural tiers operate with defined boundaries and responsibilities as detailed below:")

    add_p(doc, "1. Presentation Tier (Client Single Page Application): The topmost tier executes entirely within the client's web browser environment. Engineered using React 18, Vite, and Tailwind CSS, it renders a high-performance, responsive user interface optimized across desktop monitors, tablets, and smartphones. The Presentation Tier is partitioned into three dedicated operational portals: the Resident Portal (encompassing the AI Request Assistant, service discovery catalog, live tracking, and review interfaces), the Provider Portal (comprising the real-time request broadcast feed, quotation submission modal, active job boards, and earnings analytics), and the Admin Control Center (hosting verification review pipelines, dispute arbitration workflows, and platform telemetry). State management is orchestrated via React Context and Zustand, while bi-directional event reactivity is sustained via the Socket.IO client library.")

    add_p(doc, "2. Application Logic & API Services Tier (Express.js & Node.js): The middle tier acts as the centralized intelligence and security gateway of the platform. Operating on an asynchronous, non-blocking I/O model powered by Node.js, the Express server mounts a robust middleware pipeline that intercepts all incoming HTTP requests. The security perimeter enforces Helmet header hardening, CORS domain restrictions, rate limiting to neutralize automated scrapers, and JSON Web Token (JWT) cryptographic signature validation. Business logic is strictly segregated into dedicated, decoupled service classes (e.g., BookingService, PaymentService, AIService, ProviderService, DisputeService). Furthermore, a persistent WebSocket server (Socket.IO) maintains authorized socket connections to instantly broadcast localized request leads and dispatch private chat messages.")

    add_p(doc, "3. Data Persistence & External Services Tier: The foundational tier comprises cloud persistence datastores and third-party API integrations. Primary transactional data—encompassing user credentials, provider trade profiles, service catalogs, requests, quotation bids, booking records, payment ledgers, chat dialogues, and reviews—is persisted in MongoDB Atlas, a globally distributed, highly available NoSQL document database accessed via Mongoose ODM connection pools. For isolated development and test execution, an embedded in-memory MongoDB server is maintained. External communication bridges link the server tier to the Google Gemini Generative AI endpoints for natural language service parsing and the Razorpay Payment Gateway for escrow order generation, checkout simulation, and HMAC-SHA256 webhook cryptographic verification.")

    add_heading2(doc, "7.3 Module Description")
    add_p(doc, "Neighbourly is modularized into eight highly specialized, decoupled subsystems designed for high cohesion and low coupling:")

    add_bullet(doc, "Module 1: Authentication & Role-Based Access Control (RBAC)", 
               "Orchestrates user identity lifecycles across three distinct personas: RESIDENT, PROVIDER, and ADMIN. Implements secure password hashing with Bcrypt using 10 salt rounds, disallows registration with duplicate email addresses, issues signed JSON Web Tokens (JWT) containing encoded role claims, and enforces route-level middleware guards preventing unauthorized privilege escalation and Insecure Direct Object References (IDOR).")

    add_bullet(doc, "Module 2: Provider Onboarding, Document Verification & Trust Profile", 
               "Enables tradespeople to curate professional profiles, define trade skills, establish hourly billing rates, specify operational neighborhoods, and set radial service boundaries (1-50 km). Provides a document upload conduit for government IDs and vocational trade certificates. Calculates an automated, transparent composite Trust Score (0-100) based on administrative verification status, customer ratings, and completed service volume.")

    add_bullet(doc, "Module 3: AI Service Request Assistant & Heuristic Fallback Engine", 
               "Ingests unstructured, natural language resident problem descriptions and executes intent classification and entity extraction. Utilizes Google Gemini LLMs to parse categories, schedules, time slots, and budgets into strict JSON schemas validated via Zod. Embeds a deterministic, regular-expression heuristic fallback parser that guarantees seamless, un-interrupted operation during cloud API downtime or network latency.")

    add_bullet(doc, "Module 4: Service Catalog, Search & Hybrid Multi-Factor Provider Matching", 
               "Maintains a centralized taxonomy of urban service categories (Plumbing, Electrical, Carpentry, Appliance Repair, Cleaning, Tutoring, Gardening, etc.). Executes a multi-factor hybrid matching algorithm that filters candidate providers based on category and neighborhood boundary, scoring them against an objective 100-point rubric to generate ranked recommendations accompanied by human-readable match explanations.")

    add_bullet(doc, "Module 5: Request Broadcasting & Quotation Bidding Workflow", 
               "When a resident confirms a service request, the system identifies eligible providers within the designated radial boundary and broadcasts real-time alerts. Qualified providers review the customer's problem description, photographs, and proposed budget, subsequently submitting competitive quotation offers with personalized notes.")

    add_bullet(doc, "Module 6: Booking Finite State Machine Lifecycle Engine", 
               "Governs the formal progression of bookings through an immutable state machine. Regulates state transitions across PENDING, ACCEPTED, PAYMENT_PENDING, PAID, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED, and DISPUTED. Rejects unauthorized state tampering, enforces actor ownership boundaries, and automatically synchronizes booking progress across resident and provider dashboards.")

    add_bullet(doc, "Module 7: Razorpay Escrow Payment & Webhook Verification Module", 
               "Integrates the Razorpay Payment Gateway operating in Sandbox Test Mode. Generates cryptographically signed server orders in paise, renders client checkout modals, and verifies incoming transactions on the backend using HMAC-SHA256 signature validation against the secret key. Implements idempotent webhook handlers to record payment receipts and unlock service execution.")

    add_bullet(doc, "Module 8: Real-Time Communication (Socket.IO) & Dispute Arbitration", 
               "Maintains persistent bi-directional communication channels supporting authenticated private chat rooms between residents and matched providers. Manages in-app notification dispatches for critical lifecycle events. Houses a formal dispute management engine permitting users to contest disputed bookings, providing an administrative portal for evidence review, refund authorization, or completion enforcement.")

    add_heading2(doc, "7.4 UML Diagrams / Data Flow Diagram")
    add_p(doc, "Standard Unified Modeling Language (UML) structural and behavioral diagrams, along with Data Flow Diagrams (DFD), are presented below to formalize the static architecture and dynamic execution semantics of the Neighbourly platform.")

    add_heading3(doc, "7.4.1 UML Use Case Diagram")
    add_p(doc, "The UML Use Case Diagram visually represents the functional interactions between the primary human actors (Resident, Service Provider, Platform Admin), external software actors (Razorpay Gateway, Gemini AI Engine), and the core use cases enclosed within the Neighbourly system boundary. Figure 3.2 illustrates the complete Use Case model.")

    add_figure_image(doc, 'documentation/report_assets/fig3_2_use_case_diagram.png', 
                     "Figure 3.2: UML Use Case Diagram of Neighbourly Platform Actors and Interactions")

    add_p(doc, "Detailed Actor-to-Use-Case Mappings:")
    add_bullet(doc, "Resident (Primary Consumer Actor)", 
               "Executes User Registration and Login (UC1); posts unstructured service requirements via the AI Request Assistant (UC2); modifies extracted parameters or books directly from the service catalog (UC3); browses and filters verified neighborhood providers (UC4); compares quotes and accepts provider offers (UC7); executes secure escrow payment via Razorpay (UC8); communicates via real-time private chat (UC9); monitors and confirms booking status progression (UC10); submits verified post-service ratings and reviews (UC11); and raises formal disputes when service delivery is unsatisfactory (UC12).")

    add_bullet(doc, "Service Provider (Primary Technician Actor)", 
               "Registers and maintains professional trade profile, pricing, and operational radius (UC5); uploads identity documents and certifications for administrative vetting (UC5); inspects the broadcast feed of local service requests and dispatches custom quotation offers (UC6); engages in real-time client chat (UC9); updates booking operational status (IN_PROGRESS, COMPLETED) (UC10); and participates in dispute resolution hearings (UC12).")

    add_bullet(doc, "Platform Administrator (Governance Actor)", 
               "Maintains platform-wide security governance; inspects and approves or rejects provider onboarding credentials in the verification queue (UC5); arbitrates contested booking disputes, reviews submitted photographic evidence, and authorizes refunds or payouts (UC12); monitors platform operational analytics and telemetry (total revenue, booking volume, user growth) (UC13); and curates service catalog taxonomies (UC13).")

    add_bullet(doc, "External Razorpay Payment Gateway (External Service Actor)", 
               "Receives server-side order creation requests in paise, presents secure checkout UI, issues transaction tokens, and transmits cryptographically signed webhook payloads to confirm fund escrows (UC8).")

    add_bullet(doc, "External Google Gemini AI Engine (External Service Actor)", 
               "Receives conversational natural language resident prompts, executes semantic entity parsing, and returns structured JSON entities adhering to the platform's Zod schema (UC2).")

    add_heading3(doc, "7.4.2 UML Class Diagram")
    add_p(doc, "The UML Class Diagram models the static structural foundation of the Neighbourly domain layer. It defines the core entity models, their private and public attributes, behavioral member methods, and cardinality relationships. Figure 3.3 illustrates the domain class architecture.")

    add_figure_image(doc, 'documentation/report_assets/fig3_3_class_diagram.png', 
                     "Figure 3.3: UML Class Diagram of Domain Models and Entity Relationships")

    add_p(doc, "The database entity collections, primary schema attributes, and structural multiplicities are specified in Table 3.3.")

    cls_headers = ["Domain Entity", "Core Schema Attributes", "Associated Methods", "Relationships & Multiplicity"]
    cls_data = [
        ["User", "_id, name, email, passwordHash, role, neighborhood, accountStatus, profileImage", "comparePassword(), toJSON()", "1 to 1 with ProviderProfile; 1 to * with Requests, Bookings"],
        ["ProviderProfile", "_id, user, bio, skills[], services[], hourlyRate, verificationStatus, rating, trustScore", "recalculateTrustScore()", "1 to 1 with User; * to * with Service; 1 to * with Offers"],
        ["Service", "_id, name, category, description, basePrice, icon, isActive", "getPopularServices()", "* to * with ProviderProfile; 1 to * with Bookings"],
        ["ServiceRequest", "_id, requester, category, title, description, budget, preferredDate, time, status, aiAssisted", "matchProviders()", "* to 1 with User; 1 to * with ProviderOffers; 0..1 with Booking"],
        ["ProviderOffer", "_id, request, provider, price, estimatedDuration, notes, status", "acceptOffer(), rejectOffer()", "* to 1 with ServiceRequest; * to 1 with User; 1 to 0..1 Booking"],
        ["Booking", "_id, requester, provider, service, request, offer, amount, status, scheduledDate, address, payment", "canTransitionTo(status)", "* to 1 with User; 1 to 1 with Payment; 1 to 0..1 Review"],
        ["Payment", "_id, booking, requester, provider, amount, razorpayOrderId, razorpayPaymentId, status, mode", "verifySignature()", "1 to 1 with Booking; * to 1 with User"],
        ["Review", "_id, booking, reviewer, provider, rating, comment, verifiedBooking", "recalculateAverage()", "1 to 1 with Booking; * to 1 with ProviderProfile"],
        ["Dispute", "_id, booking, raisedBy, reason, description, evidence[], status, adminNotes, resolution", "resolveDispute()", "1 to 1 with Booking; * to 1 with User"],
    ]
    add_table_styled(doc, cls_headers, cls_data, col_widths=[1.3, 2.5, 1.4, 1.3])

    add_heading3(doc, "7.4.3 UML Sequence Diagram")
    add_p(doc, "The UML Sequence Diagram outlines the dynamic temporal message sequence and asynchronous control flow governing an end-to-end service lifecycle: from initial natural language request generation and quotation bidding, through escrow payment verification, to final job completion. Figure 3.4 delineates the sequence workflow.")

    add_figure_image(doc, 'documentation/report_assets/fig3_4_sequence_diagram.png', 
                     "Figure 3.4: UML Sequence Diagram of End-to-End Service Booking and Fulfillment Workflow")

    add_p(doc, "Chronological Workflow Walkthrough:")
    add_p(doc, "1. Request Formulation: The resident inputs a conversational problem statement into the client UI. The client issues an asynchronous POST request to '/api/ai/extract-request'.")
    add_p(doc, "2. AI Entity Extraction: The Express server forwards the prompt to the Gemini Generative AI endpoint. Upon receiving structured JSON, the server validates parameters against Zod schema rules and responds to the client. (If Gemini is unavailable, the local heuristic fallback engine immediately executes).")
    add_p(doc, "3. Confirmation & Broadcast: The resident inspects the pre-populated booking form, makes optional edits, and confirms submission. The server saves the ServiceRequest in MongoDB and transmits a WebSocket broadcast event ('NEW_REQUEST') to all active, verified providers operating within that neighborhood radius.")
    add_p(doc, "4. Quotation Submission: Providers review the request details and submit formal bids (POST '/api/offers'). The server notifies the resident in real time via WebSocket ('OFFER_RECEIVED').")
    add_p(doc, "5. Acceptance & Order Generation: The resident evaluates submitted offers and accepts their preferred technician. The server transitions the offer status to ACCEPTED and generates a Booking record in PAYMENT_PENDING state. The server invokes the Razorpay Orders API to generate an order ID with the amount specified in paise.")
    add_p(doc, "6. Escrow Payment & Verification: The resident completes the simulated checkout modal. The client transmits the payment ID, order ID, and signature to '/api/payments/verify'. The server validates the cryptographic HMAC-SHA256 signature. Upon success, the booking transitions to PAID, locking funds in escrow and alerting the provider to begin transit.")
    add_p(doc, "7. Service Delivery & Rating: The provider marks the booking as IN_PROGRESS upon arrival, and subsequently COMPLETED upon job conclusion. The resident confirms completion, releasing provider funds, and submits a verified 5-star rating and textual review, dynamically updating the provider's platform Trust Score.")

    add_heading3(doc, "7.4.4 Data Flow Diagrams (DFD Level 0 and Level 1)")
    add_p(doc, "Data Flow Diagrams trace the flow of data through the system, capturing external entities, transformation processes, and underlying datastores. Figure 3.5 presents both the Context-Level DFD (Level 0) and the Functional Decomposition DFD (Level 1).")

    add_figure_image(doc, 'documentation/report_assets/fig3_5_dfd_level0_level1.png', 
                     "Figure 3.5: Context-Level DFD (Level 0) and Functional Decomposition DFD (Level 1)")

    add_p(doc, "DFD Level 0 (Context Level): The context diagram depicts Neighbourly as a single holistic process (0.0) interfacing with four primary external entities: Resident, Provider, Admin, and the Razorpay Gateway. The Resident supplies authentication credentials, natural language prompts, booking choices, and escrow payments, receiving in return formatted booking schedules, quotation bids, and service confirmations. The Provider supplies profile credentials, certification documents, and custom offers, receiving targeted job notifications and escrow payout settlements. The Admin injects dispute rulings and certification approvals, receiving platform operational logs and telemetry. The Razorpay Gateway exchanges order identifiers and cryptographically signed payment verification tokens.")

    add_p(doc, "DFD Level 1 (Functional Decomposition): Decomposes Process 0.0 into seven discrete sub-processes interacting with three persistent datastores: Process 1.0 (Auth & RBAC) synchronizes with Datastore D1 (Users & Profiles); Process 2.0 (AI Request Parser) extracts structured parameters and populates Datastore D2 (Requests & Offers); Process 3.0 (Offer Matching & Dispatch) correlates active requests with verified providers; Process 4.0 (Booking State Machine) and Process 5.0 (Payment Verification) manipulate Datastore D3 (Bookings & Payments); Process 6.0 manages bi-directional WebSocket messaging streams; and Process 7.0 manages Dispute and Review arbitration.")

    add_heading2(doc, "7.5 Algorithm / Flowchart")
    add_p(doc, "To guarantee deterministic reliability, algorithmic transparency, and flawless execution, Neighbourly specifies formal algorithmic formulations for its core intelligence and state enforcement engines. Figure 3.6 presents the detailed flowcharts for both the AI Natural Language Request Extraction subsystem and the Booking State Machine.")

    add_figure_image(doc, 'documentation/report_assets/fig3_6_algorithm_flowcharts.png', 
                     "Figure 3.6: Algorithmic Flowcharts: AI Request Extraction and Booking State Machine")

    add_heading3(doc, "7.5.1 Algorithm 1: AI Natural Language Service Extraction & Heuristic Fallback")
    add_p(doc, "Algorithm 1 outlines the resilient, dual-tier natural language extraction pipeline that translates unstructured user prompts into validated booking entities.")

    add_code_box(doc, r"""ALGORITHM 1: Resilient Natural Language Request Extraction
INPUT: User Prompt String P, Default Locality L_def
OUTPUT: Validated Structured Service Request Object S

1.  PROCEDURE ExtractServiceRequest(P, L_def):
2.      IF P is NULL or P.trim().length == 0 THEN
3.          THROW ValidationError("Service description cannot be empty")
4.      END IF
5.      
6.      // Tier 1: Cloud LLM API Attempt
7.      IF Environment.AI_API_KEY is configured THEN
8.          TRY
9.              Construct JSON Schema Prompt with Categories, Times, and Formats
10.             Payload := { prompt: P, defaultNeighborhood: L_def, temperature: 0.2 }
11.             Response := HTTP_POST(Gemini_Flash_URL, Payload, Timeout = 5000ms)
12.             IF Response.status == 200 AND Response.body.text is valid THEN
13.                 ParsedJSON := JSON.parse(Response.body.text)
14.                 S := ZodSchema.validate(ParsedJSON)
15.                 S.source := "llm_gemini"
16.                 S.confidence := 0.95
17.                 RETURN S
18.             END IF
19.         CATCH Exception E
20.             Logger.warn("Cloud LLM extraction failed: " + E.message + ". Triggering Fallback.")
21.         END TRY
22.     END IF
23.     
24.     // Tier 2: Resilient Heuristic NLP Rule-Based Fallback
25.     RETURN HeuristicExtraction(P, L_def)
26.     
27. 28. PROCEDURE HeuristicExtraction(P, L_def):
29.     P_lower := P.toLowerCase()
30.     Category := "General Service", SuggestedSkills := []
31.     
32.     // Keyword Dictionary Matching
33.     FOR EACH CatRecord IN CategoryTaxonomy DO
34.         FOR EACH Keyword IN CatRecord.keywords DO
35.             IF P_lower CONTAINS Keyword THEN
36.                 Category := CatRecord.name
37.                 SuggestedSkills := CatRecord.skills
38.                 BREAK INNER
39.             END IF
40.         END FOR
41.     END FOR
42.     
43.     // Budget Regex Extraction: e.g., "budget 600", "₹500", "rs 800"
44.     Budget := 500 // Default baseline
45.     MatchBudget := REGEX_EXEC(/(?:budget|cost|price|rs\.?|inr|₹)\s*[:=]?\s*(\d{2,5})/i, P_lower)
46.     IF MatchBudget is NOT NULL THEN
47.         Budget := ParseInteger(MatchBudget[1])
48.     END IF
49.     
50.     // Time Slot Extraction: Morning / Afternoon / Evening
51.     Slot := "Morning"
52.     IF P_lower MATCHES /evening|night|after 5/ THEN Slot := "Evening"
53.     ELSE IF P_lower MATCHES /afternoon|post lunch|noon/ THEN Slot := "Afternoon"
54.     ELSE IF P_lower MATCHES /morning|am|early/ THEN Slot := "Morning"
55.     END IF
56.     
57.     // Schedule Date Extraction: Tomorrow / Day after
58.     TargetDate := CurrentDate() + 1 Day // Default tomorrow
59.     IF P_lower MATCHES /today|urgent|emergency|now/ THEN TargetDate := CurrentDate()
60.     ELSE IF P_lower MATCHES /day after|overmorrow/ THEN TargetDate := CurrentDate() + 2 Days
61.     END IF
62.     
63.     S := {
64.         category: Category,
65.         title: Category + " Service Request",
66.         description: P.trim(),
67.         preferredDate: FormatDate(TargetDate),
68.         preferredTime: Slot,
69.         budget: Max(Budget, 50),
70.         neighborhood: L_def,
71.         suggestedSkills: SuggestedSkills,
72.         source: "heuristic_nlp",
73.         confidence: 0.88
74.     }
75.     RETURN S
76. END PROCEDURE""")

    add_heading3(doc, "7.5.2 Algorithm 2: Hybrid Multi-Factor Provider Matching Algorithm")
    add_p(doc, "Algorithm 2 details the multi-factor scoring algorithm that balances deterministic qualification filtering with mathematical objective ranking to connect residents with optimal local service providers.")

    add_p(doc, "Mathematical Formulation:")
    add_p(doc, "Let P be the candidate provider profile and R be the resident service request. The composite match score S(P, R) is formulated as a weighted linear combination across five normalized criteria:")
    add_p(doc, "S(P, R) = W_v * V(P) + W_d * D(P, R) + W_r * R(P) + W_c * C(P) + W_p * P(P, R)", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_p(doc, "Where the weighting parameters satisfy the constraint: W_v + W_d + W_r + W_c + W_p = 100 points, as defined in Table 3.5.")

    w_headers = ["Parameter Symbol", "Evaluation Dimension", "Maximum Weight", "Scoring Criteria & Bounds"]
    w_data = [
        ["V(P)", "Identity Verification Status", "25 Points", "VERIFIED = 25 pts, IN_REVIEW = 15 pts, PENDING = 10 pts"],
        ["D(P, R)", "Locality Proximity & Radius", "25 Points", "Direct Locality Match = 25 pts, Within Radius = 12 pts"],
        ["R(P)", "Customer Review Star Rating", "20 Points", "(Average Rating / 5.0) * 20 pts; Unrated Baseline = 14 pts"],
        ["C(P)", "Completed Job Volume & Track Record", "15 Points", "> 10 Jobs = 15 pts, 1-10 Jobs = 10 pts, New Provider = 8 pts"],
        ["P(P, R)", "Pricing Compatibility vs Budget", "15 Points", "Hourly Rate <= Budget Ceiling = 15 pts, Above Budget = 8 pts"],
    ]
    add_table_styled(doc, w_headers, w_data, col_widths=[1.2, 2.0, 1.3, 2.0])

    add_code_box(doc, """ALGORITHM 2: Hybrid Multi-Factor Provider Matching
INPUT: ServiceRequest R { category, neighborhood, budget, preferredTime }
OUTPUT: Ranked List of Top Providers with Explanations

1.  PROCEDURE MatchProviders(R):
2.      // Phase 1: Hard Filtering via MongoDB Query
3.      Candidates := Database.ProviderProfiles.find({
4.          services: CategoryDoc._id,
5.          "availability.isAcceptingRequests": true
6.      }).populate('user')
7.      
8.      IF Candidates.length < 3 THEN
9.          // Broaden filter to providers in vicinity with active status
10.         Candidates := Database.ProviderProfiles.find({
11.             "availability.isAcceptingRequests": true
12.         }).populate('user')
13.     END IF
14.     
15.     ScoredList := []
16.     
17.     // Phase 2: Multi-Factor Scoring
18.     FOR EACH Provider P IN Candidates DO
19.         Score := 0
20.         Reasons := []
21.         
22.         // 1. Verification (25 pts)
23.         IF P.verificationStatus == 'VERIFIED' THEN
24.             Score += 25
25.             Reasons.append("Verified Neighbourly Provider")
26.         ELSE IF P.verificationStatus == 'IN_REVIEW' THEN
27.             Score += 15
28.         ELSE Score += 10 END IF
29.         
30.         // 2. Proximity (25 pts)
31.         IF P.neighborhood.toLowerCase() == R.neighborhood.toLowerCase() THEN
32.             Score += 25
33.             Reasons.append("Operates locally in " + P.neighborhood)
34.         ELSE
35.             Score += 12
36.             Reasons.append("Servicing areas within " + P.serviceRadiusKm + "km radius")
37.         END IF
38.         
39.         // 3. Rating & Quality (20 pts)
40.         IF P.reviewCount > 0 THEN
41.             Score += (P.rating / 5.0) * 20
42.             Reasons.append(P.rating + "★ rating from " + P.reviewCount + " neighbor reviews")
43.         ELSE
44.             Score += 14
45.             Reasons.append("New active neighborhood partner")
46.         END IF
47.         
48.         // 4. Experience & Completions (15 pts)
49.         IF P.completedBookings > 10 THEN
50.             Score += 15
51.             Reasons.append(P.completedBookings + " completed neighborhood jobs")
52.         ELSE IF P.completedBookings > 0 THEN
53.             Score += 10
54.         ELSE Score += 8 END IF
55.         
56.         // 5. Price Compatibility (15 pts)
57.         HourlyRate := P.pricing.hourlyRate
58.         IF R.budget >= HourlyRate THEN
59.             Score += 15
60.             Reasons.append("Budget-friendly at ₹" + HourlyRate + "/hr (fits ₹" + R.budget + " budget)")
61.         ELSE
62.             Score += 8
63.             Reasons.append("Standard rate of ₹" + HourlyRate + "/hr")
64.         END IF
65.         
66.         FinalScore := Min(99, Round(Score))
67.         Badge := "Recommended"
68.         IF FinalScore >= 85 THEN Badge := "Top Match"
69.         ELSE IF FinalScore >= 70 THEN Badge := "Great Fit" END IF
70.         
71.         ScoredList.append({
72.             provider: P,
73.             matchScore: FinalScore,
74.             matchBadge: Badge,
75.             explanation: Reasons.join(" • ")
76.         })
77.     END FOR
78.     
79.     // Sort descending by match score
80.     SORT ScoredList BY matchScore DESCENDING
81.     RETURN ScoredList.slice(0, 8)
82. END PROCEDURE""")

    add_heading3(doc, "7.5.3 Algorithm 3: Deterministic State Machine Transition Guard")
    add_p(doc, "To prevent client-side status tampering, unauthorized cancellations, or fraudulent order skips, booking state mutations are strictly validated on the server via Algorithm 3, adhering to the transition matrix defined in Table 3.4.")

    st_headers = ["Current State", "Permissible Next States", "Triggering Actor", "Operational Business Event"]
    st_data = [
        ["PENDING", "ACCEPTED, REJECTED, CANCELLED", "Provider / Resident", "Provider accepts/rejects bid or resident revokes"],
        ["ACCEPTED", "PAYMENT_PENDING, PAID, CANCELLED", "Resident / System", "Resident initiates checkout or executes payment"],
        ["PAYMENT_PENDING", "PAID, CANCELLED", "Payment Gateway / Resident", "Razorpay HMAC signature verified or user cancels"],
        ["PAID", "IN_PROGRESS, CANCELLED, DISPUTED", "Provider / Resident", "Provider arrives and commences work on-site"],
        ["IN_PROGRESS", "COMPLETED, DISPUTED", "Provider / Resident", "Work completed or issue raised during job execution"],
        ["COMPLETED", "DISPUTED", "Resident", "Resident contests unsatisfactory service within grace window"],
        ["DISPUTED", "COMPLETED, CANCELLED", "Platform Admin", "Admin arbitrates dispute (releases payout or refund)"],
        ["REJECTED / CANCELLED", "None (Terminal States)", "None", "Finalized immutable terminal states"],
    ]
    add_table_styled(doc, st_headers, st_data, col_widths=[1.5, 2.0, 1.4, 1.6])

    doc.add_page_break()

print("Part 2 built successfully.")
