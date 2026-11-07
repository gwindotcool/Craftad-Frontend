import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // or useRouter if Next.js router

export function AppShell({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleUnauthorized = () => {
            // Automatically redirect when the 401 interceptor fires in api.js
            navigate('/auth'); // points to your Auth.jsx page
        };

        window.addEventListener("craftad:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("craftad:unauthorized", handleUnauthorized);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Navigation header and layout shell */}
            {children}
        </div>
    );
}