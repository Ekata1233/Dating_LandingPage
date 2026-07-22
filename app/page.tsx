import CommitmentMode from "./components/CommitmentMode/CommitmentMode";
import DateNow from "./components/DateNow/DateNow";
import EarlyAccess from "./components/EarlyAccess/EarlyAccess";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import HowItWork from "./components/HowItWork/HowItWork";
import Navbar from "./components/Navbar/Navbar";
import VerifiedCommunity from "./components/VerifiedCommunity/VerifiedCommunity";
import WhyWelvors from "./components/WhyWelvors/WhyWelvors";


export default function Home() {
  return (
    <div>
      
      <Header></Header>
      <WhyWelvors/>
      <VerifiedCommunity/>
      <CommitmentMode/>
      <DateNow/>
      <HowItWork/>
      <EarlyAccess/>
      
    </div>  );
}
