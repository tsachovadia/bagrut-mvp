import { Hero } from "@/components/ui/animated-hero";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function CampaignMobileFirst() {
    return (
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
            <Header />
            <div className="flex-grow">
                <Hero />
            </div>
            <Footer />
        </div>
    );
}
