import { FC } from "react";
import { useTranslation } from "../../../shared/lib/i18n";
import { cn } from "../../../shared/lib/utils";

interface FooterProps {
  className?: string;
}

export const Footer: FC<FooterProps> = ({ className }) => {
  const { t } = useTranslation('common');
  
  return (
    <footer className={cn("border-t border-white/10 py-6 md:py-0 bg-background/30 backdrop-blur-md", className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}; 