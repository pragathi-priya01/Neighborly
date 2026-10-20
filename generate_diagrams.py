import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle

os.makedirs('documentation/report_assets', exist_ok=True)
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'

def create_system_architecture():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # Background Box
    rect_main = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=1,rounding_size=2",
                               linewidth=1.5, edgecolor='#2c3e50', facecolor='#f8fafc')
    ax.add_patch(rect_main)
    
    ax.text(50, 94.5, "Neighbourly Platform - Multi-Tier System Architecture", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1e293b')
    
    # Tier 1: Client Tier
    t1 = FancyBboxPatch((5, 68), 90, 22, boxstyle="round,pad=0.8,rounding_size=1.5",
                        linewidth=1.2, edgecolor='#3b82f6', facecolor='#eff6ff')
    ax.add_patch(t1)
    ax.text(8, 86.5, "PRESENTATION TIER (Single Page Application - React 18 + Vite)", 
            ha='left', va='center', fontsize=11, fontweight='bold', color='#1d4ed8')
    
    c_boxes = [
        ("Resident Portal", "Request wizard, AI NLP Input,\nProvider search, Tracking, Reviews", 7, 70, 20, 14),
        ("Provider Portal", "Offer submission, Active jobs,\nProfile & Skills, Real-time Alerts", 29, 70, 20, 14),
        ("Admin Dashboard", "Verification queue, Analytics,\nDispute resolution, Catalogs", 51, 70, 20, 14),
        ("Client Core", "Tailwind CSS, Lucide Icons,\nSocket.IO Client, Axios & Zustand", 73, 70, 20, 14),
    ]
    for title, desc, x, y, w, h in c_boxes:
        b = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1",
                           linewidth=1, edgecolor='#60a5fa', facecolor='#ffffff')
        ax.add_patch(b)
        ax.text(x + w/2, y + h - 3, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1e3a8a')
        ax.text(x + w/2, y + 4.5, desc, ha='center', va='center', fontsize=7.5, color='#475569')

    # Arrow 1 <-> 2
    ax.annotate('', xy=(50, 60), xytext=(50, 68),
                arrowprops=dict(arrowstyle="<->", lw=2, color='#0284c7'))
    ax.text(50, 64, "HTTPS / REST JSON & WSS WebSocket", ha='center', va='center', 
            fontsize=8.5, fontweight='bold', color='#0369a1', backgroundcolor='#ffffff')

    # Tier 2: Server Tier
    t2 = FancyBboxPatch((5, 30), 90, 28, boxstyle="round,pad=0.8,rounding_size=1.5",
                        linewidth=1.2, edgecolor='#10b981', facecolor='#f0fdf4')
    ax.add_patch(t2)
    ax.text(8, 54.5, "APPLICATION LOGIC & API SERVICES TIER (Node.js & Express REST API)", 
            ha='left', va='center', fontsize=11, fontweight='bold', color='#047857')

    s_boxes = [
        ("API Gateway / Middleware", "Helmet, Rate Limiter,\nCORS, JWT & RBAC Auth,\nCentralized Error Handler", 7, 33, 17, 18),
        ("Core Business Services", "Booking State Machine,\nProvider Matching Algorithm,\nDispute & Offer Management", 26, 33, 21, 18),
        ("AI NLP Engine", "Gemini 1.5/3.5 Flash API,\nDeterministic Heuristic Parser,\nZod Schema Validation", 49, 33, 21, 18),
        ("Real-time & Payments", "Socket.IO Event Server,\nRazorpay Orders & Webhook,\nHMAC SHA-256 Signatures", 72, 33, 21, 18),
    ]
    for title, desc, x, y, w, h in s_boxes:
        b = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1",
                           linewidth=1, edgecolor='#34d399', facecolor='#ffffff')
        ax.add_patch(b)
        ax.text(x + w/2, y + h - 3, title, ha='center', va='center', fontsize=9, fontweight='bold', color='#065f46')
        ax.text(x + w/2, y + 6.5, desc, ha='center', va='center', fontsize=7.5, color='#475569')

    # Arrow 2 <-> 3
    ax.annotate('', xy=(50, 22), xytext=(50, 30),
                arrowprops=dict(arrowstyle="<->", lw=2, color='#059669'))
    ax.text(50, 26, "Mongoose ODM (TCP/TLS Connection Pool)", ha='center', va='center', 
            fontsize=8.5, fontweight='bold', color='#047857', backgroundcolor='#ffffff')

    # Tier 3: Data & External Tier
    t3 = FancyBboxPatch((5, 5), 90, 16, boxstyle="round,pad=0.8,rounding_size=1.5",
                        linewidth=1.2, edgecolor='#8b5cf6', facecolor='#faf5ff')
    ax.add_patch(t3)
    ax.text(8, 18.5, "DATA PERSISTENCE & EXTERNAL SERVICES TIER", 
            ha='left', va='center', fontsize=11, fontweight='bold', color='#6d28d9')

    d_boxes = [
        ("MongoDB Atlas Database", "Users, Providers, Services, Requests,\nOffers, Bookings, Payments, Reviews", 7, 7, 30, 9.5),
        ("External AI Service", "Google Generative AI\n(Gemini 1.5/3.5 Flash)", 40, 7, 24, 9.5),
        ("External Payment Gateway", "Razorpay Payment Gateway\n(Test Mode API & Webhooks)", 67, 7, 26, 9.5),
    ]
    for title, desc, x, y, w, h in d_boxes:
        b = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1",
                           linewidth=1, edgecolor='#c084fc', facecolor='#ffffff')
        ax.add_patch(b)
        ax.text(x + w/2, y + h - 2.8, title, ha='center', va='center', fontsize=9, fontweight='bold', color='#5b21b6')
        ax.text(x + w/2, y + 2.5, desc, ha='center', va='center', fontsize=7.5, color='#475569')

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_1_system_architecture.png', bbox_inches='tight')
    plt.close()

