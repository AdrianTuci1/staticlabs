# Project: Thunder Live Chat Application

## Objective
Convert the provided `ThunderChatDemo.jsx` from a passive demonstration into a fully functional, real-time AI chat application.

## Core Requirements

### 1. Interactive Composer
- **Dynamic Input**: Replace the `TypewriterText` in the composer with a functional `<textarea>` or `<input>` that allows users to type their own prompts.
- **Message Dispatch**: Implement a submission handler that adds the user's message to the local state and triggers an API request to an LLM provider.

### 2. Stateful Conversation
- **Message List**: Transition from slicing `DEMO_SCRIPT` to managing an array of message objects (e.g., `{ role: 'user' | 'assistant', content: string | array }`) in a React state or a store (like Zustand).
- **Persistence**: (Optional) Implement local storage persistence so the chat history survives page refreshes.

### 3. Real-Time Streaming Integration
- **API Connection**: Integrate with an LLM API (OpenAI, Anthropic, etc.).
- **Streaming UI**: Modify the `AssistantMessage` and `CrystallizedText` logic to handle chunked data streams. The "crystallization" effect should trigger as new chunks arrive, maintaining the high-fidelity aesthetic during live generation.

### 4. Dynamic Content Rendering
- **Parser Implementation**: Create a parser that detects Markdown, CSV blocks, and code blocks in the model's response.
- **Component Mapping**: Map parsed blocks to the existing `ResponseBlock` types (text, csv, code) to maintain visual consistency.

### 5. Premium Aesthetics Preservation
- **Animations**: Ensure the "send" animation, layout transitions, and scroll-to-latest behaviors are preserved during real interaction.
- **Responsive Design**: Maintain the fluid, dark-mode layout and mobile-responsive adjustments defined in `ThunderChatDemo.css`.

## Technical Stack
- **Frontend**: React (Vite)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (provided)
- **API**: Fetch with Server-Sent Events (SSE) support for streaming.

## Getting Started
1. Initialize a new Vite project.
2. Port `ThunderChatDemo.jsx`, `ThunderChatDemo.css`, and `LabMarkLogo` files into the new project.
3. Install dependencies: `npm install lucide-react`.
4. Begin by making the composer input interactive.
