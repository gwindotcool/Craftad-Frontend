import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30, // 30s default so bids, job status, and wallet balances stay fresh
            gcTime: 1000 * 60 * 10, // Keep unused cache in memory for 10 mins
            refetchOnWindowFocus: true, // Revalidate immediately when user returns from Paystack/bank tab
            retry: 1,
        },
        mutations: {
            retry: 0, // Never auto-retry writes (prevents duplicate bids or double payouts)
        },
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>
);