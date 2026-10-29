import Navbar from "../../pages/landing/Navbar";

import Hero from "./Hero.jsx";
import ServiceCards from "./ServiceCards.jsx";
import HowItWorks from "./HowItWorks.jsx";
import TrustSection from "./TrustSection.jsx";
import Stats from "./Stats.jsx";


export default function LandingPage({ onLogin }) {

    return (
        <>
            <Navbar onLogin={onLogin} />

            <Hero onLogin={onLogin}/>

            <ServiceCards />

            <HowItWorks />

            <TrustSection />

            <Stats />
        </>
    )
}