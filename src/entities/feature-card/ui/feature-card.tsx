import { FC } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";

export interface FeatureCardProps {
  title: string;
  description: string;
  content: string;
  delay: number;
}

export const FeatureCard: FC<FeatureCardProps> = ({ title, description, content, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card className="ai-card h-full">
      <CardHeader>
        <CardTitle className="ai-text-gradient">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  </motion.div>
); 