import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "craftad_theme";

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === "undefined") return false;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark") return true;
        if (saved === "light") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    // Sync DOM class and mobile browser bar color
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", darkMode);

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", darkMode ? "#14110F" : "#F5F0E8");
        }
    }, [darkMode]);

    // Follow OS changes ONLY if the user hasn't set an explicit preference
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setDarkMode(e.matches);
            }
        };
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used inside a ThemeProvider");
    }
    return ctx;
}