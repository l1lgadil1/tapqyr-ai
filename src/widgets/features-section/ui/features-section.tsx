import { FC } from "react";
import { motion } from "framer-motion";
import { FeatureCard } from "../../../entities/feature-card";

export const FeaturesSection: FC = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20 relative">
    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
    <div className="container px-4 md:px-6">
      <motion.div 
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl ai-text-gradient">
          Features
        </h2>
        <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Discover the power of AI in task management
        </p>
      </motion.div>
      <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-10 mt-10">
        <FeatureCard 
          title="AI Task Generation"
          description="Generate structured tasks with AI assistance"
          content="Provide a prompt and let AI create organized task lists with subtasks."
          delay={0.1}
        />
        <FeatureCard 
          title="Task Automation"
          description="Automate task management"
          content="AI can automatically create, update, or delete tasks based on your behavior."
          delay={0.2}
        />
        <FeatureCard 
          title="Progress Tracking"
          description="Monitor your productivity"
          content="Track task completion and analyze your productivity patterns."
          delay={0.3}
        />
      </div>
    </div>
  </section>
); 