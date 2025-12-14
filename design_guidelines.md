# Sweet Shop Management System - Design Guidelines

## Design Approach
**Selected Framework:** Material Design principles with e-commerce enhancements  
**Rationale:** This utility-focused inventory management system with customer-facing elements requires clear information hierarchy, efficient data display, and intuitive forms. Material Design provides robust patterns for data-heavy applications while allowing product showcasing.

## Core Design Elements

### Typography
- **Primary Font:** Inter or Roboto (Google Fonts CDN)
- **Headings:** Font-weight 700, sizes: text-3xl (h1), text-2xl (h2), text-xl (h3)
- **Body Text:** Font-weight 400, text-base
- **Labels/Metadata:** Font-weight 500, text-sm, uppercase tracking-wide

### Layout System
**Spacing Units:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Grid gaps: gap-4 to gap-6
- Container: max-w-7xl mx-auto px-4

### Component Library

#### Authentication Pages (Login/Register)
- Centered card layout (max-w-md) with elevation shadow
- Single-column form fields with consistent spacing (space-y-4)
- Full-width input fields with clear labels above
- Primary action button (full-width, py-3)
- Link to alternate action below (text-sm, centered)
- Minimal decoration, focus on clarity

#### Dashboard Layout
- **Header:** Fixed top navigation with logo, search bar, user menu, logout
- **Main Content:** Grid layout for sweet cards
  - Desktop: grid-cols-4
  - Tablet: grid-cols-3
  - Mobile: grid-cols-1
- **Filters Sidebar:** Fixed left sidebar (hidden on mobile, toggle button)
  - Category checkboxes
  - Price range slider
  - Search input at top

#### Sweet Cards
- Vertical card design with aspect-square image placeholder at top
- Content area (p-4) containing:
  - Sweet name (text-lg font-semibold)
  - Category badge (rounded-full px-3 py-1 text-xs)
  - Price (text-xl font-bold)
  - Stock quantity (text-sm with icon)
  - Purchase button (w-full, mt-4)
- Disabled state: opacity-50 with "Out of Stock" badge
- Card hover: subtle shadow elevation increase

#### Admin Interface
- **Add/Edit Form:** Two-column layout (md:grid-cols-2) in modal or dedicated page
  - Fields: Name, Category (dropdown), Price (number), Quantity (number)
  - Action buttons: Save (primary) and Cancel (secondary)
- **Sweet Listing Table:** Responsive table with actions column
  - Columns: Image (thumbnail), Name, Category, Price, Quantity, Actions
  - Actions: Edit (icon button), Delete (icon button, red accent)
  - Mobile: Stack as cards instead of table

#### Navigation
- Top bar: Logo left, search center, user actions right
- Admin section indicator: Highlighted nav item or badge
- Role-based menu items: Admin tools only visible to admin users

#### Buttons & Actions
- **Primary:** Solid fill, py-2 px-6, rounded-lg
- **Secondary:** Outline style, matching padding
- **Icon Buttons:** Square (w-10 h-10), rounded-lg, centered icon
- **Disabled:** opacity-50, cursor-not-allowed

#### Forms & Inputs
- Text inputs: border, rounded-lg, px-4 py-2, focus:ring-2
- Labels: mb-2, font-medium, text-sm
- Error states: red border, red text below (text-xs)
- Success feedback: Green checkmark or toast notification

#### Stock Indicators
- In-stock: Green dot + quantity text
- Low stock (<10): Orange dot + quantity text  
- Out of stock: Red dot + "Out of Stock" text
- Display prominently on cards and in table

### Icons
**Library:** Heroicons (CDN)
- Shopping cart, search, user profile, plus, edit, trash, logout icons
- Consistent sizing: w-5 h-5 for inline, w-6 h-6 for buttons

### Images
**Product Images:**
- Aspect ratio: Square (1:1) for consistency
- Placeholder: Gradient background with sweet icon for products without images
- Size: 200x200px minimum, served responsive
- No hero image needed - this is a management dashboard, not marketing page

### Animations
Minimal, functional only:
- Button hover: subtle scale (scale-105)
- Card hover: shadow transition
- Loading states: Spinner for async operations
- Form validation: Shake animation for errors

### Accessibility
- All inputs have associated labels
- Disabled buttons include aria-disabled
- Focus states visible with ring utility
- Color contrast meets WCAG AA standards
- Error messages announced to screen readers