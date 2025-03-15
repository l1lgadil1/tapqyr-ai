import { FC } from "react";
import { motion } from "framer-motion";
import { FeatureCard } from "../../../entities/feature-card";
import { useTranslation } from "../../../shared/lib/i18n";

export const FeaturesSection: FC = () => {
  const { t } = useTranslation('landing');
  
  return (
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
            {t('features.title')}
          </h2>
          <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t('hero.subtitle')}
          </p>
        </motion.div>
        <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-10 mt-10">
          <FeatureCard 
            title={t('features.aiGeneration.title')}
            description={t('features.aiGeneration.description')}
            content={t('features.aiGeneration.description')}
            delay={0.1}
          />
          <FeatureCard 
            title={t('features.taskManagement.title')}
            description={t('features.taskManagement.description')}
            content={t('features.taskManagement.description')}
            delay={0.2}
          />
          <FeatureCard 
            title={t('features.prioritization.title')}
            description={t('features.prioritization.description')}
            content={t('features.prioritization.description')}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}; 