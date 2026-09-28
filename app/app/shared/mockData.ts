/* -------------------------------------------------------------------------- */
/*  /app — mock data                                                           */
/*                                                                            */
/*  Every hardcoded list the /app screens used to declare inline now lives     */
/*  here. Components receive these as props with the same values as defaults,   */
/*  so swapping this file for API calls is a one-line change per screen and     */
/*  the UI keeps rendering until real data arrives.                             */
/* -------------------------------------------------------------------------- */

import type {
  AdmirerReceived,
  AdmirerSent,
  BalanceItem,
  DateAvailability,
  DatePlansSummary,
  DateType,
  FilterOption,
  MyProfile,
  Plan,
  Profile,
  ProfileFact,
} from "./types";

/* --------------------------------- images ---------------------------------- */

export const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop";

export const GALLERY = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
];

export const ROSE_IMAGE =
  "https://ik.imagekit.io/aezmcynwbe/welvors/rose.png";

/**
 * Neutral avatar for users the API returns without any photo. Kept in the brand
 * pink so a photo-less card still looks deliberate rather than broken.
 */
export const FALLBACK_AVATAR =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="#FDF2F6"/>
      <circle cx="200" cy="228" r="78" fill="#E7477D" opacity="0.35"/>
      <path d="M200 322c-74 0-134 46-134 103v175h268V425c0-57-60-103-134-103z" fill="#E7477D" opacity="0.35"/>
    </svg>`
  );

/* --------------------------------- profiles -------------------------------- */

/** Shared fact rows — identical for every seeded profile, as in the original. */
const INTERESTS: ProfileFact[] = [
  { label: "Music", icon: "Music", value: "Bollywood, Indie & Pop" },
  { label: "Travel", icon: "Plane", value: "Beach trips & Weekend getaways" },
  { label: "Movies", icon: "Film", value: "Romance, Thriller & Comedy" },
  { label: "Reading", icon: "BookOpen", value: "Fiction & Psychology" },
];

const CAREER: ProfileFact[] = [
  { label: "Profession", icon: "Briefcase", value: "Product Designer" },
  { label: "Company", icon: "Building2", value: "Tech Company" },
  { label: "Education", icon: "GraduationCap", value: "Bachelor's Degree" },
  { label: "Work Location", icon: "MapPin", value: "Pune, Maharashtra" },
];

const LIFESTYLE: ProfileFact[] = [
  { label: "Diet", icon: "Utensils", value: "Mostly Vegetarian" },
  { label: "Fitness", icon: "Dumbbell", value: "Gym & Running" },
  { label: "Smoking", icon: "Cigarette", value: "Never" },
  { label: "Drinking", icon: "Wine", value: "Occasionally" },
];

/** The logged-in user. Doubles as the first card in the discovery feed. */
export const MOCK_MY_PROFILE: Profile = {
  id: "mock-muskan",
  name: "Muskan",
  age: 32,
  image: GALLERY[0],
  gallery: [GALLERY[0], GALLERY[1], GALLERY[2]],
  bio: "Coffee lover. Travel enthusiast.",
  distance: "3 km away",
  height: "5'6\"",
  birth_date: "",
  location: "Karve Nagar, Pune",
  lookingFor: "Long-term",
  religion: "Hindu",
  occupation: "Marketing Lead",
  education: "IIM, Pune",
  about:
    "I'm a marketing lead who believes life tastes better with good coffee and new places. Looking for someone kind, consistent, and ready for something serious.",
  interests: INTERESTS,
  career: CAREER,
  lifestyle: LIFESTYLE,

  prompts: [],

  family: [],

  networking: [],
};

/** Discovery feed. */
export const MOCK_PROFILES: Profile[] = [
  MOCK_MY_PROFILE,
  {
    id: "mock-priya",
    name: "Priya",
    age: 28,
    image: GALLERY[1],
    gallery: [GALLERY[1], GALLERY[2], GALLERY[0]],
    bio: "Art & Design. Dog mom.",
    distance: "7 km away",
    height: "5'4\"",
    birth_date: "",
    location: "Kothrud, Pune",
    lookingFor: "Serious relationship",
    religion: "Hindu",
    occupation: "UX Designer",
    education: "NID, Ahmedabad",
    about:
      "Designer by day, dog mom by obsession. I love museums, rain-walks, and long conversations over chai. Looking for a calm, kind partner.",
    interests: INTERESTS,
    career: CAREER,
    lifestyle: LIFESTYLE,
    prompts: [],
    family: [],
    networking: [],
  },
  {
    id: "mock-ananya",
    name: "Ananya",
    age: 25,
    image: GALLERY[2],
    gallery: [GALLERY[2], GALLERY[0], GALLERY[1]],
    bio: "Music. Foodie. Night owl.",
    distance: "5 km away",
    height: "5'2\"",
    birth_date: "",
    location: "Shivajinagar, Pune",
    lookingFor: "Marriage",
    religion: "Hindu",
    occupation: "Product Analyst",
    education: "MSc, PICT",
    about:
      "Finance-ish by day, foodie by night. Always up for a new café, a live gig, or a road trip. Hoping to find my best friend first.",
    interests: INTERESTS,
    career: CAREER,
    lifestyle: LIFESTYLE,
    prompts: [],
    family: [],
    networking: [],
  },
];

/** Header / sidebar summary of the logged-in user. */
export const MOCK_MY_PROFILE_SUMMARY: MyProfile = {
  avatarUrl: PROFILE_IMAGE,
  name: "Muskan",
  age: 32,
  verified: true,
  location: "Karve Nagar, Pune, Maharashtra",
  isPlatinumMember: true,
  trustScore: 68,
  completionPercent: 70,
};

/* ---------------------------------- wallet --------------------------------- */

export const MOCK_BALANCES: BalanceItem[] = [
  { label: "Roses", value: "96", bg: "#fdeecb", emoji: "⭐" },
  { label: "Compliments", value: "0", bg: "#fbe1e6", emoji: "💌" },
  { label: "My Boosts", value: "0", bg: "#dcebfa", emoji: "🚀" },
  // { label: "My Wallet", value: "₹1,150", bg: "#fbdce8", emoji: "👛" },
];

export const MOCK_DATE_PLANS_SUMMARY: DatePlansSummary = {
  title: "Date Plans",
  subtitle: "Post dates on Date Now · any activity type",
  count: 93,
  countLabel: "left",
};

/* ----------------------------------- plans --------------------------------- */

export const MOCK_PLANS: Plan[] = [
  {
    id: "premium-plus",
    name: "Premium+",
    price: "₹499",
    period: "/ month",
    badge: "POPULAR",
    cta: "Upgrade now",
    theme: "light",
    features: [
      "Unlimited likes & weekly boost",
      "See who liked you",
      "Voice & video calls",
      "ID verification badge",
      "Marriage Intent badge + ₹5L rewards",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: "₹1,999",
    period: "/ month",
    badge: "EXCLUSIVE",
    cta: "Apply for VIP",
    theme: "light",
    features: [
      "VIP-only member pool",
      "Luxury date planning",
      "VIP events & private mixers",
      "Education + profession verified",
      "Mentorship & networking access",
    ],
  },
  {
    id: "vip-elite",
    name: "VIP Elite",
    price: "₹49,999",
    period: "/ year",
    badge: "INVITE",
    cta: "Request invite",
    theme: "dark",
    features: [
      "Elite-only discovery feed",
      "Personal date concierge",
      "Only 100 members per city",
      "International retreats & luxury travel",
      "Founder & executive network",
    ],
  },
];
/* --------------------------------- admirers -------------------------------- */

export const MOCK_ADMIRERS_RECEIVED: AdmirerReceived[] = [
  {
    imageUrl: GALLERY[0],
    name: "Marcus",
    age: 29,
    matchPercent: 75,
    distance: "8 km",
    revealed: false,
  },
  {
    imageUrl: GALLERY[1],
    name: "Marcus",
    age: 29,
    matchPercent: 75,
    distance: "8 km",
    revealed: true,
  },
];

export const MOCK_ADMIRERS_SENT: AdmirerSent[] = [
  {
    avatarUrl: GALLERY[0],
    name: "Elena",
    age: 23,
    matchPercent: 95,
    location: "Mumbai",
    matchedAgo: "3h ago",
    status: "matched",
  },
  {
    avatarUrl: GALLERY[1],
    name: "Sara",
    age: 26,
    matchPercent: 88,
    location: "Pune",
    matchedAgo: "1d ago",
    status: "seen",
  },
];

/* ------------------------------- date filters ------------------------------ */

export const DATE_AVAILABILITY_OPTIONS: FilterOption<DateAvailability>[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "Weekend" },
];

export const DATE_TYPE_OPTIONS: FilterOption<DateType>[] = [
  { value: "all-events", label: "All Events" },
  { value: "coffee", label: "Coffee" },
  { value: "dinner", label: "Dinner" },
  { value: "drinks", label: "Drinks" },
];

export const DEFAULT_AVAILABILITY: DateAvailability = "today";
export const DEFAULT_DATE_TYPE: DateType = "all-events";
