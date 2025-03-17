import { FC } from 'react';
import { DebugUserContext } from '../features/user-onboarding';

/**
 * Debug page for testing user context functionality
 */
const DebugPage: FC = () => {
  return (
    <div className="container py-8 bg-gradient-to-b from-background to-background/80">
      <h1 className="text-2xl font-bold mb-6 text-primary ai-text-gradient">Debug Page</h1>
      <DebugUserContext />
    </div>
  );
};

export default DebugPage; 