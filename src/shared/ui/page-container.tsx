import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function PageContainer({
  children,
  title,
  description,
  className,
}: PageContainerProps) {
  return (
    <>
      {title && (
        <Helmet>
          <title>{title}</title>
          {description && <meta name="description" content={description} />}
        </Helmet>
      )}
      <div className={cn('container mx-auto px-4', className)}>
        {children}
      </div>
    </>
  );
} 