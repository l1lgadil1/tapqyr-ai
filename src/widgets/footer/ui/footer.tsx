import { FC } from "react";

export const Footer: FC = () => (
  <footer className="border-t border-white/10 py-6 md:py-0 bg-background/30 backdrop-blur-md">
    <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
        &copy; {new Date().getFullYear()} AI TodoList. All rights reserved.
      </p>
    </div>
  </footer>
); 