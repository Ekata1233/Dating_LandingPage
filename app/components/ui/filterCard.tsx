import React from "react";

const DEFAULT_IMAGE =
    "https://ik.imagekit.io/aezmcynwbe/welvors/couple_images.png?updatedAt=1789706343525";

type MusicCardProps = {
    title?: string;
    imageSrc?: string;
    imageAlt?: string;
    /** Max width of the whole card (px). Card scales fluidly below this. */
    maxWidth?: number;
    /** Tweak if your image crops differently: e.g. "right bottom", "center bottom" */
    imagePosition?: string;
    className?: string;
    onClick?: () => void;
};

/**
 * Category card where the subject "pops out" of the box:
 *  - light pink → white gradient card with thin border
 *  - rounded panel on the right
 *  - image anchored to the bottom-right
 *  - title positioned on the left
 */
export default function FilterCard({
    title = "Music",
    imageSrc = DEFAULT_IMAGE,
    imageAlt = "",
    maxWidth = 150,
    imagePosition = "right bottom",
    className,
    onClick,
}: MusicCardProps) {
    const radius = "3.7cqw";

    return (
        <div
            className={className}
            style={{
                containerType: "inline-size",
                width: "100%",
                maxWidth,
                paddingTop: "10px",
            }}
        >
            {/* CARD */}
            <div
                onClick={onClick}
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                className="rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300"
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1220 / 615",
                    background:
                        "linear-gradient(180deg, #F9DCE8 0%, #FBE4ED 55%, #FDEFF4 100%)",
                    boxShadow: "0 1px 2px rgba(20, 30, 80, 0.06)",
                }}
            >
                {/* PINK PANEL */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "41.2%",
                        borderRadius: radius,
                    }}
                />

                {/* TITLE */}
                <h2
                    style={{
                        position: "absolute",
                        left: "5.7%",
                        top: "50%",
                        transform: "translateY(-46%)",
                        margin: 0,
                        width: "50%",
                        fontFamily:
                            '"Inter", "Helvetica Neue", "Segoe UI", Arial, sans-serif',
                        fontWeight: 800,
                        fontSize: "9.6cqw",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: "#050a3d",
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        textAlign: "left",
                    }}
                >
                    {title}
                </h2>

                {/* IMAGE */}
                <div
                    className="rounded-r-2xl"
                    style={{
                        position: "absolute",
                        right: "-0.4%",
                        bottom: 0,
                        width: "45.5%",
                        height: "100%",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        draggable={false}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: imagePosition,
                            userSelect: "none",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}