def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # System Boundary Box
    rect = FancyBboxPatch((24, 4), 52, 92, boxstyle="round,pad=1,rounding_size=1.5",
                          linewidth=1.8, edgecolor='#0f172a', facecolor='#f8fafc')
    ax.add_patch(rect)
    ax.text(50, 93, "System Boundary: Neighbourly Platform", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#0f172a')

    # Actors Left: Resident & Provider
    # Resident Actor
    ax.plot([8, 8], [80, 84], color='#1e293b', lw=2)  # spine
    ax.plot([5, 11], [82, 82], color='#1e293b', lw=2) # arms
    ax.plot([8, 5], [80, 76], color='#1e293b', lw=2)  # leg 1
    ax.plot([8, 11], [80, 76], color='#1e293b', lw=2) # leg 2
    c = plt.Circle((8, 86), 2, color='#1e293b', fill=False, lw=2)
    ax.add_patch(c)
    ax.text(8, 73, "Resident\n(Citizen)", ha='center', va='top', fontsize=9.5, fontweight='bold', color='#1e293b')

    # Provider Actor
    ax.plot([8, 8], [40, 44], color='#1e293b', lw=2)  # spine
    ax.plot([5, 11], [42, 42], color='#1e293b', lw=2) # arms
    ax.plot([8, 5], [40, 36], color='#1e293b', lw=2)  # leg 1
    ax.plot([8, 11], [40, 36], color='#1e293b', lw=2) # leg 2
    c = plt.Circle((8, 46), 2, color='#1e293b', fill=False, lw=2)
    ax.add_patch(c)
    ax.text(8, 33, "Service Provider\n(Electrician/Plumber)", ha='center', va='top', fontsize=9.5, fontweight='bold', color='#1e293b')

    # Actors Right: Admin, Razorpay, Gemini AI
    # Admin Actor
    ax.plot([90, 90], [80, 84], color='#1e293b', lw=2)  # spine
    ax.plot([87, 93], [82, 82], color='#1e293b', lw=2) # arms
    ax.plot([90, 87], [80, 76], color='#1e293b', lw=2)  # leg 1
    ax.plot([90, 93], [80, 76], color='#1e293b', lw=2) # leg 2
    c = plt.Circle((90, 86), 2, color='#1e293b', fill=False, lw=2)
    ax.add_patch(c)
    ax.text(90, 73, "Platform Admin", ha='center', va='top', fontsize=9.5, fontweight='bold', color='#1e293b')

    # External Gateway Boxes
    b_rzp = FancyBboxPatch((83, 46), 14, 8, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#e11d48', facecolor='#fff1f2')
    ax.add_patch(b_rzp)
    ax.text(90, 50, "<<Actor>>\nRazorpay API", ha='center', va='center', fontsize=8, fontweight='bold', color='#9f1239')

    b_ai = FancyBboxPatch((83, 20), 14, 8, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#7c3aed', facecolor='#f5f3ff')
    ax.add_patch(b_ai)
    ax.text(90, 24, "<<Actor>>\nGemini AI", ha='center', va='center', fontsize=8, fontweight='bold', color='#5b21b6')

    # Use Cases (Ovals)
    use_cases = [
        ("UC1: Register & Authenticate (JWT)", 50, 88, 32, 5, ['res', 'pro', 'adm']),
        ("UC2: Post Natural Language Request", 39, 81, 24, 5, ['res', 'ai']),
        ("UC3: Manual Request Edit & Catalog Booking", 61, 81, 24, 5, ['res']),
        ("UC4: Browse Nearby Verified Providers", 50, 74, 30, 5, ['res']),
        ("UC5: Provider Profile & Document Onboarding", 50, 67, 32, 5, ['pro', 'adm']),
        ("UC6: View Request Feed & Submit Quotes/Offers", 50, 60, 34, 5, ['pro']),
        ("UC7: Accept Offer & Initialize Booking", 50, 53, 30, 5, ['res']),
        ("UC8: Secure Escrow Payment Checkout", 50, 46, 30, 5, ['res', 'rzp']),
        ("UC9: Real-time Socket.IO In-App Chat", 50, 39, 30, 5, ['res', 'pro']),
        ("UC10: Update Booking Status (State Machine)", 50, 32, 33, 5, ['res', 'pro']),
        ("UC11: Submit Verified Review & Rating", 50, 25, 30, 5, ['res']),
        ("UC12: Raise & Resolve Booking Dispute", 50, 18, 30, 5, ['res', 'pro', 'adm']),
        ("UC13: View Analytics & Service Catalog Management", 50, 11, 35, 5, ['adm']),
    ]

    for title, x, y, w, h, actors in use_cases:
        ellipse = patches.Ellipse((x, y), w, h, linewidth=1.2, edgecolor='#0284c7', facecolor='#e0f2fe')
        ax.add_patch(ellipse)
        ax.text(x, y, title, ha='center', va='center', fontsize=8, fontweight='bold', color='#0369a1')

        # Connect to actors
        if 'res' in actors:
            ax.plot([12, x - w/2], [80, y], color='#64748b', lw=0.9, linestyle='--')
        if 'pro' in actors:
            ax.plot([12, x - w/2], [42, y], color='#64748b', lw=0.9, linestyle='--')
        if 'adm' in actors:
            ax.plot([86, x + w/2], [80, y], color='#64748b', lw=0.9, linestyle='--')
        if 'rzp' in actors:
            ax.plot([83, x + w/2], [50, y], color='#e11d48', lw=1, linestyle=':')
        if 'ai' in actors:
            ax.plot([83, x + w/2], [24, y], color='#7c3aed', lw=1, linestyle=':')

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_2_use_case_diagram.png', bbox_inches='tight')
    plt.close()

def create_class_diagram():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 120)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(60, 97, "UML Class Diagram - Neighbourly Domain Models & Associations", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    def draw_class(name, fields, methods, x, y, w, h):
        b = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0", linewidth=1.2, edgecolor='#1e293b', facecolor='#ffffff')
        ax.add_patch(b)
        # Header
        hb = FancyBboxPatch((x, y + h - 4), w, 4, boxstyle="square,pad=0", linewidth=1.2, edgecolor='#1e293b', facecolor='#e2e8f0')
        ax.add_patch(hb)
        ax.text(x + w/2, y + h - 2, name, ha='center', va='center', fontsize=9, fontweight='bold', color='#0f172a')
        # Fields
        fy = y + h - 5.5
        for f in fields:
            ax.text(x + 1, fy, f, ha='left', va='top', fontsize=7, color='#334155')
            fy -= 1.8
        # Divider
        ax.plot([x, x + w], [y + len(methods)*2 + 2, y + len(methods)*2 + 2], color='#94a3b8', lw=0.8)
        # Methods
        my = y + len(methods)*2 + 0.5
        for m in methods:
            ax.text(x + 1, my, m, ha='left', va='top', fontsize=7, color='#0369a1', fontstyle='italic')
            my -= 1.8

    # Classes
    # 1. User
    draw_class("User", 
               ["-_id: ObjectId", "+name: String", "+email: String", "+passwordHash: String", "+role: Enum", "+neighborhood: String", "+accountStatus: String"],
               ["+comparePassword()", "+toJSON()"],
               5, 66, 26, 26)

    # 2. ProviderProfile
    draw_class("ProviderProfile",
               ["-_id: ObjectId", "+user: ObjectId -> User", "+skills: String[]", "+hourlyRate: Number", "+verificationStatus: Enum", "+rating: Number", "+trustScore: Number"],
               ["+recalculateTrustScore()"],
               35, 66, 28, 26)

    # 3. Service
    draw_class("Service",
               ["-_id: ObjectId", "+name: String", "+category: String", "+description: String", "+basePrice: Number"],
               ["+getPopularServices()"],
               67, 66, 22, 26)

    # 4. ServiceRequest
    draw_class("ServiceRequest",
               ["-_id: ObjectId", "+requester: ObjectId", "+category: String", "+budget: Number", "+status: Enum", "+aiAssisted: Boolean"],
               ["+matchProviders()"],
               93, 66, 24, 26)

    # 5. ProviderOffer
    draw_class("ProviderOffer",
               ["-_id: ObjectId", "+request: ObjectId", "+provider: ObjectId", "+price: Number", "+status: Enum"],
               ["+acceptOffer()"],
               93, 20, 24, 25)

    # 6. Booking
    draw_class("Booking",
               ["-_id: ObjectId", "+requester: ObjectId", "+provider: ObjectId", "+amount: Number", "+status: Enum", "+scheduledDate: String", "+payment: ObjectId"],
               ["+canTransitionTo(status)"],
               48, 18, 30, 29)

    # 7. Payment
    draw_class("Payment",
               ["-_id: ObjectId", "+booking: ObjectId", "+razorpayOrderId: String", "+razorpayPaymentId: String", "+amount: Number", "+status: Enum"],
               ["+verifySignature()"],
               10, 20, 28, 25)

    # Draw Relationship Lines
    # User to ProviderProfile (1 to 1)
    ax.plot([31, 35], [79, 79], color='#0f172a', lw=1.5)
    ax.text(32, 80.5, "1", fontsize=8, fontweight='bold')
    ax.text(33.5, 80.5, "1", fontsize=8, fontweight='bold')

    # ProviderProfile to Service (Many to Many)
    ax.plot([63, 67], [79, 79], color='#0f172a', lw=1.5)
    ax.text(64, 80.5, "*", fontsize=9, fontweight='bold')
    ax.text(65.5, 80.5, "*", fontsize=9, fontweight='bold')

    # User to ServiceRequest (1 to Many)
    ax.plot([18, 18, 93], [66, 58, 58], color='#0f172a', lw=1.2, linestyle='--')
    ax.text(19, 64, "1", fontsize=8)
    ax.text(91, 59.5, "*", fontsize=8)

    # ServiceRequest to ProviderOffer (1 to Many)
    ax.plot([105, 105], [66, 45], color='#0f172a', lw=1.5)
    ax.text(106, 64, "1", fontsize=8)
    ax.text(106, 47, "*", fontsize=8)

    # ProviderOffer to Booking (1 to 1)
    ax.plot([93, 78], [32, 32], color='#0f172a', lw=1.5)
    ax.text(91, 33, "1", fontsize=8)
    ax.text(80, 33, "0..1", fontsize=8)

    # Booking to Payment (1 to 1)
    ax.plot([48, 38], [32, 32], color='#0f172a', lw=1.5)
    ax.text(46, 33.5, "1", fontsize=8)
    ax.text(39, 33.5, "1", fontsize=8)

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_3_class_diagram.png', bbox_inches='tight')
    plt.close()

def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97, "UML Sequence Diagram - End-to-End Service Booking & Payment", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#0f172a')

    lifelines = [
        ("Resident", 10),
        ("Neighbourly UI", 28),
        ("Express API", 48),
        ("Gemini AI", 66),
        ("Provider", 82),
        ("Razorpay", 94)
    ]

    for name, x in lifelines:
        b = FancyBboxPatch((x - 6, 90), 12, 4.5, boxstyle="square,pad=0", linewidth=1.2, edgecolor='#1e293b', facecolor='#e2e8f0')
        ax.add_patch(b)
        ax.text(x, 92.2, name, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')
        ax.plot([x, x], [89.5, 8], color='#94a3b8', lw=1, linestyle=':')

    messages = [
        (86, 10, 28, "1. Enters natural prompt ('tap leaking tomorrow')"),
        (81, 28, 48, "2. POST /api/ai/extract-request"),
        (76, 48, 66, "3. Forward prompt + context"),
        (71, 66, 48, "4. Return structured JSON payload"),
        (66, 48, 28, "5. Response: Validated request details"),
        (61, 28, 10, "6. Displays editable confirmation form"),
        (56, 10, 28, "7. Confirms request post"),
        (51, 28, 48, "8. POST /api/requests (Save & Broadcast)"),
        (46, 48, 82, "9. WebSocket broadcast to eligible providers"),
        (41, 82, 48, "10. Provider submits quote (POST /api/offers)"),
        (36, 48, 28, "11. WebSocket push offer to Resident"),
        (31, 10, 48, "12. Resident accepts offer -> Booking created"),
        (26, 48, 94, "13. POST /orders (Amount in paise)"),
        (21, 94, 28, "14. Razorpay checkout modal opens"),
        (16, 28, 48, "15. POST /verify-payment (HMAC signature)"),
        (11, 48, 82, "16. State -> PAID; Notify provider to start"),
    ]

    for y, x1, x2, msg in messages:
        color = '#0284c7' if x1 < x2 else '#059669'
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", lw=1.2, color=color))
        mx = (x1 + x2) / 2
        ax.text(mx, y + 1.2, msg, ha='center', va='bottom', fontsize=7.2, color='#1e293b', backgroundcolor='#ffffff')

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_4_sequence_diagram.png', bbox_inches='tight')
    plt.close()

def create_dfd():
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 10), dpi=300)
    
    # Subplot 1: DFD Level 0 (Context Level)
    ax1.set_xlim(0, 100)
    ax1.set_ylim(0, 100)
    ax1.axis('off')
    ax1.text(50, 94, "Data Flow Diagram - Level 0 (Context Level)", ha='center', va='center', fontsize=12, fontweight='bold')

    # Central Process
    cp = patches.Circle((50, 50), 16, edgecolor='#0284c7', facecolor='#e0f2fe', lw=2)
    ax1.add_patch(cp)
    ax1.text(50, 52, "0.0\nNeighbourly\nHyperlocal\nPlatform", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0369a1')

    # Entities
    entities = [
        ("Resident", 10, 50, 14, 12),
        ("Provider", 90, 50, 14, 12),
        ("Admin", 50, 12, 14, 10),
        ("Razorpay Gateway", 50, 88, 20, 8),
    ]
    for name, x, y, w, h in entities:
        b = FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="square,pad=0", linewidth=1.5, edgecolor='#1e293b', facecolor='#f1f5f9')
        ax1.add_patch(b)
        ax1.text(x, y, name, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    # Flows
    ax1.annotate('Service requests, payments', xy=(34, 53), xytext=(17, 53), arrowprops=dict(arrowstyle="->", lw=1.2, color='#0284c7'))
    ax1.annotate('Quotes, booking status', xy=(17, 47), xytext=(34, 47), arrowprops=dict(arrowstyle="->", lw=1.2, color='#059669'))
    ax1.annotate('Offers, service completion', xy=(66, 53), xytext=(83, 53), arrowprops=dict(arrowstyle="->", lw=1.2, color='#0284c7'))
    ax1.annotate('Job leads, payouts', xy=(83, 47), xytext=(66, 47), arrowprops=dict(arrowstyle="->", lw=1.2, color='#059669'))
    ax1.annotate('Dispute rulings, verifications', xy=(50, 34), xytext=(50, 17), arrowprops=dict(arrowstyle="->", lw=1.2, color='#7c3aed'))
    ax1.annotate('Order creation & webhook signature', xy=(50, 66), xytext=(50, 84), arrowprops=dict(arrowstyle="<->", lw=1.2, color='#e11d48'))

    # Subplot 2: DFD Level 1
    ax2.set_xlim(0, 100)
    ax2.set_ylim(0, 100)
    ax2.axis('off')
    ax2.text(50, 96, "Data Flow Diagram - Level 1 (Decomposed Processes)", ha='center', va='center', fontsize=12, fontweight='bold')

    p_list = [
        ("1.0\nAuth & RBAC", 15, 75),
        ("2.0\nAI Request\nParser", 40, 75),
        ("3.0\nOffer Matching\n& Dispatch", 65, 75),
        ("4.0\nBooking State\nMachine", 85, 75),
        ("5.0\nRazorpay\nPayment Verification", 30, 28),
        ("6.0\nReal-time Chat &\nNotifications", 60, 28),
        ("7.0\nDispute & Review\nManagement", 85, 28),
    ]
    for title, x, y in p_list:
        c = patches.Circle((x, y), 8, edgecolor='#059669', facecolor='#ecfdf5', lw=1.5)
        ax2.add_patch(c)
        ax2.text(x, y, title, ha='center', va='center', fontsize=7.2, fontweight='bold', color='#065f46')

    # Data Stores
    stores = [
        ("D1: Users & Profiles", 15, 52),
        ("D2: Requests & Offers", 50, 52),
        ("D3: Bookings & Payments", 85, 52),
    ]
    for title, x, y in stores:
        b = FancyBboxPatch((x - 12, y - 3), 24, 6, boxstyle="square,pad=0", linewidth=1, edgecolor='#475569', facecolor='#ffffff')
        ax2.add_patch(b)
        ax2.text(x, y, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#334155')

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_5_dfd_level0_level1.png', bbox_inches='tight')
    plt.close()

def create_flowcharts():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 8), dpi=300)
    
    # Left Flowchart: AI Request Extraction & Fallback
    ax1.set_xlim(0, 100)
    ax1.set_ylim(0, 100)
    ax1.axis('off')
    ax1.text(50, 97, "Flowchart: Natural Language Request Extraction", ha='center', va='center', fontsize=10.5, fontweight='bold')

    def draw_box(ax, x, y, w, h, text, bg='#e0f2fe', edge='#0284c7'):
        b = FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.3", linewidth=1.2, edgecolor=edge, facecolor=bg)
        ax.add_patch(b)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#0f172a')

    def draw_diamond(ax, x, y, w, h, text, bg='#fef3c7', edge='#d97706'):
        diamond = patches.Polygon([[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]],
                                  closed=True, linewidth=1.2, edgecolor=edge, facecolor=bg)
        ax.add_patch(diamond)
        ax.text(x, y, text, ha='center', va='center', fontsize=7, fontweight='bold', color='#78350f')

    draw_box(ax1, 50, 90, 40, 6, "Start: User Inputs Free-Text Description")
    ax1.annotate('', xy=(50, 81), xytext=(50, 87), arrowprops=dict(arrowstyle="->", lw=1.2))
    
    draw_diamond(ax1, 50, 75, 42, 12, "Is AI_API_KEY\nConfigured & Online?")
    ax1.annotate('Yes', xy=(50, 63), xytext=(50, 69), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax1.annotate('No / Error', xy=(80, 50), xytext=(71, 75), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_box(ax1, 50, 58, 40, 8, "Invoke Gemini 1.5/3.5 Flash API\n(Structured JSON prompt)")
    ax1.annotate('', xy=(50, 48), xytext=(50, 54), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_diamond(ax1, 50, 42, 38, 12, "LLM Response\nValid JSON?")
    ax1.annotate('Yes', xy=(50, 30), xytext=(50, 36), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax1.annotate('Fail', xy=(75, 42), xytext=(69, 42), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_box(ax1, 80, 42, 28, 12, "Fallback: Heuristic NLP\nRegex Keyword Scoring\nCategory, Budget & Time", bg='#fee2e2', edge='#ef4444')
    ax1.annotate('', xy=(65, 26), xytext=(80, 36), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_box(ax1, 50, 26, 44, 7, "Validate Schema via Zod (Bounds & Defaults)")
    ax1.annotate('', xy=(50, 17), xytext=(50, 22.5), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_box(ax1, 50, 13, 44, 7, "Render Pre-Filled Editable Form to Resident", bg='#dcfce7', edge='#16a34a')
    ax1.annotate('', xy=(50, 5), xytext=(50, 9.5), arrowprops=dict(arrowstyle="->", lw=1.2))

    draw_box(ax1, 50, 2.5, 30, 4.5, "End: Persist ServiceRequest")

    # Right Flowchart: Booking State Machine Transitions
    ax2.set_xlim(0, 100)
    ax2.set_ylim(0, 100)
    ax2.axis('off')
    ax2.text(50, 97, "Flowchart: Booking State Machine Transitions", ha='center', va='center', fontsize=10.5, fontweight='bold')

    states = [
        ("PENDING", 50, 88, '#f1f5f9', '#475569'),
        ("ACCEPTED", 50, 75, '#e0f2fe', '#0284c7'),
        ("PAYMENT_PENDING", 50, 62, '#fef3c7', '#d97706'),
        ("PAID", 50, 49, '#dcfce7', '#16a34a'),
        ("IN_PROGRESS", 50, 36, '#e0e7ff', '#4f46e5'),
        ("COMPLETED", 50, 23, '#ecfdf5', '#059669'),
    ]
    for s_name, x, y, bg, border in states:
        draw_box(ax2, x, y, 32, 6.5, s_name, bg=bg, edge=border)

    ax2.annotate('Provider Accepts', xy=(50, 78.5), xytext=(50, 84.5), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax2.annotate('Order Generated', xy=(50, 65.5), xytext=(50, 71.5), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax2.annotate('HMAC Signature OK', xy=(50, 52.5), xytext=(50, 58.5), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax2.annotate('Provider Arrives', xy=(50, 39.5), xytext=(50, 45.5), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax2.annotate('Job Finished', xy=(50, 26.5), xytext=(50, 32.5), arrowprops=dict(arrowstyle="->", lw=1.2))

    # Reject / Cancel State
    draw_box(ax2, 14, 75, 22, 6, "REJECTED", bg='#fee2e2', edge='#ef4444')
    ax2.annotate('Provider Declines', xy=(25, 75), xytext=(34, 88), arrowprops=dict(arrowstyle="->", lw=1, color='#ef4444'))

    draw_box(ax2, 14, 55, 22, 6, "CANCELLED", bg='#fee2e2', edge='#ef4444')
    ax2.annotate('Cancel', xy=(25, 55), xytext=(34, 62), arrowprops=dict(arrowstyle="->", lw=1, color='#ef4444'))

    # Dispute State
    draw_box(ax2, 86, 30, 22, 6, "DISPUTED", bg='#fce7f3', edge='#db2777')
    ax2.annotate('Raise Issue', xy=(75, 30), xytext=(66, 36), arrowprops=dict(arrowstyle="->", lw=1, color='#db2777'))
    ax2.annotate('Admin Resolves', xy=(66, 23), xytext=(75, 30), arrowprops=dict(arrowstyle="->", lw=1, color='#059669'))

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig3_6_algorithm_flowcharts.png', bbox_inches='tight')
    plt.close()

def create_ui_screenshots_composite():
    fig, axes = plt.subplots(2, 2, figsize=(12, 9), dpi=300)
    
    # Screen 1: Resident AI Request Wizard
    ax = axes[0, 0]
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    b = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#cbd5e1', facecolor='#ffffff')
    ax.add_patch(b)
    # Header
    hb = FancyBboxPatch((2, 86), 96, 12, boxstyle="square,pad=0", linewidth=0, facecolor='#1e293b')
    ax.add_patch(hb)
    ax.text(6, 92, "Neighbourly  |  Resident Service Assistant", color='#ffffff', fontsize=9, fontweight='bold')
    
    # AI Input Box
    ib = FancyBboxPatch((6, 62), 88, 20, boxstyle="round,pad=0.5", linewidth=1, edgecolor='#93c5fd', facecolor='#eff6ff')
    ax.add_patch(ib)
    ax.text(8, 77, "✨ AI Request Assistant: Describe your home service problem in plain words", fontsize=7.5, fontweight='bold', color='#1d4ed8')
    ax.text(8, 68, "\"My bathroom shower tap is leaking continuously. Need a plumber tomorrow morning,\nbudget around ₹500.\"", fontsize=7, color='#334155', fontstyle='italic')
    
    # Extracted Card
    eb = FancyBboxPatch((6, 12), 88, 46, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#86efac', facecolor='#f0fdf4')
    ax.add_patch(eb)
    ax.text(8, 52, "✓ Extracted Parameters (Editable)", fontsize=8, fontweight='bold', color='#15803d')
    ax.text(8, 44, "Category: Plumbing", fontsize=7.5, color='#1e293b')
    ax.text(8, 38, "Locality: Indiranagar, Sector 4", fontsize=7.5, color='#1e293b')
    ax.text(8, 32, "Preferred Slot: Tomorrow | Morning (9 AM - 12 PM)", fontsize=7.5, color='#1e293b')
    ax.text(8, 26, "Estimated Budget: ₹500", fontsize=7.5, color='#1e293b')
    ax.text(8, 20, "Suggested Skills: Pipe Repair, Tap Replacement, Leak Fixing", fontsize=7.5, color='#1e293b')
    # Button
    bb = FancyBboxPatch((60, 15), 30, 8, boxstyle="round,pad=0.3", linewidth=0, facecolor='#2563eb')
    ax.add_patch(bb)
    ax.text(75, 19, "Confirm & Post Request", ha='center', va='center', fontsize=7, fontweight='bold', color='#ffffff')
    ax.text(50, 5, "(a) AI Natural Language Request Wizard", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    # Screen 2: Provider Marketplace & Offers
    ax = axes[0, 1]
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    b = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#cbd5e1', facecolor='#ffffff')
    ax.add_patch(b)
    hb = FancyBboxPatch((2, 86), 96, 12, boxstyle="square,pad=0", linewidth=0, facecolor='#1e293b')
    ax.add_patch(hb)
    ax.text(6, 92, "Neighbourly  |  Nearby Verified Providers", color='#ffffff', fontsize=9, fontweight='bold')
    
    cards = [
        ("Ramesh Kumar (Master Plumber)", "⭐ 4.9 (48 reviews) • VERIFIED • Indiranagar", "₹450/hr • 12 mins away • 99% Completion Rate", 54, '#059669'),
        ("Suresh Electricals & Home Services", "⭐ 4.8 (32 reviews) • VERIFIED • Domlur", "₹500/hr • 18 mins away • 97% Completion Rate", 24, '#0284c7'),
    ]
    for title, sub, cost, y, color in cards:
        cb = FancyBboxPatch((6, y), 88, 26, boxstyle="round,pad=0.5", linewidth=1, edgecolor='#e2e8f0', facecolor='#f8fafc')
        ax.add_patch(cb)
        ax.text(8, y + 20, title, fontsize=8, fontweight='bold', color='#0f172a')
        ax.text(8, y + 13, sub, fontsize=7, color='#475569')
        ax.text(8, y + 6, cost, fontsize=7, color='#0f172a')
        tb = FancyBboxPatch((72, y + 7), 18, 7, boxstyle="round,pad=0.2", linewidth=0, facecolor=color)
        ax.add_patch(tb)
        ax.text(81, y + 10.5, "Book Now", ha='center', va='center', fontsize=7, fontweight='bold', color='#ffffff')
    ax.text(50, 5, "(b) Verified Hyperlocal Provider Marketplace", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    # Screen 3: Razorpay Escrow Payment Checkout
    ax = axes[1, 0]
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    b = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#cbd5e1', facecolor='#ffffff')
    ax.add_patch(b)
    hb = FancyBboxPatch((2, 86), 96, 12, boxstyle="square,pad=0", linewidth=0, facecolor='#1e293b')
    ax.add_patch(hb)
    ax.text(6, 92, "Neighbourly  |  Booking & Razorpay Checkout", color='#ffffff', fontsize=9, fontweight='bold')

    pb = FancyBboxPatch((15, 20), 70, 60, boxstyle="round,pad=0.5", linewidth=1.5, edgecolor='#3b82f6', facecolor='#f8fafc')
    ax.add_patch(pb)
    ax.text(50, 72, "Razorpay Secure Escrow Checkout [TEST MODE]", ha='center', va='center', fontsize=8, fontweight='bold', color='#1d4ed8')
    ax.text(20, 62, "Order ID: order_test_88192348", fontsize=7, color='#475569')
    ax.text(20, 55, "Service: Kitchen Plumbing & Tap Repair", fontsize=7, color='#1e293b')
    ax.text(20, 48, "Provider: Ramesh Kumar", fontsize=7, color='#1e293b')
    ax.text(20, 41, "Amount Payable: ₹450.00", fontsize=8, fontweight='bold', color='#059669')
    
    pay_btn = FancyBboxPatch((25, 26), 50, 10, boxstyle="round,pad=0.3", linewidth=0, facecolor='#10b981')
    ax.add_patch(pay_btn)
    ax.text(50, 31, "Pay ₹450 via UPI / Card (Simulated)", ha='center', va='center', fontsize=8, fontweight='bold', color='#ffffff')
    ax.text(50, 5, "(c) Test-Mode Razorpay Secure Payment Portal", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    # Screen 4: Admin Control Center & Analytics
    ax = axes[1, 1]
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    b = FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=0.5", linewidth=1.2, edgecolor='#cbd5e1', facecolor='#ffffff')
    ax.add_patch(b)
    hb = FancyBboxPatch((2, 86), 96, 12, boxstyle="square,pad=0", linewidth=0, facecolor='#1e293b')
    ax.add_patch(hb)
    ax.text(6, 92, "Neighbourly  |  Admin Operations & Analytics", color='#ffffff', fontsize=9, fontweight='bold')

    m_cards = [
        ("Total Residents", "1,248", 6, 60, 26, 20, '#3b82f6'),
        ("Active Providers", "184", 36, 60, 26, 20, '#10b981'),
        ("Total Bookings", "3,412", 66, 60, 26, 20, '#8b5cf6'),
    ]
    for title, val, x, y, w, h, color in m_cards:
        mb = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5", linewidth=1, edgecolor='#cbd5e1', facecolor='#ffffff')
        ax.add_patch(mb)
        ax.text(x + w/2, y + 14, title, ha='center', va='center', fontsize=7, color='#64748b')
        ax.text(x + w/2, y + 6, val, ha='center', va='center', fontsize=12, fontweight='bold', color=color)

    # Verification Queue Snippet
    vb = FancyBboxPatch((6, 15), 88, 38, boxstyle="round,pad=0.5", linewidth=1, edgecolor='#cbd5e1', facecolor='#ffffff')
    ax.add_patch(vb)
    ax.text(10, 46, "Provider Verification Queue (3 Pending)", fontsize=7.5, fontweight='bold', color='#0f172a')
    ax.text(10, 36, "• Rajesh S. (Carpentry) - Govt ID & Trade Certificate Uploaded  [Approve] [Reject]", fontsize=6.8, color='#334155')
    ax.text(10, 28, "• Priya Nair (Home Tutoring) - Degree Certificate Uploaded     [Approve] [Reject]", fontsize=6.8, color='#334155')
    ax.text(10, 20, "• Anil Kumar (Electrician) - Wireman License Uploaded          [Approve] [Reject]", fontsize=6.8, color='#334155')

    ax.text(50, 5, "(d) Admin Control Center & Verification Portal", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    plt.tight_layout()
    plt.savefig('documentation/report_assets/fig5_1_screenshots_outputs.png', bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    create_system_architecture()
    create_use_case_diagram()
    create_class_diagram()
    create_sequence_diagram()
    create_dfd()
    create_flowcharts()
    create_ui_screenshots_composite()
    print("All 7 architectural diagrams and composite screenshots successfully generated.")
