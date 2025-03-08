import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../../../app/providers/theme-provider";
import { Button } from "../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`relative overflow-hidden ai-border ${className}`}
        >
          <div className="relative z-10">
            <motion.div
              initial={{ rotate: isDark ? -90 : 0, scale: isDark ? 0 : 1 }}
              animate={{ rotate: isDark ? -90 : 0, scale: isDark ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="h-[1.2rem] w-[1.2rem]"
            >
              <Sun className="h-full w-full" />
            </motion.div>
            <motion.div
              initial={{ rotate: isDark ? 0 : 90, scale: isDark ? 1 : 0 }}
              animate={{ rotate: isDark ? 0 : 90, scale: isDark ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-[1.2rem] w-[1.2rem]"
            >
              <Moon className="h-full w-full" />
            </motion.div>
          </div>
          
          {/* Glow effect */}
          <span className={`absolute inset-0 rounded-full bg-gradient-radial from-white/20 to-transparent opacity-0 transition-opacity duration-300 ${isDark ? 'group-hover:opacity-100' : ''}`} />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="ai-card border-white/10 backdrop-blur-md">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 focus:bg-white/5"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 focus:bg-white/5"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 focus:bg-white/5"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 