# Future Work - Prompt Builder NG

Based on analysis of the current Prompt Builder NG project, here are the **unimplemented features** identified by comparing the PRD with the actual implementation:

## Unimplemented Features

### 🔧 **Field Placeholder System**
- **Dynamic field editing** - The UI shows field buttons like `[field_name]` but there's no functionality to click and edit these values
- **Field value processing** - While the API endpoint `/api/process-form-fields` exists, the frontend doesn't use it
- **Field extraction and editing modal** - No UI for editing field values when building prompts

### 🎨 **User Interface Features**
- **Dark/Light mode toggle** - Completely missing from the current implementation
- **Theme persistence** - No local storage for user preferences
- **Clear builder functionality** - No way to clear/reset the prompt builder
- **Toast notifications enhancement** - Basic toasts exist but could be more comprehensive

### 🔧 **Advanced Prompt Builder Features**
- **Prompt builder reordering** - No way to reorder snippets once added to builder
- **Individual snippet removal** - While there's a remove button, the UX could be improved
- **Prompt composition validation** - No validation of prompt structure

### 💾 **Enhanced Prompt Management**
- **Prompt editing** - Can't edit saved prompts, only load them
- **Prompt preview before loading** - Limited preview functionality in browse modal
- **Prompt deletion confirmation** - Missing delete functionality for saved prompts
- **Prompt export formats** - API supports it but UI doesn't expose different export formats

### 🔍 **Search and Organization**
- **Advanced snippet filtering** - Basic category filtering exists but could be enhanced
- **Tag-based filtering** - Tags are stored but not used for filtering
- **Snippet sorting options** - No sorting by date, name, or usage

### 🚀 **Performance and UX**
- **Responsive design improvements** - Basic responsiveness exists but could be enhanced
- **Keyboard shortcuts** - No keyboard navigation or shortcuts
- **Drag and drop visual feedback** - Basic feedback exists but could be improved
- **Undo/Redo functionality** - No way to undo actions in the builder

### 🔧 **Technical Enhancements**
- **Error handling improvements** - Basic error handling exists but could be more robust
- **Loading states** - No loading indicators during API calls
- **Offline functionality** - No offline support or caching
- **Bulk operations** - No way to select and operate on multiple snippets

### 🎯 **Missing Core Features from PRD**
- **Network accessibility toggle** - The app.py has the code commented but no UI toggle
- **Snippet import/export** - No way to backup or share snippet libraries
- **Prompt templates** - No template system for common prompt patterns
- **Usage analytics** - No tracking of which snippets are used most

## Priority Features

The most critical missing features that would significantly improve user experience are:

1. **Dynamic field editing system** - Core functionality for parameterized prompts
2. **Dark/Light mode toggle** - Essential UX feature mentioned in PRD
3. **Clear builder functionality** - Basic usability feature
4. **Prompt editing capabilities** - Important for prompt management workflow
5. **Enhanced search and filtering** - Improves snippet discoverability

## Implementation Recommendations

These features should be prioritized based on:
- **User impact** - How much they improve the user experience
- **Implementation complexity** - Development effort required
- **Dependencies** - Whether they depend on other features
- **PRD alignment** - How critical they are to the original vision

Consider creating individual specs for the highest priority features to enable focused development iterations.