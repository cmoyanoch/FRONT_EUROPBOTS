"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface AccordionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
  hideChevron?: boolean;
}

export default function Accordion({
  title,
  children,
  defaultOpen = false,
  className = "",
  id = "accordion",
  hideChevron = false
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 sm:p-4 font-medium rtl:text-right text-europbots-secondary focus:ring-4 focus:ring-europbots-secondary/20 hover:bg-europbots-secondary/10 transition-colors gap-3 border border-europbots-secondary/20 rounded-lg min-h-[48px] touch-manipulation"
        aria-expanded={isOpen}
        aria-controls={`accordion-body-${id}`}
      >
        <div className="flex-1 text-left">
          {typeof title === 'string' ? (
            <span className="text-sm">{title}</span>
          ) : (
            title
          )}
        </div>
        {!hideChevron && (
          <ChevronDown
            className={`w-5 h-5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      <div
        id={`accordion-body-${id}`}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'hidden opacity-0'
        }`}
        aria-labelledby={`accordion-heading-${id}`}
      >
        <div className="px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente para múltiples acordeones
interface AccordionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionGroup({ children, className = "" }: AccordionGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}
