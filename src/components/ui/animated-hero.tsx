import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveLeft, PhoneCall } from "lucide-react"; // Changed MoveRight to MoveLeft for RTL
import { Button } from "@/components/ui/button";

function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["מדויק", "מהיר", "חכם", "פשוט"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="w-full" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
                    <div>
                        <Button variant="secondary" size="sm" className="gap-4">
                            קרא עוד על השקת המערכת <MoveLeft className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-4 flex-col items-center">
                        <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
                            <span className="text-cyan-600 block mb-2">מחשבון הבגרויות החדש</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.2em] md:h-[1.1em]">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-semibold whitespace-nowrap"
                                        initial={{ opacity: 0, y: "100%" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? "-150%" : "150%",
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                            חישוב ממוצע בגרויות וסיכויי קבלה לאוניברסיטה מעולם לא היה פשוט יותר.
                            אנחנו כאן כדי לעזור לך להשיג את המטרות שלך, במינימום מאמץ ובמקסימום דיוק.
                        </p>
                    </div>
                    <div className="flex flex-row gap-3 mt-4">
                        <Button size="lg" className="gap-4" variant="outline" onClick={() => window.open('https://wa.me/972501234567', '_blank')}>
                            דבר איתנו <PhoneCall className="w-4 h-4" />
                        </Button>
                        <Button size="lg" className="gap-4" onClick={() => window.location.href = '/'}>
                            התחל עכשיו <MoveLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Hero };
