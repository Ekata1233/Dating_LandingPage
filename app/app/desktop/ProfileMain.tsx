import React, { useRef } from 'react'

import { FactIcon } from "../shared/factIcons";
import { MOCK_MY_PROFILE } from "../shared/mockData";
import type { Profile } from "../shared/types";

export interface ProfileMainProps {
    /** The profile being shown. Defaults to the logged-in user. */
    profile?: Profile;
    /**
     * Fill the parent edge to edge instead of rendering the 300px desktop frame.
     */
    fluid?: boolean;
    /** Called when the expand button is tapped. */
    onExpand?: (profileId: string) => void;
}

function ProfileMain({ profile = MOCK_MY_PROFILE, fluid = false, onExpand }: ProfileMainProps) {
    const cardScrollRef = useRef<HTMLDivElement>(null);

    const openProfile = () => {
        onExpand?.(profile.id);
        const el = cardScrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    };

    const facts = [
        { label: "Distance", value: profile.distance },
        { label: "Height", value: profile.height },
        { label: "Location", value: profile.location },
        { label: "Looking for", value: profile.lookingFor },
        { label: "Religion", value: profile.religion },
        { label: "Occupation", value: profile.occupation },
        { label: "Education", value: profile.education },
    ];
    const gallery = profile.gallery?.length ? profile.gallery : [profile.image];

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Profile card */}
                <div
                    className={`absolute ${fluid ? "inset-0" : "w-[320px] sm:w-[300px] h-[480px] sm:h-[520px]"} rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out`}
                >
                    {/* Scrollable content – scroll down to view full profile */}
                    <div ref={cardScrollRef} className="h-full overflow-y-auto scrollbar-hide overscroll-contain">
                        {/* Photo – full card height */}
                        <div className="relative h-full shrink-0">
                            <img
                                src={profile.image}
                                alt={profile.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            {/* Info overlay – bottom */}
                            <div className="absolute bottom-16 left-0 right-0 p-5 z-10">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
                                            {profile.name}
                                            <span className="ml-2 font-normal text-white/80">{profile.age}</span>
                                        </h2>
                                        <p className="text-sm text-white/60 mt-1">{profile.bio}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openProfile}
                                        aria-label="View full profile"
                                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 8v8M8 12h8" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-1.5 text-white/55 text-[11px]">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                    Scroll down to view profile
                                </div>
                            </div>
                        </div>

                        {/* Details – white panel */}
                        <div className="flex flex-col gap-2 bg-white px-5 pb-36 pt-4" >
                            <div>
                                <h3 className="text-[11px] font-bold tracking-[0.15em]  text-amber-950">ABOUT</h3>
                                <p className="mt-2 text-[13px] leading-relaxed text-[#5F5A55]">{profile.about}</p>
                            </div>
                            {/* BASICS */}
                            <div className="mt-3 ">
                                <h3 className="text-[11px] m-2 font-bold tracking-[0.15em]  text-blue-700">BASICS</h3>
                                <div className='grid grid-cols-2 gap-2.5'>
                                    {facts.map((f) => (
                                        <div key={f.label} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                                            <div className="text-[10px] uppercase tracking-wider text-[#9C948C]">{f.label}</div>
                                            <div className="mt-0.5 text-[12px] font-semibold text-[#2B2A28] truncate">{f.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* GALLERY IMG 1 */}
                            <div><img className="rounded-2xl w-full" src={gallery[0]} alt={`${profile.name} photo 1`} loading="lazy" /></div>
                            {/* INTERESTS */}
                            <div className="mt-5">
                                <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#9C948C]">INTERESTS</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {profile.interests.map((interest, index) => (
                                        <span key={index} className="px-3 py-1 rounded-full border border-gray-300 text-[12px] text-[#5F5A55]">
                                            {interest.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* GALLERY IMG 2 */}
                            <div><img className="rounded-2xl w-full" src={gallery[1 % gallery.length]} alt={`${profile.name} photo 2`} loading="lazy" /></div>
                            {/* CAREER AND AMBITION */}
                            <div className="mt-5">
                                <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#9C948C]">CAREER</h3>
                                <div className="mt-2 grid  gap-2">
                                    {profile.career.map((c, index) => (
                                        <span key={index} className="bg-slate-50 px-3 py-2 rounded-[12px]  text-[12px] text-[#5F5A55] flex items-center gap-2">
                                            <div className='bg-amber-100 rounded-full px-1 py-1 text-amber-800'><FactIcon name={c.icon} className="text-amber-800" /></div>
                                            <div>
                                                <div className='text-black'>{c.label}</div>
                                                <div className='text-[10px]'>{c.value}</div>
                                            </div>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* GALLERY IMG 3 */}
                            <div><img className="rounded-2xl w-full" src={gallery[2 % gallery.length]} alt={`${profile.name} photo 3`} loading="lazy" /></div>
                            {/* LIFESTYLE */}
                            <div className="mt-5">
                                <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#9C948C]">LIFESTYLE</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {profile.lifestyle.map((l, index) => (
                                        <span key={index} className="bg-slate-50 px-3 py-2 rounded-[12px]  text-[12px] text-[#5F5A55] flex items-center gap-2">
                                            <div className='bg-green-100 rounded-full px-1 py-1 text-green-800'><FactIcon name={l.icon} className="text-green-800" /></div>
                                            <div>
                                                <div className='text-black'
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>{l.label}
                                                </div>
                                                <div className='text-[10px]'
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>{l.value}</div>
                                            </div>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    )
}

export default ProfileMain