"use client";

import { useEffect, useState } from 'react';

interface RegionDisplayProps {
  countryCodes: string[];
  defaultText?: string;
}

export default function RegionDisplay({ countryCodes, defaultText = "Toutes les régions" }: RegionDisplayProps) {
  const [displayText, setDisplayText] = useState<string>(defaultText);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchRegionNames = async () => {
      // Si no hay códigos, usar texto por defecto
      if (!countryCodes || countryCodes.length === 0) {
        setDisplayText(defaultText);
        return;
      }

      try {
        // Fetching country names for codes

        const response = await fetch('/api/countries/names', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ countryCodes }),
        });

        if (response.ok) {
          const data = await response.json();
          const countryNames = data.countryNames || [];

          // Received country names from API

          if (countryNames.length > 0) {
            setDisplayText(countryNames.join(', '));
          } else {
            setDisplayText(defaultText);
          }
        } else {
          // API error occurred
          setDisplayText(defaultText);
        }
      } catch (error) {
        // Fetch error occurred
        setDisplayText(defaultText);
      }
    };

    fetchRegionNames();
  }, [mounted, countryCodes.join(','), defaultText]);

  if (!mounted) {
    return <span className="text-white font-medium">{defaultText}</span>;
  }

  // Si hay múltiples países, mostrar en dos columnas
  if (countryCodes && countryCodes.length > 1 && displayText !== defaultText) {
    const countries = displayText.split(', ');
    return (
      <div className="text-white font-medium text-left w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 text-xs gap-1 sm:gap-x-3">
          {countries.map((country, index) => (
            <span key={index} className={`text-left sm:text-left ${index % 2 === 1 ? "sm:pl-3" : ""}`}>
              - {country}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return <span className="text-white font-medium">{displayText}</span>;
}
