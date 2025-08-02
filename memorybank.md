# JSON Builder ECRM - Memory Bank

## Project Overview

A Next.js application with TypeScript and Tailwind CSS that allows users to create interactive form flows by building nodes and connecting them to generate JSON configurations.

## Project Structure

```
d:\JSON_BUILDER_ECRM\
├── src/
│   ├── app/
│   │   ├── globals.css (React Flow styles + Tailwind)
│   │   ├── layout.tsx (Next.js layout)
│   │   └── page.tsx (Main entry point - renders JSONBuilder)
│   ├── components/
│   │   ├── index.ts (Component exports)
│   │   ├── JSONBuilder.tsx (Main application component)
│   │   ├── Sidebar.tsx (Form input sidebar)
│   │   ├── CustomNode.tsx (Visual node component)
│   │   └── JSONPreview.tsx (JSON output preview modal)
│   └── types/
│       └── index.ts (TypeScript type definitions)
├── package.json (Dependencies)
├── tsconfig.json (TypeScript config)
├── tailwind.config.ts (Tailwind config)
├── next.config.ts (Next.js config)
└── memorybank.md (This file)
```

## Dependencies

- **Next.js 15.4.5** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Flow** - Node editor functionality
- **UUID** - Unique ID generation
- **Lucide React** - Icons

## Key Components

### 1. JSONBuilder.tsx (Main Component)

- **Purpose**: Main application orchestrator
- **State Management**:
  - `nodes` - Array of visual nodes
  - `edges` - Array of connections between nodes
  - `selectedNode` - Currently selected node for editing
  - `showJSONPreview` - Toggle for JSON preview modal
- **Key Functions**:
  - `createNode()` - Creates new nodes from form data
  - `updateNode()` - Updates existing nodes
  - `deleteNode()` - Removes nodes and their connections
  - `generateJSON()` - Converts nodes/edges to target JSON format
- **React Flow Integration**: Uses React Flow for visual node editing

### 2. Sidebar.tsx (Form Input)

- **Purpose**: Input form for creating/editing nodes
- **Form Fields**:
  - Question Name (slug)
  - Question Alias
  - Block Type (dropdown with 13 types)
  - Group Number
  - Required checkbox
  - Options (for dropdown/multiple choice types)
  - Validation fields (regex, min/max for dates)
- **Dynamic UI**: Shows/hides fields based on block type
- **Edit Mode**: Populates form when node is selected

### 3. CustomNode.tsx (Visual Node)

- **Purpose**: Visual representation of form blocks
- **Features**:
  - Color-coded by block type
  - Shows question name/alias
  - Displays block type and group
  - Shows "Required" badge
  - Lists options (truncated if many)
  - Shows validation indicator
  - Emoji icons for each block type
- **Handles**: Source (bottom) and target (top) connection points

### 4. JSONPreview.tsx (Output Modal)

- **Purpose**: Preview and export generated JSON
- **Features**:
  - Pretty-printed JSON display
  - Copy to clipboard
  - Download as file
  - Statistics (groups, blocks, file size)
- **Modal**: Overlay with close functionality

## Block Types (13 Total)

1. **textInput** - Text input field (📝, blue)
2. **dropdown** - Dropdown selection (📋, green)
3. **multipleChoice** - Multiple choice options (☑️, purple)
4. **contactNo** - Contact number input (📞, orange)
5. **date** - Date picker (📅, pink)
6. **product** - Product selection (📦, indigo)
7. **terms** - Terms & conditions (📜, yellow)
8. **otp** - OTP verification (🔐, red)
9. **video** - Video content (🎥, cyan)
10. **giveable** - Reward/giveable items (🎁, emerald)
11. **interactive_av** - Interactive AV content (📱, violet)
12. **audio_start** - Audio recording start (🎤, lime)
13. **audio_end** - Audio recording end (🔇, gray)

## Target JSON Structure

The application generates JSON matching this structure:

```json
[
  {
    "type": "referring" | "numbervalidation",
    "group": "string",
    "blocks": [
      {
        "id": "string",
        "type": "BlockType",
        "options": [{"value": "string", "referTo": {}}] | null,
        "skip": {"id": "string", "group_no": "string"},
        "referTo": {"id": "string", "group_no": "string"},
        "question": {"slug": "string", "alias": "string"},
        "required": "true" | undefined,
        "validations": {
          "regex": "string",
          "min": number,
          "max": number,
          "terms": ["string"],
          "etc": "various validation options"
        }
      }
    ],
    "jumping_logic": [
      {"id": "string", "group_no": "string", "conditions": []}
    ]
  }
]
```

