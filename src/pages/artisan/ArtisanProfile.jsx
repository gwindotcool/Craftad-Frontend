import { useState, useEffect } from "react";
import { C, arr, extract, SKILLS } from "../../theme";
import { api } from "../../api";
import { Btn, Inp, Tex, Card, Spinner, Toast } from "../../components/ui";

export default function ArtisanProfile({ token }) {

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [f, setF]             = useState({ skills: [], yearsOfExperience: "", bio: "", serviceAreas: "", serviceRadiusKm: "10", lat: "", lng: "" });
    const [toast, setToast]     = useState(null);
    const upd = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
    const toggleSkill = (skill) => setF((p) => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter((s) => s !== skill) : [...p.skills, skill] }));

    useEffect(() => {
        api.get("/api/artisans/me", token)
            .then((d) => {
                const p = extract(d, "artisan", "profile", "data");
                setProfile(p);
                setF({ skills: arr(p?.skills), yearsOfExperience: p?.yearsOfExperience || "", bio: p?.bio || "", serviceAreas: arr(p?.serviceAreas).join(", "), serviceRadiusKm: p?.serviceRadiusKm || "10", lat: p?.location?.coordinates?.[1] || "", lng: p?.location?.coordinates?.[0] || "" });
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [token]);

    const geolocate = () => navigator.geolocation?.getCurrentPosition((pos) => setF((p) => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude })));

    const save = async () => {
        if (f.skills.length === 0) {
            setToast({ msg: "Select at least one skill.", type: "error" });
            return;
        }

        if (!f.lat || !f.lng) {
            setToast({ msg: "Location is required.", type: "error" });
            return;
        }

        setSaving(true);

        const payload = {
            skills: f.skills,
            yearsOfExperience: Number(f.yearsOfExperience) || 0,
            bio: f.bio,
            serviceAreas: f.serviceAreas
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            serviceRadiusKm: Number(f.serviceRadiusKm) || 10,
            location: {
                type: "Point",
                coordinates: [
                    Number(f.lng),
                    Number(f.lat)
                ]
            }
        };

        // 👇 Check what is being sent
        console.log("Sending payload:", payload);

        try {
            if (profile) {
                await api.patch(
                    "/api/artisans/update",
                    payload,
                    token
                );
            } else {
                await api.post(
                    "/api/artisans/create",
                    payload,
                    token
                );
            }

            setToast({
                msg: "Profile saved!",
                type: "success"
            });

        } catch (e) {
            setToast({
                msg: e.message,
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;
    return (
        <div style={{ maxWidth: 580 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>{profile ? "My Artisan Profile" : "Set Up Your Profile"}</h2>
            <p style={{ color: C.muted, marginBottom: 22, fontSize: 14 }}>Complete your profile to start receiving job matches near you.</p>
            {profile && (
                <Card style={{ marginBottom: 18, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <div style={{ fontWeight: 700, color: C.success, marginBottom: 4 }}>✅ Profile Active</div>
                    <div style={{ fontSize: 13, color: C.muted, display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span>⭐ {profile.ratingAverage?.toFixed(1) || "0.0"} rating</span>
                        <span>🏆 {profile.totalJobsCompleted || 0} jobs</span>
                        <span>🏅 {profile.verificationLevel}</span>
                    </div>
                </Card>
            )}
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: C.text }}>Your Skills</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {SKILLS.map((skill) => (
                            <button key={skill} onClick={() => toggleSkill(skill)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${f.skills.includes(skill) ? C.accent : C.border}`, background: f.skills.includes(skill) ? C.accent + "15" : "#fff", color: f.skills.includes(skill) ? C.accent : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                                {skill.charAt(0).toUpperCase() + skill.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <Inp label="Years of Experience" type="number" placeholder="e.g. 5" value={f.yearsOfExperience} onChange={upd("yearsOfExperience")} />
                <Tex label="Bio" placeholder="Tell customers about your expertise…" value={f.bio} onChange={upd("bio")} />
                <Inp label="Service Areas (comma-separated)" placeholder="e.g. Ikeja, Surulere, Lekki" value={f.serviceAreas} onChange={upd("serviceAreas")} />
                <Inp label="Service Radius (km)" type="number" placeholder="10" value={f.serviceRadiusKm} onChange={upd("serviceRadiusKm")} />
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: C.text }}>Your Location</label>
                    <Btn variant="ghost" size="sm" onClick={geolocate} style={{ marginBottom: 10 }}>📍 Use My Current Location</Btn>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Inp label="Latitude"  type="number" placeholder="6.5244" value={f.lat} onChange={upd("lat")} />
                        <Inp label="Longitude" type="number" placeholder="3.3792" value={f.lng} onChange={upd("lng")} />
                    </div>
                    {f.lat && f.lng && <div style={{ fontSize: 12, color: C.success, marginTop: -8 }}>✅ Location set</div>}
                </div>
                <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : profile ? "💾 Save Changes" : "🚀 Create Profile"}</Btn>
            </Card>
            <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
        </div>
    );
}
