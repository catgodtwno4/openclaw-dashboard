# Responsive Layout Quick Reference

## Key Tailwind Classes Used

### Grid Layouts
```tsx
// Stats bar - responsive columns
grid-cols-2 md:grid-cols-3 lg:grid-cols-6

// 3-panel layout
grid grid-cols-1 lg:grid-cols-3

// Users stats
grid-cols-2 md:grid-cols-4
```

### Navigation
```tsx
// Desktop top nav (visible on lg+)
<nav className="hidden lg:block">

// Mobile bottom nav (visible on lg-)
<nav className="fixed bottom-0 left-0 right-0 lg:hidden">

// Body padding for mobile nav
<body className="pb-20 lg:pb-0">
```

### Panel Visibility
```tsx
// Show only on desktop
className="hidden lg:block"

// Show only on mobile
className="md:hidden"

// Show only on tablet+
className="hidden md:block"
```

### Responsive Text & Spacing
```tsx
// Responsive header layout
<div className="flex flex-col sm:flex-row">

// Full-width mobile, thirds on desktop
<div className="w-full lg:w-1/3">

// Responsive padding
className="p-3 sm:p-4 md:p-6"
```

## Responsive Breakpoints

| Class | Size | Use Case |
|-------|------|----------|
| sm | 640px | Small mobile landscape |
| md | 768px | Tablet & up |
| lg | 1024px | Desktop |

## Quick Modifications

### To add a new responsive feature:

1. **Single column → multi-column:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* stacked on mobile, 2 cols on tablet, 3 cols on desktop */}
</div>
```

2. **Hide/show by viewport:**
```tsx
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

3. **Responsive padding:**
```tsx
<div className="p-2 sm:p-3 md:p-4 lg:p-6">
```

## Testing Responsive Layouts

### Browser DevTools
- Chrome/Edge: Ctrl+Shift+M (or Cmd+Shift+M on Mac)
- Firefox: Ctrl+Shift+M
- Set viewport to 390×844 (iPhone) for mobile testing

### Command line
```bash
npm run build    # Verify builds
npm run dev      # Test on localhost:3000
```

### Screenshots
```bash
# Already in public/screenshots/
desktop-*.png    # 1440×900
mobile-*.png     # 390×844
```

## Common Issues & Fixes

### Problem: Content not hiding on mobile
**Solution:** Add `md:hidden` to hide on tablet+, or `hidden lg:block` to show only on desktop

### Problem: Panels overlapping
**Solution:** Verify `grid grid-cols-1 lg:grid-cols-3` is applied, not `flex` with fixed widths

### Problem: Bottom nav covered by content
**Solution:** Add `pb-20 lg:pb-0` to body to reserve space

### Problem: Text too small on mobile
**Solution:** Use responsive text sizes: `text-xs sm:text-sm md:text-base`

## File Locations

- Layout: `app/layout.tsx`
- Tasks page: `app/page.tsx`
- Memory page: `app/memory/page.tsx`
- Users page: `app/users/page.tsx`
- Screenshots: `public/screenshots/`

## Performance Notes

- ✅ All responsive behavior is CSS-based (no JS)
- ✅ No media query JS libraries needed
- ✅ Pure Tailwind CSS responsive classes
- ✅ Build size: unchanged

---

Last updated: 2026-03-23
