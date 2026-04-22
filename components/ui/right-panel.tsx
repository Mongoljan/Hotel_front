'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  width?: string;
  /** Offset from the right edge, e.g. 'right-[460px]' when stacking panels */
  rightOffset?: string;
  /** Whether to show the background overlay (set false for secondary stacked panels) */
  showOverlay?: boolean;
}

export function RightPanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  width = 'w-[400px] sm:w-[600px]',
  rightOffset = 'right-0',
  showOverlay = true
}: RightPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 z-50"
              onClick={onClose}
            />
          )}
          
          {/* Right sliding panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.3 
            }}
            className={cn(
              'fixed top-0 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200',
              rightOffset,
              width,
              className
            )}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Panel content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface RightPanelContentProps {
  children: React.ReactNode;
  className?: string;
}

export function RightPanelContent({ children, className }: RightPanelContentProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  );
}

interface RightPanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function RightPanelFooter({ children, className }: RightPanelFooterProps) {
  return (
    <div className={cn('border-t border-gray-200 p-6 bg-white', className)}>
      {children}
    </div>
  );
}