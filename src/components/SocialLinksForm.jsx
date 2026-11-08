import { useState } from 'react';
import { craftad, ApiError, loadSession } from '../api.js';
import { toast } from 'react-hot-toast';
import { Share2, Check, Loader2 } from 'lucide-react';

export function SocialLinksForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [links, setLinks] = useState({ whatsapp: '', instagram: '', facebook: '', x: '' });

    const handleSave = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const { token } = loadSession();

        try {
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

    const field = "min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 shadow-sm placeholder:text-muted/70";

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">WhatsApp</label>
                    <input
                        type="text"
                        placeholder="WhatsApp number"
                        value={links.whatsapp}
                        onChange={(e) => setLinks({...links, whatsapp: e.target.value})}
                        className={field}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Instagram</label>
                    <input
                        type="text"
                        placeholder="Instagram username"
                        value={links.instagram}
                        onChange={(e) => setLinks({...links, instagram: e.target.value})}
                        className={field}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Facebook</label>
                    <input
                        type="text"
                        placeholder="Facebook page or profile"
                        value={links.facebook}
                        onChange={(e) => setLinks({...links, facebook: e.target.value})}
                        className={field}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">X (Twitter)</label>
                    <input
                        type="text"
                        placeholder="X username"
                        value={links.x}
                        onChange={(e) => setLinks({...links, x: e.target.value})}
                        className={field}
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-cream transition-all hover:bg-copper shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving links...</span>
                        </>
                    ) : (
                        <>
                            <Share2 size={16} />
                            <span>Save social links</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}