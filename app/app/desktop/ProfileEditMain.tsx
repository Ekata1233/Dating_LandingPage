import React, { useState, useCallback, ChangeEvent } from "react";

/**
 * ProfileEditCard
 * ----------------------------------------------------------------------
 * A fully self-contained, parent-size-driven profile editing form.
 *
 * Sizing philosophy:
 *  - The root element uses CSS `container-type: size`, which means every
 *    child that sizes itself in `cqw` / `cqh` / `cqmin` units scales
 *    relative to the ACTUAL rendered width/height of whatever parent box
 *    this component is dropped into — not the viewport.
 *  - No pixel values are used anywhere for spacing, radius, or font-size.
 *    Everything is `clamp(min, preferred-in-cq-units, max)` so text and
 *    controls never get illegibly small or comically large, but always
 *    track the parent's dimensions.
 *  - Drop this component into a 300px-wide sidebar or a 1200px-wide
 *    modal and it reflows/rescales itself automatically — just give the
 *    parent an explicit width/height (or flex/grid sizing), since a
 *    container needs a resolved size for container queries to work.
 *
 * Sections, in the order supplied by the reference screenshots:
 *   1. About You            (bio, intentions, basic details)
 *   2. Who You're Seeing    (interested in, orientation, lifestyle)
 *   3. Career & Ambition
 *   4. Family
 *   5. Interests & Hobbies, Profile Prompts, Location
 *
 * Usage:
 *   <div style={{ width: 380, height: 700 }}>
 *     <ProfileEditCard onSave={(data) => console.log(data)} />
 *   </div>
 */

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export interface ProfilePrompt {
    id: string;
    question: string;
    answer: string;
}

export interface ProfileFormData {
    bio: string;
    lookingFor: string;
    intentionNote: string;
    fullName: string;
    email: string;
    dob: string;

    interestedIn: string;
    sexualOrientation: string;
    drinking: string;
    smoking: string;
    workout: string;
    diet: string;
    travel: string;

    college: string;
    highestEducation: string;
    degree: string;
    graduationYear: string;
    workAs: string;
    company: string;
    experience: string;
    employmentType: string;

    familyType: string;
    father: string;
    mother: string;
    sisters: string;
    brothers: string;
    familyHome: string;
    nativePlace: string;
    familyIncome: string;

    interests: string[];
    prompts: ProfilePrompt[];
    areaNeighbourhood: string;
    city: string;
}

export interface ProfileEditCardProps {
    initialData?: Partial<ProfileFormData>;
    /** May return a promise; the button shows a busy state until it settles. */
    onSave?: (data: ProfileFormData) => void | Promise<unknown>;
    bioMaxLength?: number;
    /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
    fluid?: boolean;
    /** Shows a busy state and disables the Save button. */
    saving?: boolean;
}

// ---------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------

const defaultData: ProfileFormData = {
    bio: "love to travel",
    lookingFor: "Life partner",
    intentionNote: "Ready to settle down and build a life together.",
    fullName: "Sanyogeeta Deshmukh",
    email: "sanyogeetadeshmukh9898@gmail.com",
    dob: "2002-09-15",

    interestedIn: "Men",
    sexualOrientation: "Straight",
    drinking: "Never",
    smoking: "Never",
    workout: "Rarely",
    diet: "Vegetarian",
    travel: "Love to travel",

    college: "VIT",
    highestEducation: "Undergraduate",
    degree: "BCS",
    graduationYear: "2025",
    workAs: "Engineer",
    company: "FTLF",
    experience: "0-1 year",
    employmentType: "Full-time",

    familyType: "Joint Family",
    father: "Government Job",
    mother: "Homemaker",
    sisters: "None",
    brothers: "None",
    familyHome: "Own House",
    nativePlace: "Other",
    familyIncome: "Above ₹20 Lakh",

    interests: [],
    prompts: [
        { id: "p1", question: "fgggggggggggggggg", answer: "Hello" },
        { id: "p2", question: "hgfghdghfghddfgdfg", answer: "Be kind" },
    ],
    areaNeighbourhood: "Hadapsar",
    city: "Pune",
};

