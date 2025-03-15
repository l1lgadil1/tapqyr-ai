# AI Assistant Feature

This feature provides an AI assistant that is shown by default on the left side of the app on desktop devices and can be toggled on mobile devices. The assistant can help users with various tasks based on their commands.

## Structure

The AI assistant feature follows the Feature-Sliced Design (FSD) architecture:

```
src/features/ai-assistant/
├── api/                  # API layer for AI interactions
│   ├── ai-service.ts     # Service for handling AI responses
│   └── index.ts          # Public API exports
├── model/                # State management
│   ├── store.ts          # Zustand store for AI assistant state
│   └── index.ts          # Public model exports
├── ui/                   # UI components
│   └── ai-assistant.tsx  # Main AI assistant component
└── index.ts              # Public feature exports
```

## Features

- **Enhanced UI/UX**:
  - Smooth animations for messages and UI elements
  - Visual feedback for loading states
  - Quick suggestion buttons for common queries
  - Settings panel for configuration
  - Improved message bubbles with sender identification
  - Keyboard shortcuts for efficient interaction

- **Responsive Design**: 
  - On desktop: Shown by default on the left side of the screen
  - On mobile: Can be toggled with a button in the bottom left corner

- **Persistent Chat**: Conversations with the AI assistant are persisted in local storage

- **Minimizable Interface**: The assistant can be minimized to save screen space

- **Accessibility**: Includes proper ARIA labels for screen readers

## Usage

The AI assistant is integrated into the main App component and is available throughout the application:

### Desktop
- The assistant is shown by default on the left side of the screen
- The main content area adjusts to make room for the assistant
- You can minimize the assistant to a narrow sidebar
- You can close the assistant completely if needed
- Access settings via the gear icon
- Clear conversation history when needed

### Mobile
- Click the brain icon in the bottom left corner to open the assistant
- The assistant appears as a floating panel
- You can minimize or close it as needed

## Implementation Details

- Uses Zustand for state management with persistence
- Implements responsive design with different layouts for desktop and mobile
- Detects device type using window width
- Adjusts main content layout when the assistant is open on desktop
- Uses Framer Motion for smooth animations
- Styled with Tailwind CSS and follows the app's design system
- Custom CSS animations for enhanced visual appeal
- Quick suggestion buttons for common queries
- Settings panel for configuration

## Future Enhancements

- Integration with a real AI API (e.g., OpenAI)
- Voice input and output
- Rich message formatting with markdown support
- Task creation directly from the assistant
- Context-aware responses based on the current page
- Customizable themes and appearance
- Message search functionality
- File and image sharing capabilities 