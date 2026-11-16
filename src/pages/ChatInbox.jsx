import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ChatLauncher } from "../components/ChatLauncher";

export function ChatInbox() {
    return (
        <div className="space-y-4 pb-10">
            <div>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted no-underline transition hover:text-copper"
                >
                    <ArrowLeft size={15} />
                    <span>Back to overview</span>
                </Link>
            </div>

            <ChatLauncher fullPage={true} />
        </div>
    );
}