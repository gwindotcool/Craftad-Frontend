import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme";

export function FloatingThemeToggle() {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleTheme}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-cream shadow-lg dark:bg-ink dark:border-white/20 text-ink dark:text-cream transition hover:border-copper hover:scale-105"
                aria-label="Toggle theme"
            >
                {darkMode ? <Sun size={20} className="text-copper" /> : <Moon size={20} className="text-ink" />}
            </button>
        </div>
    );
}