import CommitmentMode from "./components/CommitmentMode/CommitmentMode";
import DateNow from "./components/DateNow/DateNow";
import DownloadAppFeature from "./components/DownloadApp/DownloadAppFeature";
import EarlyAccess from "./components/EarlyAccess/EarlyAccess";
import Events from "./components/eventsSection/events";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import HowItWork from "./components/HowItWork/HowItWork";
import Navbar from "./components/Navbar/Navbar";
import SectionBorder from "./components/SectionBorder";
import VerifiedCommunity from "./components/VerifiedCommunity/VerifiedCommunity";
import WhyWelvors from "./components/WhyWelvors/WhyWelvors";


export default function Home() {
  return (
    <div>
      
      <Header></Header>
      <DownloadAppFeature/>
      <SectionBorder seed={1001} />
      <WhyWelvors/>
      <VerifiedCommunity/>
      <SectionBorder seed={2002} />
      <DateNow />
      <Events />
      <CommitmentMode/>
      
    </div>  );
}
