import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("craftad_theme") === "dark" ||
            (!localStorage.getItem("craftad_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("craftad_theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("craftad_theme", "light");
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}