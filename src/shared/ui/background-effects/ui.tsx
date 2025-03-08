import { FC } from "react";
import { useLocation } from "react-router-dom";

export const BackgroundEffects: FC = () => {
  const location = useLocation();
  
  return (
    <>
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-10" />
      
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-background to-background/80 pointer-events-none" />
      
      {/* Subtle grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-20 animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-20 animate-pulse-slow pointer-events-none" />
      
      {/* Futuristic scanning line - only on todo page */}
      {location.pathname === "/todo" && (
        <div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none z-10"
          style={{
            animation: "scanLine 8s linear infinite",
            top: "0px"
          }}
        />
      )}
    </>
  );
}; 