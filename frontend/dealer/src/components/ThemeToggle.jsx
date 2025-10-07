import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  // Start with null to avoid hydration mismatch
  const [isDark, setIsDark] = useState(null);

  useEffect(() => {
    // Initialize theme after hydration - this matches the inline script in index.html
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
      setIsDark(theme === 'dark');
      
      // Ensure DOM class matches state (should already be set by inline script)
      document.documentElement.classList.toggle('dark', theme === 'dark');

      // Listen for system theme changes when no manual preference is set
      if (!stored) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
          if (!localStorage.getItem('theme')) {
            setIsDark(e.matches);
            document.documentElement.classList.toggle('dark', e.matches);
          }
        };
        
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      }
    } catch {
      // Fallback to light mode if localStorage is unavailable
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch {
      console.warn('Unable to save theme preference');
    }
  };

  // Show loading state until theme is initialized
  if (isDark === null) {
    return (
      <div className="p-1 rounded-full ml-2 opacity-50">
        <div className="w-12 h-6 bg-slate-200 dark:bg-slate-600 rounded-full relative transition-all duration-300 p-0.5">
          <div className="w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md flex items-center justify-center text-xs">
            ⚪
          </div>
        </div>
      </div>
    );
  }

  return (
    <button 
      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50" 
      onClick={toggleTheme}
      aria-label={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
      title={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
    >
      <div className="w-12 h-6 bg-slate-200 dark:bg-primary-600 rounded-full relative transition-all duration-300 p-0.5">
        <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md flex items-center justify-center text-xs transform ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;