## Type Definitions (types/index.ts)

- **QuestionData**: slug, alias
- **ReferTo**: id, group_no
- **Skip**: id, group_no
- **OptionItem**: value, referTo
- **Validations**: regex, prefix, min, max, terms, etc.
- **BlockData**: Complete block structure
- **JumpingLogic**: Logic for flow control
- **GroupData**: Complete group structure
- **BlockType**: Union of all 13 block types
- **GroupType**: 'referring' | 'numbervalidation'
- **NodeData**: Internal node representation
- **FormData**: Form input structure

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **React Flow Styles**: Imported for node editor
- **Custom Scrollbar**: Webkit scrollbar styling
- **Color Coding**: Each block type has distinct colors
- **Responsive**: Sidebar + main canvas layout

## Key Features Implemented

1. ✅ Sidebar form for node creation
2. ✅ Interactive node canvas with React Flow
3. ✅ Drag & drop node positioning
4. ✅ Node-to-node connections
5. ✅ Node editing (click to select)
6. ✅ Node deletion
7. ✅ JSON generation matching target structure
8. ✅ JSON preview with copy/download
9. ✅ Type safety with TypeScript
10. ✅ Visual node differentiation by type
11. ✅ Dynamic form fields based on block type
12. ✅ Validation options for applicable blocks
13. ✅ Skip logic functionality with UI controls

## Skip Logic Implementation

- **Form Fields**:
  - "Enable Skip Logic" checkbox
  - "Skip to Block ID" input (supports -1 for end, or specific block IDs)
  - "Skip to Group Number" input
- **Visual Indicator**: Orange badge showing "Skip: [ID] → G[Group]" on nodes
- **JSON Generation**: Includes `skip` property with `id` and `group_no`
- **Conditional UI**: Skip fields only appear when checkbox is enabled

## Development Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Implementation Notes

- Uses React Flow's `useNodesState` and `useEdgesState` for state management
- UUID v4 for generating unique node IDs
- Dynamic form rendering based on block type selection
- Color-coded visual nodes with emoji icons
- Responsive design with fixed sidebar width (320px)
- JSON generation groups nodes by `groupId`
- Connection edges create `referTo` relationships
- Background pattern uses React Flow's dot variant

## Known Configuration

- **Port**: 3000 (default Next.js)
- **Node Positioning**: Random initial placement
- **Sidebar Width**: 320px (w-80)
- **Node Types**: Single custom node type
- **File Extensions**: .tsx for React components, .ts for types

## Future Enhancement Areas

- Undo/redo functionality
- Node grouping/ungrouping
- Import existing JSON to rebuild canvas
- Validation rule builder UI
- Node templates/presets
- Canvas zoom/pan controls enhancement
- Keyboard shortcuts
- Node search/filter
- Flow testing/simulation
- Export to different formats

## Known Issues & Solutions

### TypeScript Import Errors (False Positives)

- **Issue**: VS Code shows "Cannot find module" errors for local component imports
- **Status**: Application compiles and runs successfully despite errors
- **Cause**: VS Code TypeScript language server cache/resolution issue
- **Solutions**:
  1. Restart TypeScript language server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
  2. Reload VS Code window: Ctrl+Shift+P → "Developer: Reload Window"
  3. Check tsconfig.json paths are correct
  4. Verify all component files exist and have proper exports
- **Fixed**: Updated imports to use absolute paths (`@/components/...`)

### UI Text Visibility Issues

- **Issue**: Input field text color not visible (appearing white on white background)
- **Solution**: Added `text-gray-900 bg-white` classes to all input fields
- **Status**: ✅ Fixed - All form inputs now have black text on white background
- **Files Updated**: `src/components/Sidebar.tsx`

### Current Application Status

- ✅ Development server running on localhost:3000
- ✅ Application compiles successfully with Turbopack
- ✅ All components exist and are properly structured
- ❗ VS Code showing false positive import errors
- ✅ TypeScript check (`npx tsc --noEmit`) passes without errors

## Error Handling

- Form validation for required fields
- Type safety with TypeScript
- Edge case handling for empty options
- Proper cleanup on node deletion

This memory bank serves as the single source of truth for the JSON Builder ECRM project structure and implementation details.
