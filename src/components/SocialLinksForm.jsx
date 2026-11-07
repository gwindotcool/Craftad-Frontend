import { useState } from 'react';
// Updated import path to match your Vite structure
import { craftad, ApiError, loadSession } from '../api.js';
import { toast } from 'react-hot-toast'; // Or your preferred toast library

export function SocialLinksForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [links, setLinks] = useState({ whatsapp: '', instagram: '', facebook: '', x: '' });

    const handleSave = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const { token } = loadSession();

        try {
            // Make sure updateProfile exists in your api.js craftad object
            await craftad.updateProfile(token, { socialLinks: links });
            toast.success("Social links updated successfully");
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    toast.error(`Validation failed: ${error.message}`);
                } else {
                    toast.error(error.message);
                }
            } else {
                toast.error("A critical error occurred while saving.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="WhatsApp number"
                    value={links.whatsapp}
                    onChange={(e) => setLinks({...links, whatsapp: e.target.value})}
                    className="border p-2 rounded w-full bg-gray-50"
                />
                <input
                    type="text"
                    placeholder="Instagram username"
                    value={links.instagram}
                    onChange={(e) => setLinks({...links, instagram: e.target.value})}
                    className="border p-2 rounded w-full bg-gray-50"
                />
                <input
                    type="text"
                    placeholder="Facebook page or profile"
                    value={links.facebook}
                    onChange={(e) => setLinks({...links, facebook: e.target.value})}
                    className="border p-2 rounded w-full bg-gray-50"
                />
                <input
                    type="text"
                    placeholder="X username"
                    value={links.x}
                    onChange={(e) => setLinks({...links, x: e.target.value})}
                    className="border p-2 rounded w-full bg-gray-50"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`bg-black text-white px-6 py-2 rounded-full ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
                {isLoading ? 'Saving...' : 'Save social links'}
            </button>
        </form>
    );
}