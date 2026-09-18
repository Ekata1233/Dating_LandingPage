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
      {/* ==================== HEADER ==================== */}
      <header className=" z-[100] border-b border-[#EEE6E6] bg-white shadow-[0_1px_3px_rgba(40,20,60,0.05),0_8px_26px_rgba(60,30,90,0.1)]">
        <div className="mx-auto flex h-[60px] max-w-[1400px] items-center px-5 ">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="cursor-pointer border-0 bg-transparent p-2 text-2xl leading-none text-[#E85A7A] transition hover:text-[#C73A5E]"
          >
            ←
          </button>

          {/* Title */}
          <div className="flex-1 text-center text-[18px] font-extrabold">
            Event Details
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={() => setModal("share")}
            aria-label="Share event"
            className="cursor-pointer border-0 bg-transparent p-2 text-xl leading-none text-[#5E5760] transition hover:text-[#E85A7A]"
          >
            ↗
          </button>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="flex h-[220px] w-full items-center justify-center bg-gradient-to-br from-[#FFE7EC] to-[#FFF4E0] text-sm text-[#5E5760] sm:h-[300px]">
        [Event Hero Image]
      </section>

      {/* ==================== CONTENT ==================== */}
      <div className="mx-auto max-w-[1400px] px-5 pb-20">
        <div className="relative z-10 -mt-[30px] mb-8 rounded-[20px] bg-white p-5 shadow-[0_1px_3px_rgba(40,20,60,0.05),0_8px_26px_rgba(60,30,90,0.1)] sm:-mt-10 sm:p-6">
          {/* ==================== EVENT HEADER ==================== */}
          <div className="mb-6 border-b border-[#EEE6E6] pb-6">
            <h1 className="mb-3 text-[22px] font-extrabold leading-tight sm:text-[28px]">
              Singles Mixer — Pune
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#5E5760]">
              <div className="flex items-center gap-1.5">
                <span className="text-base text-[#E85A7A]">📅</span>
                <span>Sat, 15 Feb 2025</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-base text-[#E85A7A]">🕐</span>
                <span>7:00 PM – 10:00 PM</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-base text-[#E85A7A]">📍</span>
                <span>The Pulse, Koregaon Park</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-block rounded-full bg-[#FFE7EC] px-4 py-2 text-sm font-extrabold text-[#C73A5E]">
                ₹599 per person
              </span>
            </div>
          </div>

          {/* ==================== ABOUT ==================== */}
          <section className="mb-8">
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              About This Event
            </h2>

            <p className="text-[15px] leading-[1.8] text-[#5E5760]">
              Join verified singles in Pune for a curated evening of
              conversations, games, and genuine connections. Pre-verified
              attendees, verified IDs, and trust-first vibes. No pressure,
              no awkwardness — just real people looking for real
              connections.
            </p>
          </section>

          {/* ==================== WHY ATTEND ==================== */}
          <div className="mb-5 rounded-lg border-l-4 border-[#E8A53D] bg-[#FFF4E0] p-4">
            <div className="mb-1.5 font-extrabold">
              ✓ Why Attend
            </div>

            <p className="text-sm text-[#5E5760]">
              Pre-verified members only · Trust-first environment ·
              Hosted by Welvors team · Free refreshments · Fun
              icebreaker activities
            </p>
          </div>

          {/* ==================== EVENT SCHEDULE ==================== */}
          <section className="mb-8">
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              Event Schedule
            </h2>

            <ul className="m-0 list-none p-0">
              <li className="mb-3 rounded-xl border-l-4 border-[#E85A7A] bg-[#F4EFE7] p-4">
                <div className="mb-1.5 font-extrabold">
                  7:00 PM – Arrivals &amp; Check-in
                </div>

                <div className="text-sm text-[#5E5760]">
                  Verified member check-in, welcome refreshments
                </div>
              </li>

              <li className="mb-3 rounded-xl border-l-4 border-[#E85A7A] bg-[#F4EFE7] p-4">
                <div className="mb-1.5 font-extrabold">
                  7:30 PM – Icebreaker Activity
                </div>

                <div className="text-sm text-[#5E5760]">
                  Speed dating round (5 min × 3 rounds)
                </div>
              </li>

              <li className="mb-3 rounded-xl border-l-4 border-[#E85A7A] bg-[#F4EFE7] p-4">
                <div className="mb-1.5 font-extrabold">
                  8:30 PM – Open Networking
                </div>

                <div className="text-sm text-[#5E5760]">
                  Free-flowing conversations, games, refreshments
                </div>
              </li>

              <li className="mb-3 rounded-xl border-l-4 border-[#E85A7A] bg-[#F4EFE7] p-4">
                <div className="mb-1.5 font-extrabold">
                  10:00 PM – Event Ends
                </div>

                <div className="text-sm text-[#5E5760]">
                  Exchange numbers with matches, see you next time!
                </div>
              </li>
            </ul>
          </section>

          {/* ==================== ATTENDEES ==================== */}
          <section className="mb-8">
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              Attendees
            </h2>

            <div className="mb-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#E8F8EF] px-3.5 py-2 text-[13px] font-bold text-[#2EAF6B]">
                👩 28 F, Marketing
              </span>

              <span className="rounded-full bg-[#E8F8EF] px-3.5 py-2 text-[13px] font-bold text-[#2EAF6B]">
                👨 32 M, Tech
              </span>

              <span className="rounded-full bg-[#E8F8EF] px-3.5 py-2 text-[13px] font-bold text-[#2EAF6B]">
                👩 26 F, Finance
              </span>

              <span className="rounded-full bg-[#E8F8EF] px-3.5 py-2 text-[13px] font-bold text-[#2EAF6B]">
                👨 29 M, Design
              </span>

              <span className="rounded-full bg-[#E8F8EF] px-3.5 py-2 text-[13px] font-bold text-[#2EAF6B]">
                +12 more verified
              </span>
            </div>
          </section>

          {/* ==================== WHAT TO BRING ==================== */}
          <section className="mb-8">
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              What to Bring
            </h2>

            <p className="text-[15px] leading-[1.8] text-[#5E5760]">
              Valid ID (for verification) · A smile · Open mind ·
              Ready to meet genuine people
            </p>
          </section>

          {/* ==================== CANCELLATION ==================== */}
          <section className="mb-8">
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              Cancellation Policy
            </h2>

            <p className="text-[15px] leading-[1.8] text-[#5E5760]">
              Free cancellation until 24 hours before the event. After
              that, 50% refund applies. No-shows will be noted in your
              profile history.
            </p>
          </section>

          {/* ==================== FAQ ==================== */}
          <section>
            <h2 className="mb-4 text-base font-extrabold uppercase tracking-[0.05em]">
              FAQs
            </h2>

            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={index}
                  className="mb-5 border-b border-[#EEE6E6] pb-5"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left font-extrabold text-[#1F1B24]"
                  >
                    <span>{faq.question}</span>

                    <span
                      className={`ml-4 shrink-0 text-lg text-[#E85A7A] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ↓
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen
                        ? "mt-2 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm leading-[1.7] text-[#5E5760]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ==================== ACTION BUTTONS ==================== */}
          <div className="mt-8 flex flex-col gap-3 border-t border-[#EEE6E6] pt-8 sm:flex-row">
            <button
              type="button"
              onClick={() => setModal("booking")}
              className="h-[50px] min-w-0 flex-1 cursor-pointer rounded-xl border-0 bg-[#E85A7A] px-7 text-[15px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#C73A5E]"
            >
              Book Now — ₹599
            </button>

            <button
              type="button"
              onClick={() => setModal("share")}
              className="h-[50px] min-w-0 flex-1 cursor-pointer rounded-xl border-0 bg-[#F4EFE7] px-7 text-[15px] font-extrabold text-[#1F1B24] transition hover:bg-[#E8DFD3]"
            >
              Share Event
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOOKING MODAL */}
      {/* ========================================================= */}
      {modal === "booking" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[80vh] w-full max-w-[500px] overflow-y-auto rounded-[20px] bg-white p-6 sm:p-8">
            {/* Close */}
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Close booking modal"
              className="absolute right-5 top-4 cursor-pointer border-0 bg-transparent text-3xl font-light text-[#5E5760] transition hover:text-[#1F1B24]"
            >
              ×
            </button>

            <h2 className="mb-5 pr-8 text-2xl font-extrabold">
              Confirm Your Booking
            </h2>

            <form onSubmit={handleBooking}>
              {/* Guest Name */}
              <div className="mb-5">
                <label
                  htmlFor="guest-name"
                  className="mb-2 block text-sm font-bold"
                >
                  Guest Name
                </label>

                <input
                  id="guest-name"
                  type="text"
                  placeholder="Your full name"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-11 w-full rounded-[10px] border-[1.5px] border-[#EEE6E6] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#9A9298] focus:border-[#E85A7A]"
                />
              </div>

              {/* Dietary Preference */}
              <div className="mb-5">
                <label
                  htmlFor="dietary-preference"
                  className="mb-2 block text-sm font-bold"
                >
                  Dietary Preference
                </label>

                <select
                  id="dietary-preference"
                  required
                  value={dietaryPreference}
                  onChange={(e) =>
                    setDietaryPreference(e.target.value)
                  }
                  className="h-11 w-full rounded-[10px] border-[1.5px] border-[#EEE6E6] bg-white px-3.5 text-sm outline-none transition focus:border-[#E85A7A]"
                >
                  <option value="">Select one</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              {/* Special Requirements */}
              <div className="mb-5">
                <label
                  htmlFor="special-requirements"
                  className="mb-2 block text-sm font-bold"
                >
                  Any Special Requirements?
                </label>

                <textarea
                  id="special-requirements"
                  placeholder="e.g., Allergies, mobility needs..."
                  value={specialRequirements}
                  onChange={(e) =>
                    setSpecialRequirements(e.target.value)
                  }
                  className="min-h-[100px] w-full resize-y rounded-[10px] border-[1.5px] border-[#EEE6E6] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#9A9298] focus:border-[#E85A7A]"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-5 rounded-lg border-l-4 border-[#E8A53D] bg-[#FFF4E0] p-4">
                <div className="mb-3 font-extrabold">
                  Payment Method
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`cursor-pointer rounded-[10px] border-2 p-4 text-center text-[13px] font-bold transition ${
                      paymentMethod === "upi"
                        ? "border-[#E85A7A] bg-[#FFE7EC]"
                        : "border-[#EEE6E6] bg-white hover:border-[#E85A7A]"
                    }`}
                  >
                    💳 UPI
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`cursor-pointer rounded-[10px] border-2 p-4 text-center text-[13px] font-bold transition ${
                      paymentMethod === "card"
                        ? "border-[#E85A7A] bg-[#FFE7EC]"
                        : "border-[#EEE6E6] bg-white hover:border-[#E85A7A]"
                    }`}
                  >
                    🏦 Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`cursor-pointer rounded-[10px] border-2 p-4 text-center text-[13px] font-bold transition ${
                      paymentMethod === "wallet"
                        ? "border-[#E85A7A] bg-[#FFE7EC]"
                        : "border-[#EEE6E6] bg-white hover:border-[#E85A7A]"
                    }`}
                  >
                    🪙 Wallet
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg border-l-4 border-[#E8A53D] bg-[#FFF4E0] p-4">
                <div className="font-extrabold">Total Amount</div>

                <div className="mt-2 text-2xl font-extrabold text-[#E85A7A]">
                  ₹599
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-5 h-[50px] w-full cursor-pointer rounded-xl border-0 bg-[#E85A7A] px-7 text-[15px] font-extrabold text-white transition hover:bg-[#C73A5E]"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SHARE MODAL */}
      {/* ========================================================= */}
      {modal === "share" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-[500px] rounded-[20px] bg-white p-6 sm:p-8">
            {/* Close */}
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Close share modal"
              className="absolute right-5 top-4 cursor-pointer border-0 bg-transparent text-3xl font-light text-[#5E5760] transition hover:text-[#1F1B24]"
            >
              ×
            </button>

            <h2 className="pr-8 text-2xl font-extrabold">
              Share Event
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="h-11 cursor-pointer rounded-xl border-0 bg-[#F4EFE7] font-extrabold text-[#1F1B24] transition hover:bg-[#E8DFD3]"
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => handleShare("instagram")}
                className="h-11 cursor-pointer rounded-xl border-0 bg-[#F4EFE7] font-extrabold text-[#1F1B24] transition hover:bg-[#E8DFD3]"
              >
                Instagram
              </button>

              <button
                type="button"
                onClick={() => handleShare("twitter")}
                className="h-11 cursor-pointer rounded-xl border-0 bg-[#F4EFE7] font-extrabold text-[#1F1B24] transition hover:bg-[#E8DFD3]"
              >
                Twitter
              </button>

              <button
                type="button"
                onClick={() => handleShare("copy")}
                className="h-11 cursor-pointer rounded-xl border-0 bg-[#F4EFE7] font-extrabold text-[#1F1B24] transition hover:bg-[#E8DFD3]"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}