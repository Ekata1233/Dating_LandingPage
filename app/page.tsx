import CommitmentMode from "./components/CommitmentMode/CommitmentMode";
import DateNow from "./components/DateNow/DateNow";
import DownloadAppFeature from "./components/DownloadApp/DownloadAppFeature";
import EarlyAccess from "./components/EarlyAccess/EarlyAccess";
import EventCards from "./components/EventCards/EventCards";
import Events from "./components/eventsSection/events";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import HowItWork from "./components/HowItWork/HowItWork";
import Navbar from "./components/Navbar/Navbar";
import SectionBorder from "./components/SectionBorder";
import VerifiedCommunity from "./components/VerifiedCommunity/VerifiedCommunity";
import WhyWelvors from "./components/WhyWelvors/WhyWelvors";
const websiteSchema = {
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WELVORS",
    alternateName: "Welvors",
    url: "https://www.welvors.com/",
  }),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={websiteSchema}
      />
      <Header></Header>
      <DownloadAppFeature />
      <SectionBorder seed={1001} />
      <WhyWelvors />
      <VerifiedCommunity />
      <SectionBorder seed={2002} />
      <DateNow />
      {/* <Events /> */}
      <EventCards />
      <CommitmentMode />

    </>);
}
