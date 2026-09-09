import CommitmentMode from "./components/CommitmentMode/CommitmentMode";
import DownloadAppFeature from "./components/DownloadApp/DownloadAppFeature";
import EarlyAccess from "./components/EarlyAccess/EarlyAccess";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import HowItWork from "./components/HowItWork/HowItWork";
import Navbar from "./components/Navbar/Navbar";
import VerifiedCommunity from "./components/VerifiedCommunity/VerifiedCommunity";
import WhatMembersSee from "./components/WhatMembersSee/WhatMembersSee";
import WhyWelvors from "./components/WhyWelvors/WhyWelvors";


export default function Home() {
  return (
    <div>
      
      <Header></Header>
      <DownloadAppFeature/>
      <WhyWelvors/>
      <VerifiedCommunity/>
      <WhatMembersSee/>
      <CommitmentMode/>
      
    </div>  );
}
