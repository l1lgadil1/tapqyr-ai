import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../../../widgets/hero-section";
import { FeaturesSection } from "../../../widgets/features-section";

export const LandingPage: FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/todo');
  };
  
  return (
    <>
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
    </>
  );
}; 