import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// 1. Import React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";

// 2. Initialize the Query Client with global defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Cache data for 5 minutes before refetching
            retry: 1, // Only retry failed requests once to avoid spamming the backend
        },
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        {/* 3. Wrap your router and app with the Provider */}
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);