// ---------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------

const SectionHeading: React.FC<{ icon: string; label: string }> = ({
    icon,
    label,
}) => (
    <div className="pec-section-heading">
        <span className="pec-section-icon" aria-hidden="true">
            {icon}
        </span>
        <span>{label}</span>
    </div>
);

const FieldRow: React.FC<{
    label: string;
    value: string;
    name: string;
    type?: "text" | "email" | "date";
    onChange: (name: string, value: string) => void;
    sublabel?: string;
    divider?: boolean;
}> = ({ label, value, name, type = "text", onChange, sublabel, divider = true }) => (
    <div className={`pec-row ${divider ? "pec-row-divider" : ""}`}>
        <label className="pec-row-label" htmlFor={name}>
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            className="pec-row-input"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange(name, e.target.value)
            }
        />
        {sublabel && <div className="pec-row-sublabel">{sublabel}</div>}
    </div>
);

const SelectRow: React.FC<{
    label: string;
    value: string;
    name: string;
    options: string[];
    onChange: (name: string, value: string) => void;
    divider?: boolean;
}> = ({ label, value, name, options, onChange, divider = true }) => (
    <div className={`pec-row ${divider ? "pec-row-divider" : ""}`}>
        <label className="pec-row-label" htmlFor={name}>
            {label}
        </label>
        <select
            id={name}
            name={name}
            className="pec-row-input pec-row-select"
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
        >
            {!options.includes(value) && value && (
                <option value={value}>{value}</option>
            )}
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="pec-card">{children}</div>
);

// ---------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------

