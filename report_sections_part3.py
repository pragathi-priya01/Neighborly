import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from report_builder_base import (
    add_p, add_heading1, add_heading2, add_heading3, 
    add_bullet, add_table_styled, add_figure_image
)
from report_helpers import add_code_box, add_callout_box

def build_chapter_4(doc):
    # ---------------- CHAPTER 4 - IMPLEMENTATION ----------------
    add_heading1(doc, "CHAPTER 4 – IMPLEMENTATION")

    add_heading2(doc, "8.1 Implementation Details")
    add_p(doc, "The implementation phase of Neighbourly translated the conceptual domain models, state machines, and mathematical algorithms into production-ready software artifacts. The development lifecycle adopted modern software engineering paradigms—incorporating modular component-based frontend construction, strict asynchronous non-blocking backend service architecture, centralized exception handling, runtime input validation, and continuous unit testing.")

    add_p(doc, "1. Layered Express Server Architecture: The backend codebase strictly adheres to the Clean Service-Oriented Architecture (SOA) pattern, partitioned into four distinct layers:")
    add_bullet(doc, "Routes Layer", "Declares REST endpoints, associates HTTP verbs (GET, POST, PUT, PATCH, DELETE), and attaches security middleware (rate limiters, JWT verifiers, RBAC role guards).")
    add_bullet(doc, "Controllers Layer", "Extracts HTTP request payloads, validates input data against Zod schemas, delegates business operations to underlying services, and formats standard JSON responses.")
    add_bullet(doc, "Services Layer", "Contains all domain logic, mathematical scoring algorithms, payment gateway interactions, WebSocket event emissions, and database mutations.")
    add_bullet(doc, "Models Layer", "Defines Mongoose ODM schemas, indexes, schema hooks, document helper methods (e.g., password comparisons, state transition validation, trust score recalculation).")

    add_p(doc, "2. Asynchronous Concurrency & Error Handling: All I/O operations—database transactions, external AI HTTP requests, and payment gateway calls—utilize native JavaScript async/await syntax. Unhandled promise rejections are intercepted by an Express Centralized Error Handling Middleware. Custom application errors inherit from an ApiError class encapsulating HTTP status codes and operational error descriptors, preventing technical stack traces from leaking to client responses in production.")

    add_p(doc, "3. Zero-Friction Database Connection Management: The database configuration module establishes persistent Mongoose connection pools to MongoDB Atlas using TLS encryption and auto-reconnect listeners. In non-production environments, if an external cloud database is unreachable, the server automatically boots an in-memory MongoDB replica, allowing immediate development and automated testing without external infrastructure dependencies.")

    add_heading2(doc, "8.2 Module Implementation")
    add_p(doc, "Key software components and production implementations across Neighbourly's core modules are documented below with corresponding code implementations.")

    add_heading3(doc, "8.2.1 Authentication and Role-Based Access Control Implementation")
    add_p(doc, "User authentication utilizes salted password hashing via Bcrypt (10 salt rounds) and stateless JSON Web Tokens (JWT). The User schema guarantees unique email indexes and sanitizes password hashes prior to JSON serialization. Role-based authorization middleware intercepts protected routes, verifying the user's role against permitted claims.")

    add_code_box(doc, """// Source: server/src/models/User.js & server/src/middleware/authMiddleware.js
// 1. Password Comparison Method on User Schema
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// 2. Role-Based Access Control (RBAC) Guard Middleware
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Forbidden: Role '${req.user?.role || 'Guest'}' lacks access privileges`
      );
    }
    next();
  };
};""")

    add_heading3(doc, "8.2.2 Provider Trust Score Recalculation Implementation")
    add_p(doc, "To maintain absolute trust transparency across the neighborhood marketplace, provider profiles feature a dynamic Trust Score (0-100) recalculated automatically upon administrative document verification, customer review submission, or job completion.")

    add_code_box(doc, """// Source: server/src/models/ProviderProfile.js
providerProfileSchema.methods.recalculateTrustScore = function () {
  // Trust formula: Base 30 + 35 for VERIFIED + (Rating/5)*20 + min(Jobs*1.5, 15)
  let score = 30;
  if (this.verificationStatus === 'VERIFIED') score += 35;
  if (this.reviewCount > 0) {
    score += (this.rating / 5) * 20;
  } else {
    score += 10; // Baseline for newly registered partners
  }
  score += Math.min(this.completedBookings * 1.5, 15);
  this.trustScore = Math.min(100, Math.round(score));
  return this.trustScore;
};""")

    add_heading3(doc, "8.2.3 AI Natural Language Service Extraction & Heuristic Fallback Implementation")
    add_p(doc, "The AIService implements the dual-tier intelligence pipeline. When a resident inputs a conversational problem statement, the system invokes the Google Gemini API with temperature=0.2 and structured JSON schema enforcement. If third-party API limits or network timeouts occur, the deterministic heuristic extractor seamlessly takes over.")

    add_code_box(doc, """// Source: server/src/services/ai/aiService.js
export class AIService {
  static async extractServiceRequest(promptText, userNeighborhood = 'Indiranagar') {
    if (!promptText || promptText.trim().length === 0) {
      throw new Error('Please enter a description of the service you need.');
    }

    // Tier 1: External Cloud LLM API Call
    if (env.AI_API_KEY) {
      try {
        const result = await this.callLLMForExtraction(promptText, userNeighborhood);
        if (result) return result;
      } catch (llmError) {
        logger.warn({ err: llmError.message }, 'LLM extraction failed, using heuristic fallback');
      }
    }

    // Tier 2: Resilient Heuristic NLP Rule-Based Parser
    return this.heuristicExtraction(promptText, userNeighborhood);
  }
}""")

    add_heading3(doc, "8.2.4 Booking State Machine Transition Enforcement Implementation")
    add_p(doc, "Booking integrity is protected by an explicit transition lookup dictionary and schema-level validation methods, preventing unauthorized state skips.")

    add_code_box(doc, """// Source: server/src/models/Booking.js
export const ALLOWED_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.PAYMENT_PENDING, BOOKING_STATUS.PAID, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.PAYMENT_PENDING]: [BOOKING_STATUS.PAID, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.PAID]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.COMPLETED]: [BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.REJECTED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.DISPUTED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
};

bookingSchema.methods.canTransitionTo = function (nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[this.status] || [];
  return allowed.includes(nextStatus);
};""")

    add_heading3(doc, "8.2.5 Razorpay Escrow Order Generation & HMAC Signature Verification")
    add_p(doc, "Payment transactions are secured through backend order creation in paise and cryptographic signature verification using the Node.js native crypto module.")

    add_code_box(doc, """// Source: server/src/services/paymentService.js & server/src/config/razorpay.js
// 1. Cryptographic HMAC SHA-256 Signature Verification
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = env.RAZORPAY_KEY_SECRET;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
};

// 2. Server-Side Payment Verification & State Transition
static async verifyPayment(bookingId, residentUserId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid && !env.isDev) {
    throw ApiError.badRequest('Invalid payment signature verification failed');
  }

  const booking = await Booking.findById(bookingId);
  booking.status = BOOKING_STATUS.PAID;
  await booking.save();

  await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { status: 'PAID', razorpayPaymentId, verifiedAt: new Date() }
  );
  return { success: true, bookingStatus: booking.status };
}""")

    add_heading3(doc, "8.2.6 Real-Time WebSocket Communication Handler Implementation")
    add_p(doc, "Socket.IO establishes persistent bi-directional rooms for direct messaging between residents and providers, ensuring that chat history is simultaneously persisted to MongoDB while being delivered to the connected client instantly.")

    add_code_box(doc, """// Source: server/src/sockets/socketHandler.js
io.on('connection', (socket) => {
  // Join Private Conversation Room
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
  });

  // Handle New Real-Time Message
  socket.on('send_message', async ({ conversationId, senderId, text }) => {
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
    });
    // Broadcast to room participants
    io.to(conversationId).emit('new_message', message);
  });
});""")

    add_heading3(doc, "8.2.7 Core RESTful API Endpoints Specification")
    add_p(doc, "The API surface of Neighbourly comprises modular REST endpoints documented in Table 4.1.")

    api_headers = ["HTTP Method", "Endpoint URI", "Authorized Roles", "Functional Description"]
    api_data = [
        ["POST", "/api/auth/register", "Public / All", "Register new Resident, Provider, or Admin account"],
        ["POST", "/api/auth/login", "Public / All", "Authenticate credentials and issue JWT bearer token"],
        ["GET", "/api/services", "Public / All", "Retrieve categorized service catalog with pricing baselines"],
        ["GET", "/api/providers", "Public / All", "Search and filter nearby providers by locality and category"],
        ["POST", "/api/ai/extract-request", "RESIDENT", "Parse unstructured conversational text via AI/NLP engine"],
        ["POST", "/api/requests", "RESIDENT", "Persist confirmed service request and broadcast to providers"],
        ["GET", "/api/offers/request/:id", "RESIDENT, PROVIDER", "Retrieve all quotation bids submitted for a request"],
        ["POST", "/api/offers", "PROVIDER", "Submit customized quotation bid for broadcasted request"],
        ["POST", "/api/bookings", "RESIDENT", "Accept offer or initialize direct booking with provider"],
        ["PATCH", "/api/bookings/:id/status", "RESIDENT, PROVIDER", "Execute state machine transition (IN_PROGRESS, COMPLETED)"],
        ["POST", "/api/payments/create-order", "RESIDENT", "Initialize Razorpay escrow order in paise on backend"],
        ["POST", "/api/payments/verify", "RESIDENT", "Verify HMAC-SHA256 signature and transition booking to PAID"],
        ["POST", "/api/reviews", "RESIDENT", "Submit post-service 5-star rating and textual review"],
        ["POST", "/api/disputes", "RESIDENT, PROVIDER", "Formally contest an unsatisfactory or contested booking"],
        ["GET", "/api/admin/analytics", "ADMIN", "Retrieve platform metrics (revenue, booking velocity, growth)"],
        ["PATCH", "/api/admin/verifications/:id", "ADMIN", "Approve or reject provider identity documents in queue"],
    ]
    add_table_styled(doc, api_headers, api_data, col_widths=[1.1, 2.1, 1.4, 1.9])

    add_heading2(doc, "8.3 Tools and Technologies Used")
    add_p(doc, "The selection of technical frameworks and libraries across the Neighbourly stack was guided by production reliability, developer velocity, community maturity, and strict security compliance:")

    add_bullet(doc, "React 18 & Vite Build Tool", 
               "React 18 delivers declarative component-driven UI construction empowered by Concurrent Mode and automatic batching, ensuring smooth 60fps micro-interactions. Vite replaces legacy Webpack bundlers, delivering instant server start times and sub-second Hot Module Replacement (HMR) powered by native ES modules.")

    add_bullet(doc, "Tailwind CSS Utility Design System", 
               "Enforces a consistent design language across spacing, typography, and curated color palettes (slate, emerald, and sky blue), generating minimal production CSS bundles with zero unused style bloat.")

    add_bullet(doc, "Node.js & Express REST Engine", 
               "Node's non-blocking, asynchronous event loop efficiently handles thousands of concurrent client connections with minimal memory overhead, while Express provides battle-tested middleware routing and security piping.")

    add_bullet(doc, "MongoDB Atlas & Mongoose ODM", 
               "MongoDB's flexible BSON document model seamlessly accommodates evolving service schemas, nested provider attributes, and dynamic review collections. Mongoose provides schema validation, middleware hooks, and automated population pipelines.")

    add_bullet(doc, "Socket.IO Bi-Directional WebSocket Protocol", 
               "Provides low-latency, full-duplex communication channels between clients and the server, featuring automatic reconnection, room abstraction, and graceful HTTP long-polling fallbacks.")

    add_bullet(doc, "Razorpay Payment Gateway (Test Mode)", 
               "Provides India's gold-standard digital payment infrastructure, supporting UPI, credit/debit cards, and net banking simulations backed by server-side HMAC-SHA256 cryptographic verification.")

    add_bullet(doc, "Google Gemini Generative AI (Flash Models)", 
               "Delivers rapid semantic reasoning and structured entity extraction from natural language prompts, operating with low token latency and high fidelity.")

    add_bullet(doc, "Zod & Helmet Security Suites", 
               "Zod enforces runtime schema validation at API boundaries, disallowing malicious or malformed payloads. Helmet hardens HTTP headers against Cross-Site Scripting (XSS), Clickjacking, and MIME sniffing attacks.")

    doc.add_page_break()

print("Part 3 built successfully.")
