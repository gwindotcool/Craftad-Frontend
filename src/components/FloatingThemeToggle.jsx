import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";

export function FloatingThemeToggle({ className = "" }) {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-cream/90 text-ink shadow-raised backdrop-blur-md transition-all hover:scale-105 hover:border-copper focus:outline-none focus:ring-2 focus:ring-copper/30 active:scale-95"
            >
                {darkMode ? (
                    <Sun size={20} className="text-copper" />
                ) : (
                    <Moon size={20} className="text-ink" />
                )}
            </button>
        </div>
    );
}