const ProfileEditCard: React.FC<ProfileEditCardProps> = ({
    initialData,
    onSave,
    bioMaxLength = 300,
    fluid = false,
    saving = false,
}) => {
    const [data, setData] = useState<ProfileFormData>({
        ...defaultData,
        ...initialData,
    });
    const [newInterest, setNewInterest] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const update = useCallback((name: string, value: string) => {
        setData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= bioMaxLength) {
            update("bio", e.target.value);
        }
    };

    const addInterest = () => {
        const trimmed = newInterest.trim();
        if (!trimmed) return;
        setData((prev) => ({ ...prev, interests: [...prev.interests, trimmed] }));
        setNewInterest("");
    };

    const removeInterest = (idx: number) => {
        setData((prev) => ({
            ...prev,
            interests: prev.interests.filter((_, i) => i !== idx),
        }));
    };

    const addPrompt = () => {
        setData((prev) => ({
            ...prev,
            prompts: [
                ...prev.prompts,
                { id: `p${Date.now()}`, question: "New prompt question", answer: "" },
            ],
        }));
    };

    const updatePrompt = (id: string, field: "question" | "answer", value: string) => {
        setData((prev) => ({
            ...prev,
            prompts: prev.prompts.map((p) =>
                p.id === id ? { ...p, [field]: value } : p
            ),
        }));
    };

    const removePrompt = (id: string) => {
        setData((prev) => ({
            ...prev,
            prompts: prev.prompts.filter((p) => p.id !== id),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void submit();
    };

    const submit = async () => {
        if (!onSave || isSaving || saving) return;
        setIsSaving(true);
        try {
            await onSave(data);
        } finally {
            setIsSaving(false);
        }
    };

    const busy = isSaving || saving;

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">

                {/* Profile card */}
                <div
                    className={fluid
                        ? "absolute inset-0 overflow-hidden"
                        : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "}>
                    <div className="pec-root">
                        <style>{`
        .pec-root {
          container-type: size;
          container-name: pec;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          overflow: hidden;
        }
        .pec-root * { box-sizing: border-box; }

        .pec-scroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding: clamp(0.75rem, 4cqw, 1.75rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.9rem, 5cqw, 1.75rem);
        }
        .pec-scroll::-webkit-scrollbar { width: clamp(4px, 1cqw, 8px); }
        .pec-scroll::-webkit-scrollbar-thumb {
          background: #f3c2ce; border-radius: 999px;
        }

        .pec-section-heading {
          display: flex;
          align-items: center;
          gap: clamp(0.35rem, 1.5cqw, 0.6rem);
          color: #e11d5e;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-size: clamp(0.62rem, 2.6cqw, 0.8rem);
          margin-bottom: clamp(0.35rem, 1.5cqw, 0.6rem);
        }
        .pec-section-icon {
          font-size: clamp(0.85rem, 3cqw, 1.1rem);
          line-height: 1;
        }

        .pec-card {
          border: 1px solid #ececec;
          border-radius: clamp(0.6rem, 2.5cqw, 1.1rem);
          background: #fff;
          overflow: hidden;
        }

        .pec-row {
          padding: clamp(0.55rem, 2.8cqw, 1.05rem) clamp(0.7rem, 3.2cqw, 1.2rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.15rem, 0.8cqw, 0.3rem);
          position: relative;
        }
        .pec-row-divider { border-bottom: 1px solid #f1f1f1; }
        .pec-row-label {
          font-size: clamp(0.55rem, 2.2cqw, 0.68rem);
          color: #9a9a9a;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .pec-row-input {
          border: none;
          outline: none;
          font-size: clamp(0.75rem, 3.2cqw, 1rem);
          font-weight: 600;
          color: #1a1a1a;
          background: transparent;
          font-family: inherit;
          width: 100%;
          padding: clamp(0.1rem, 0.6cqw, 0.2rem) 0;
        }
        .pec-row-input:focus {
          color: #e11d5e;
        }
        .pec-row-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b0b0b0' stroke-width='2'><path d='M9 6l6 6-6 6'/></svg>");
          background-repeat: no-repeat;
          background-position: right center;
          background-size: clamp(0.8rem, 3cqw, 1.1rem);
          cursor: pointer;
        }
        .pec-row-sublabel {
          font-size: clamp(0.55rem, 2.1cqw, 0.68rem);
          color: #b0b0b0;
        }
        .pec-row-textarea-wrap { position: relative; }
        .pec-row-textarea {
          border: none;
          outline: none;
          resize: none;
          width: 100%;
          font-family: inherit;
          font-size: clamp(0.75rem, 3.2cqw, 1rem);
          color: #1a1a1a;
          background: transparent;
          min-height: clamp(2.2rem, 12cqh, 5rem);
          line-height: 1.4;
        }
        .pec-row-textarea:focus { color: #e11d5e; }
        .pec-charcount {
          position: absolute;
          bottom: 0;
          right: 0;
          font-size: clamp(0.55rem, 2cqw, 0.68rem);
          color: #c7c7c7;
        }

        .pec-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(0.3rem, 1.5cqw, 0.55rem);
        }
        .pec-chip {
          display: flex;
          align-items: center;
          gap: clamp(0.2rem, 1cqw, 0.4rem);
          background: #fdeef1;
          color: #e11d5e;
          border-radius: 999px;
          padding: clamp(0.25rem, 1.4cqw, 0.45rem) clamp(0.5rem, 2.4cqw, 0.9rem);
          font-size: clamp(0.65rem, 2.6cqw, 0.85rem);
          font-weight: 600;
        }
        .pec-chip button {
          all: unset;
          cursor: pointer;
          font-size: clamp(0.7rem, 2.8cqw, 0.9rem);
          line-height: 1;
          color: #e11d5e;
        }
        .pec-add-interest-form {
          display: flex;
          gap: clamp(0.35rem, 1.6cqw, 0.6rem);
        }
        .pec-add-interest-input {
          flex: 1 1 auto;
          min-width: 0;
          border: 1px dashed #f3b9c8;
          border-radius: 999px;
          padding: clamp(0.35rem, 1.8cqw, 0.6rem) clamp(0.7rem, 3cqw, 1rem);
          font-size: clamp(0.7rem, 2.8cqw, 0.9rem);
          font-family: inherit;
          outline: none;
          color: #1a1a1a;
        }
        .pec-add-interest-btn {
          all: unset;
          cursor: pointer;
          border: 1px dashed #e11d5e;
          border-radius: 999px;
          color: #e11d5e;
          font-weight: 700;
          font-size: clamp(0.7rem, 2.8cqw, 0.9rem);
          padding: clamp(0.35rem, 1.8cqw, 0.6rem) clamp(0.7rem, 3cqw, 1.1rem);
          white-space: nowrap;
        }

        .pec-prompt-card {
          background: #fdf1f4;
          border-radius: clamp(0.6rem, 2.5cqw, 1.1rem);
          padding: clamp(0.6rem, 3cqw, 1.1rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.4rem, 2cqw, 0.7rem);
        }
        .pec-prompt-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: clamp(0.4rem, 2cqw, 0.7rem);
        }
        .pec-prompt-question {
          flex: 1 1 auto;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-weight: 700;
          color: #e11d5e;
          font-size: clamp(0.72rem, 2.9cqw, 0.92rem);
        }
        .pec-prompt-icons {
          display: flex;
          gap: clamp(0.35rem, 1.6cqw, 0.6rem);
          flex-shrink: 0;
        }
        .pec-icon-btn {
          all: unset;
          cursor: pointer;
          font-size: clamp(0.8rem, 3cqw, 1rem);
          color: #d97b91;
        }
        .pec-prompt-answer {
          border: none;
          outline: none;
          resize: none;
          background: transparent;
          font-family: inherit;
          font-size: clamp(0.75rem, 3cqw, 0.95rem);
          color: #1a1a1a;
          min-height: clamp(1.4rem, 6cqh, 2.5rem);
        }
        .pec-add-prompt-btn {
          all: unset;
          cursor: pointer;
          border: 1.5px dashed #f0a9bb;
          border-radius: clamp(0.6rem, 2.5cqw, 1.1rem);
          color: #e11d5e;
          font-weight: 700;
          text-align: center;
          padding: clamp(0.6rem, 3cqw, 1rem);
          font-size: clamp(0.7rem, 2.8cqw, 0.9rem);
        }

        .pec-footer {
          flex: 0 0 auto;
          padding: clamp(0.6rem, 3cqw, 1.2rem);
          background: #f7f7f8;
        }
        .pec-save-btn {
          all: unset;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.3rem, 1.5cqw, 0.5rem);
          width: 100%;
          background: #e11d5e;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          border-radius: clamp(0.6rem, 2.5cqw, 1rem);
          padding: clamp(0.6rem, 3.2cqw, 1.05rem);
          font-size: clamp(0.75rem, 3cqw, 1rem);
        }
        .pec-save-btn:hover { background: #c81950; }
      `}</style>

                        <form className="pec-scroll" onSubmit={handleSubmit}>
                            {/* 1. ABOUT YOU ------------------------------------------------- */}
                            <section>
                                <SectionHeading icon="👤" label="About You" />
                                <Card>
                                    <div className="pec-row pec-row-textarea-wrap">
                                        <label className="pec-row-label" htmlFor="bio">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            className="pec-row-textarea"
                                            value={data.bio}
                                            onChange={handleBioChange}
                                            rows={2}
                                        />
                                        <span className="pec-charcount">
                                            {data.bio.length}/{bioMaxLength}
                                        </span>
                                    </div>
                                </Card>
                            </section>

                            <section>
                                <SectionHeading icon="❤️" label="Your Intentions" />
                                <Card>
                                    <SelectRow
                                        label="Looking For"
                                        name="lookingFor"
                                        value={data.lookingFor}
                                        onChange={update}
                                        options={["Life partner", "Long-term relationship", "Casual dating", "Marriage", "Friendship"]}
                                        divider={false}
                                    />
                                    <div className="pec-row">
                                        <textarea
                                            className="pec-row-textarea"
                                            style={{ minHeight: "1.6em", color: "#8a8a8a", fontWeight: 400 }}
                                            value={data.intentionNote}
                                            onChange={(e) => update("intentionNote", e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </Card>
                            </section>

                            <section>
                                <SectionHeading icon="＋" label="Basic Details" />
                                <Card>
                                    <FieldRow
                                        label="Full Name"
                                        name="fullName"
                                        value={data.fullName}
                                        onChange={update}
                                    />
                                    <FieldRow
                                        label="Email ID"
                                        name="email"
                                        type="email"
                                        value={data.email}
                                        onChange={update}
                                    />
                                    <FieldRow
                                        label="Date of Birth"
                                        name="dob"
                                        type="date"
                                        value={data.dob}
                                        onChange={update}
                                        divider={false}
                                        sublabel="You'll appear as the age calculated from this date — we only show your age."
                                    />
                                </Card>
                            </section>

                            {/* 2. WHO YOU'RE SEEING ------------------------------------------ */}
                            <section>
                                <SectionHeading icon="🔍" label="Who You're Seeing" />
                                <Card>
                                    <SelectRow
                                        label="Interested In"
                                        name="interestedIn"
                                        value={data.interestedIn}
                                        onChange={update}
                                        options={["Men", "Women", "Everyone"]}
                                    />
                                    <SelectRow
                                        label="Sexual Orientation"
                                        name="sexualOrientation"
                                        value={data.sexualOrientation}
                                        onChange={update}
                                        options={["Straight", "Gay", "Lesbian", "Bisexual", "Other"]}
                                        divider={false}
                                    />
                                </Card>
                            </section>

                            <section>
                                <SectionHeading icon="🍷" label="Lifestyle" />
                                <Card>
                                    <SelectRow
                                        label="Drinking"
                                        name="drinking"
                                        value={data.drinking}
                                        onChange={update}
                                        options={["Never", "Occasionally", "Socially", "Regularly"]}
                                    />
                                    <SelectRow
                                        label="Smoking"
                                        name="smoking"
                                        value={data.smoking}
                                        onChange={update}
                                        options={["Never", "Occasionally", "Regularly"]}
                                    />
                                    <SelectRow
                                        label="Workout"
                                        name="workout"
                                        value={data.workout}
                                        onChange={update}
                                        options={["Never", "Rarely", "Sometimes", "Often", "Daily"]}
                                    />
                                    <SelectRow
                                        label="Diet"
                                        name="diet"
                                        value={data.diet}
                                        onChange={update}
                                        options={["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"]}
                                    />
                                    <FieldRow
                                        label="Travel"
                                        name="travel"
                                        value={data.travel}
                                        onChange={update}
                                        divider={false}
                                    />
                                </Card>
                            </section>

                            {/* 3. CAREER & AMBITION ------------------------------------------ */}
                            <section>
                                <SectionHeading icon="💼" label="Career & Ambition" />
                                <Card>
                                    <FieldRow label="College / Institution" name="college" value={data.college} onChange={update} />
                                    <SelectRow
                                        label="Highest Education"
                                        name="highestEducation"
                                        value={data.highestEducation}
                                        onChange={update}
                                        options={["High School", "Undergraduate", "Postgraduate", "Doctorate"]}
                                    />
                                    <FieldRow label="Degree / Course" name="degree" value={data.degree} onChange={update} />
                                    <FieldRow label="Graduation Year" name="graduationYear" value={data.graduationYear} onChange={update} />
                                    <FieldRow label="Work As" name="workAs" value={data.workAs} onChange={update} />
                                    <FieldRow label="Company / Organisation" name="company" value={data.company} onChange={update} />
                                    <SelectRow
                                        label="Experience"
                                        name="experience"
                                        value={data.experience}
                                        onChange={update}
                                        options={["0-1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"]}
                                    />
                                    <SelectRow
                                        label="Employment Type"
                                        name="employmentType"
                                        value={data.employmentType}
                                        onChange={update}
                                        options={["Full-time", "Part-time", "Self-employed", "Freelance"]}
                                        divider={false}
                                    />
                                </Card>
                            </section>

                            {/* 4. FAMILY ------------------------------------------------------ */}
                            <section>
                                <SectionHeading icon="👨‍👩‍👧" label="Family" />
                                <Card>
                                    <SelectRow
                                        label="Family Type"
                                        name="familyType"
                                        value={data.familyType}
                                        onChange={update}
                                        options={["Joint Family", "Nuclear Family"]}
                                    />
                                    <FieldRow label="Father" name="father" value={data.father} onChange={update} />
                                    <FieldRow label="Mother" name="mother" value={data.mother} onChange={update} />
                                    <FieldRow label="Sisters" name="sisters" value={data.sisters} onChange={update} />
                                    <FieldRow label="Brothers" name="brothers" value={data.brothers} onChange={update} />
                                    <SelectRow
                                        label="Family Home"
                                        name="familyHome"
                                        value={data.familyHome}
                                        onChange={update}
                                        options={["Own House", "Rented House"]}
                                    />
                                    <FieldRow label="Native Place" name="nativePlace" value={data.nativePlace} onChange={update} />
                                    <SelectRow
                                        label="Family Income"
                                        name="familyIncome"
                                        value={data.familyIncome}
                                        onChange={update}
                                        options={["Below ₹5 Lakh", "₹5-10 Lakh", "₹10-20 Lakh", "Above ₹20 Lakh"]}
                                        divider={false}
                                    />
                                </Card>
                            </section>

                            {/* 5. INTERESTS, PROMPTS, LOCATION -------------------------------- */}
                            <section>
                                <SectionHeading icon="★" label="Interests & Hobbies" />
                                <div className="pec-chip-row">
                                    {data.interests.map((interest, idx) => (
                                        <span className="pec-chip" key={`${interest}-${idx}`}>
                                            {interest}
                                            <button type="button" onClick={() => removeInterest(idx)} aria-label="Remove interest">
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="pec-add-interest-form">
                                    <input
                                        className="pec-add-interest-input"
                                        placeholder="Add an interest"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addInterest();
                                            }
                                        }}
                                    />
                                    <button type="button" className="pec-add-interest-btn" onClick={addInterest}>
                                        + Add
                                    </button>
                                </div>
                            </section>

                            <section>
                                <SectionHeading icon="📝" label="Profile Prompts" />
                                {data.prompts.map((prompt) => (
                                    <div className="pec-prompt-card" key={prompt.id} style={{ marginBottom: "0.6em" }}>
                                        <div className="pec-prompt-top">
                                            <input
                                                className="pec-prompt-question"
                                                value={prompt.question}
                                                onChange={(e) => updatePrompt(prompt.id, "question", e.target.value)}
                                            />
                                            <div className="pec-prompt-icons">
                                                <button type="button" className="pec-icon-btn" aria-label="Edit prompt">
                                                    ✎
                                                </button>
                                                <button
                                                    type="button"
                                                    className="pec-icon-btn"
                                                    aria-label="Delete prompt"
                                                    onClick={() => removePrompt(prompt.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            className="pec-prompt-answer"
                                            value={prompt.answer}
                                            onChange={(e) => updatePrompt(prompt.id, "answer", e.target.value)}
                                            rows={1}
                                        />
                                    </div>
                                ))}
                                <button type="button" className="pec-add-prompt-btn" onClick={addPrompt}>
                                    + Add a prompt
                                </button>
                            </section>

                            <section>
                                <SectionHeading icon="📍" label="Location" />
                                <Card>
                                    <FieldRow
                                        label="Area / Neighbourhood"
                                        name="areaNeighbourhood"
                                        value={data.areaNeighbourhood}
                                        onChange={update}
                                    />
                                    <FieldRow label="City" name="city" value={data.city} onChange={update} divider={false} />
                                </Card>
                            </section>
                        </form>

                        <div className="pec-footer">
                            <button type="submit" className="pec-save-btn" onClick={handleSubmit} disabled={busy}>
                                {busy ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfileEditCard;
