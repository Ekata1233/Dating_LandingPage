"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type ModalType = "booking" | "share" | null;
type PaymentMethod = "upi" | "card" | "wallet";

export default function EventDetails() {
  const router = useRouter();

  const [modal, setModal] = useState<ModalType>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [guestName, setGuestName] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    alert(
      "Booking confirmed! Payment gateway would redirect to UPI/Card processor."
    );

    setModal(null);
  };

  const handleShare = async (type: string) => {
    const url = window.location.href;

    if (type === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        alert("Event link copied!");
      } catch {
        alert("Unable to copy the link.");
      }

      return;
    }

    if (type === "whatsapp") {
      const message = encodeURIComponent(
        "Check out this Welvors event: " + url
      );

      window.open(
        `https://wa.me/?text=${message}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (type === "twitter") {
      const text = encodeURIComponent(
        "Check out this event on Welvors!"
      );

      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
          url
        )}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (type === "instagram") {
      try {
        await navigator.clipboard.writeText(url);
        alert(
          "Event link copied. You can now share it on Instagram."
        );
      } catch {
        alert("Unable to copy the event link.");
      }
    }
  };

  const faqs = [
    {
      question: "🔒 How is this event safe?",
      answer:
        "All attendees are verified members with confirmed ID, phone, and background checks. Welvors team is present throughout. Trust-first environment only.",
    },
    {
      question:
        "👤 Can I bring a friend who's not on Welvors?",
      answer:
        "No, this is exclusive to verified Welvors members. Your friend can join Welvors first!",
    },
    {
      question: "📍 Will my attendance be visible to others?",
      answer:
        "No, your attendance is private. You'll only be visible to other attendees at the event.",
    },
    {
      question: "💬 Can I contact the host before the event?",
      answer:
        "Yes, you'll receive the host's contact details and a Welvors event guide 24 hours before the event.",
    },
  ];

  return (
    <main
      className={`${dmSans.className} min-h-screen bg-[#FAF7F2] text-[#1F1B24] pt-17`}
    >
      
    </main>
  );
}