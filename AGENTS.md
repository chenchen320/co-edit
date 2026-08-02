# Agent Guidelines & Frontend Generation Constraints (AGENTS.md)

This file defines the behavior constraints and code generation guidelines for the AI assistant in this project. The AI assistant must strictly adhere to these rules when building pages or components.

---

## 1. Core Principles

### 1.1 Strict Static Pages Only
- **UI & Presentation Focus**: The agent is ONLY responsible for creating the visual structure, layout, styles, and basic client-side interactive states (e.g., toggling a modal, switching tabs, local mock states).
- **Zero Business Logic**: Do NOT write any API calls (Axios/Fetch), state management logic (Redux/Zustand), WebSocket handlers, or complex data synchronization.
- **Event Callbacks & Placeholders**: All interactive actions (like button clicks, form submissions, and data deletions) must be exposed via React component props (e.g., `onSave`, `onSubmit`, `onDelete`) or placeholders. Leave the actual implementation to the user.

### 1.2 Aesthetic Excellence
- Follow the guidelines in the `frontend-design` skill. Deliver polished, production-grade visual designs with attention to typography, micro-interactions, responsive grids, and spacing. Do not generate generic, low-effort layouts.

---

## 2. Tech Stack & Component Library Guidelines

- **Environment**: React, TypeScript, and Vite.
- **UI Libraries**: Prioritize using UI component libraries (e.g., Ant Design, shadcn/ui, Material UI, or Tailwind CSS) if specified or installed in the workspace. Avoid writing raw complex HTML/CSS from scratch when a library component is available.
- **Consistency**: Keep styling consistent with the existing theme variables of the workspace.

---

## 3. Code Structure Constraints

Every generated React component must follow this structure:
1. **Props Definitions (TypeScript Interfaces)**: Explicitly define the types for component Props, including mock data inputs and business-related event callbacks.
2. **Pure UI Component**:
   - Limit state variables to UI-only states (e.g., `isOpen`, `activeTabId`).
   - Place any static mock data outside the component or pass it in via props.
3. **Explicit TODO Annotations**: Mark areas that require business logic implementation with a clear comment: `// TODO: Business logic implemented by user`.
