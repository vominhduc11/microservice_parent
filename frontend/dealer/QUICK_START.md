# 🚀 Quick Start Guide

Essential commands and references for the modernized dealer frontend.

---

## 📦 Installation

```bash
cd frontend/dealer
npm install
```

---

## 🏃 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Quick References

### Toast Notifications

```javascript
import { showSuccess, showError, showWarning, showInfo } from './utils/toast'

// Basic usage
showSuccess('Operation successful!')
showError('Something went wrong')
showWarning('Please be careful')
showInfo('Here is some info')

// With custom options
showSuccess('Saved!', { duration: 3000, position: 'bottom-center' })

// Promise toast (auto loading/success/error)
import { showPromise } from './utils/toast'
showPromise(
  api.saveData(),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save'
  }
)
```

**Full guide:** `TOAST_USAGE_EXAMPLES.md`

---

### React Query Hooks

```javascript
import { useProducts, useOrders } from './hooks'

// Fetch data
const { data, isLoading, error, refetch } = useProducts()

// Mutations
const createOrder = useCreateOrder()
createOrder.mutate({ items: [...] }, {
  onSuccess: () => console.log('Order created!')
})
```

**Full guide:** `REACT_QUERY_USAGE.md`

---

### Tailwind CSS

```jsx
// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">

// Dark mode
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">

// Hover & focus
<button className="hover:bg-blue-600 focus:ring-2 focus:ring-blue-500">

// Transitions
<div className="transition-all duration-300 ease-in-out">
```

**Docs:** https://tailwindcss.com/docs

---

### JSDoc Examples

```javascript
/**
 * Calculates total price with tax
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate (0-1)
 * @returns {number} Total price with tax
 */
function calculateTotal(price, taxRate) {
  return price * (1 + taxRate)
}

/**
 * User component
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - User name
 * @param {string} props.email - User email
 * @returns {JSX.Element}
 */
function User({ name, email }) {
  return <div>{name} - {email}</div>
}
```

---

## 🔧 Common Tasks

### Add a new page
1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add JSDoc documentation
4. Use toast for notifications
5. Use React Query hooks for data fetching

### Add a new API endpoint
1. Add to `src/services/api.js`
2. Create React Query hook in `src/hooks/`
3. Document with JSDoc
4. Handle errors with toast

### Style a component
1. Use Tailwind utility classes
2. Support dark mode with `dark:` prefix
3. Make responsive with `md:` `lg:` prefixes
4. Add hover/focus states

---

## 📚 Documentation

- **Toast System:** `TOAST_USAGE_EXAMPLES.md`
- **React Query:** `REACT_QUERY_USAGE.md`
- **Modernization:** `MODERNIZATION_COMPLETE.md`

---

## 🆘 Troubleshooting

### Toast not showing
- Check if `<Toaster />` is in App.jsx
- Verify import path is correct
- Check console for errors

### React Query not working
- Verify `QueryClientProvider` wraps app
- Check if hook is inside a component
- Look for errors in DevTools (bottom-right in dev)

### Dark mode not working
- Check if `dark` class is on `<html>` element
- Verify CSS variables are defined
- Test ThemeToggle component

### Styles not applying
- Check if Tailwind classes are correct
- Verify no CSS conflicts
- Run `npm run build` to see if it compiles

---

## 📞 Need Help?

1. Check documentation files
2. Review JSDoc in code
3. Check React Query DevTools (dev mode)
4. Check browser console for errors
5. Review `MODERNIZATION_COMPLETE.md`

---

**Generated with Claude Code**
