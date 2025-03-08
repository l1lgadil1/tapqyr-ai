import { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../shared/ui/button";
import { ThreeDScene } from "../../../shared/ui/3d-scene";

export interface HeroSectionProps {
  onGetStarted: () => void;
}

export const  HeroSection: FC<HeroSectionProps> = ({ onGetStarted }) => (
  <section className="w-full py-12 md:py-24 lg:py-32 relative">
    <div className="container px-4 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
        <motion.div 
          className="flex flex-col justify-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              <span className="ai-text-gradient">AI-Powered</span> Todo List
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              The future of task management is here. Organize your tasks with advanced AI assistance.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button 
              size="lg" 
              className="ai-glow ai-border"
              onClick={onGetStarted}
            >
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="ai-border">Learn More</Button>
          </div>
        </motion.div>
        <motion.div 
          className="h-[500px] w-full overflow-hidden rounded-xl ai-border relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <ThreeDScene />
        </motion.div>
      </div>
    </div>
  </section>
); 