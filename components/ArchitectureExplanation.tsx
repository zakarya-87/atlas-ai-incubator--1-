import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
}

const ArchitectureSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <motion.section variants={itemVariants} className="mb-8">
    <h3 className="text-2xl font-semibold text-brand-light border-b border-brand-accent/50 pb-2 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </motion.section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-xl font-bold text-brand-teal/90">{title}</h4>
      <div className="pl-4 text-sm space-y-2 mt-2 text-brand-text/80">{children}</div>
    </div>
  );

const ArchitectureExplanation: React.FC = () => {
    const diagram = `
[User] --(1. Input)--> [Frontend (React + Tailwind)]
   ^                     |
   |                     | (2. API Request: JSON + Auth Token)
   |                     v
   |               [Backend API Gateway]
   |                     |
   |    /----------------+------------------\\
   |    |                |                  |
   |    v                v                  v
   | [Auth Service]  [User Service]   [Analysis Service] --(3. Validate)--> [AI Agent Layer]
   | (JWT Verify)    (User Data)        (Business Logic)                        |
   |                                                                            | (4. Formatted Prompt)
   |                                                                            v
   |                                                                      [Google Gemini API]
   |                                                                            |
   |                                                                            | (5. Structured JSON)
   |                                                                            v
   | [Database] <--(7. Store Results)-- [Analysis Service] <--(6. Parse)-- [AI Agent Layer]
   | (PostgreSQL)
   |    ^
   +---(9. Render UI)--- [Frontend] <---(8. Send Response)--- [Backend API Gateway]
    `;

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-brand-text/90 max-w-5xl mx-auto font-sans leading-relaxed"
    >
      <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-brand-teal mb-2 text-center">ATLAS AI Incubator: System Architecture</motion.h2>
      <motion.p variants={itemVariants} className="text-center text-brand-light mb-8">A blueprint for a scalable, secure, and modular AI-powered application.</motion.p>

      <div className="space-y-8">
        <ArchitectureSection title="1. Overview">
          <p>The ATLAS AI Incubator is a cloud-native, modular web application designed for scalability, security, and maintainability. It leverages a modern tech stack to provide AI-powered business analysis tools to a global, multi-language user base. The architecture separates concerns into distinct layers: a responsive frontend, a stateless backend composed of microservices, and a powerful AI agent layer that interfaces with Google's Generative AI.</p>
        </ArchitectureSection>

        <ArchitectureSection title="2. Key Components">
            <SubSection title="Frontend">
                <p><strong>Framework:</strong> React with TypeScript for a robust, type-safe user interface.</p>
                <p><strong>Styling:</strong> Tailwind CSS for a utility-first, responsive design that adapts to all screen sizes.</p>
                <p><strong>State Management:</strong> React Context API for managing global state like language preference.</p>
                <p><strong>Animation:</strong> Framer Motion for smooth, engaging UI animations and transitions.</p>
                <p><strong>Internationalization (i18n):</strong> A custom context-based solution supports English, French, and Arabic, including right-to-left (RTL) layout for Arabic.</p>
            </SubSection>
            <SubSection title="Backend (API Layer)">
                <p><strong>Runtime:</strong> Node.js with a TypeScript framework (e.g., Express or NestJS).</p>
                <p><strong>Architecture:</strong> A set of microservices managed by an API Gateway. This isolates concerns (e.g., authentication, analysis generation, user management).</p>
                <p><strong>Authentication:</strong> JWT-based authentication. Users receive a token upon login, which is sent with each API request for verification.</p>
            </SubSection>
            <SubSection title="AI Agent Layer">
                <p><strong>Core Service:</strong> A dedicated service that acts as an intermediary between the backend and the AI model.</p>
                <p><strong>Provider:</strong> Google Gemini API (@google/genai SDK) is used for all generative tasks.</p>
                <p><strong>Functionality:</strong> Constructs detailed prompts based on user input and pre-defined templates, specifies the required JSON schema for the response, and parses the structured data received from Gemini before passing it back to the backend.</p>
            </SubSection>
             <SubSection title="Database">
                <p><strong>Engine:</strong> PostgreSQL for its reliability, powerful querying capabilities, and strong support for JSON data types.</p>
                <p><strong>Design:</strong> Multi-tenant schema, where each user's or organization's data is isolated using a unique identifier (e.g., `user_id` or `org_id`) on every relevant table. This ensures data privacy.</p>
                <p><strong>Scalability:</strong> Designed for read replicas and connection pooling to handle high traffic loads.</p>
            </SubSection>
        </ArchitectureSection>

        <ArchitectureSection title="3. Workflow & Data Flow">
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>User Input:</strong> A user enters their business description into the React frontend and selects an analysis tool.</li>
                <li><strong>API Request:</strong> The frontend sends a secure HTTPS request to the Backend API Gateway, including the user's input and their JWT authentication token.</li>
                <li><strong>Processing & Validation:</strong> The gateway routes the request to the relevant service (e.g., Analysis Service). This service validates the input and calls the AI Agent Layer.</li>
                <li><strong>AI Prompting:</strong> The AI Agent constructs a detailed prompt for the Google Gemini API, specifying the desired analysis and the `responseSchema` to ensure a structured JSON output.</li>
                <li><strong>AI Generation:</strong> Google Gemini processes the prompt and returns a structured JSON object.</li>
                <li><strong>Parsing:</strong> The AI Agent parses the response, performs a final validation, and returns the clean data to the backend service.</li>
                <li><strong>Data Storage:</strong> The backend service stores the generated analysis in the PostgreSQL database, associating it with the user's ID.</li>
                <li><strong>Response to Client:</strong> The backend sends the structured JSON data back to the frontend.</li>
                <li><strong>UI Rendering:</strong> The React frontend receives the data and dynamically renders the appropriate display component (e.g., `SwotDisplay`, `RoadmapDisplay`).</li>
            </ol>
            <h4 className="text-xl font-semibold text-brand-light mt-6 mb-2">Data Flow Diagram</h4>
            <pre className="bg-brand-primary/50 p-4 rounded-lg text-xs text-brand-light overflow-x-auto mt-4 font-mono">
                {diagram}
            </pre>
        </ArchitectureSection>
      </div>
    </motion.div>
  );
};

export default ArchitectureExplanation;
