// src/components/ui/GlobalStyles.jsx
// Mount this ONCE at the app root (inside <App /> or <Layout />)
// to inject keyframes, Inter font import, and global base styles.
//
// Usage in App.jsx:
//   import GlobalStyles from './components/ui/GlobalStyles'
//   function App() { return (<><GlobalStyles />{/* routes */}</>) }

export default function GlobalStyles() {
  return (
    <style>{`
      /* Inter via Google Fonts — if you prefer self-hosted, swap for your asset pipeline */
      @import url('https://rsms.me/inter/inter.css');

      :root {
        font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      /* Minimal resets that play nice with inline styles */
      * { box-sizing: border-box; }
      body { margin: 0; font-family: inherit; color: #0F1F3D; background: #fff; }

      /* Focus ring for accessibility (inline styles can't do :focus-visible) */
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: 2px solid #1A6FE8;
        outline-offset: 2px;
      }

      /* Hover states for inputs/textareas/selects (inline styles can't do :focus) */
      input:focus,
      textarea:focus,
      select:focus {
        border-color: #1A6FE8 !important;
        box-shadow: 0 0 0 3px rgba(26, 111, 232, 0.12) !important;
      }

      /* Spinner keyframes — used by Button (when loading) and Spinner component */
      @keyframes chathouse-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      /* Placeholder styling */
      input::placeholder,
      textarea::placeholder { color: #94a3b8; }

      /* Remove default link underlines app-wide; components opt back in */
      a { color: inherit; text-decoration: none; }

      /* Scrollbar polish (optional) */
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 100px; }
      ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    `}</style>
  )
}
