/**
 * Framer Motion Animation Variants
 * 
 * This file consolidates all animation variants used throughout the application
 * to ensure consistency and maintainability.
 */

import { Variants } from 'framer-motion';

/**
 * Fade in and slide up animation
 * Used for cards, sections, and other UI elements that should appear from below
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

/**
 * Fade in and scale up animation
 * Used for profile cards, avatars, and other elements that should grow as they appear
 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Staggered container animation
 * Used for grids and lists where children should animate in sequence
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

/**
 * Staggered item animation
 * Used as a child variant for staggerContainer
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

/**
 * Progress bar animation
 * Used for animated progress indicators
 */
export const progressAnimation = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

/**
 * Chart line animation
 * Used for animated chart lines
 */
export const chartLineAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

/**
 * Chart bar animation
 * Used for animated chart bars
 */
export const chartBarAnimation = {
  initial: { height: 0, opacity: 0 },
  animate: { 
    height: "100%", 
    opacity: 1,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

/**
 * Chat widget animation
 * Used for the chat widget appearance and disappearance
 */
export const chatWidgetAnimation = {
  initial: { opacity: 0, y: 20, height: '48px' },
  animate: { 
    opacity: 1, 
    y: 0, 
    height: '400px',
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

/**
 * Chat message animation
 * Used for individual chat messages
 */
export const chatMessageAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

/**
 * Button scale animation
 * Used for interactive buttons
 */
export const buttonScaleAnimation = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      duration: 0.1,
      ease: "easeIn"
    }
  }
}; 