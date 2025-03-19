'use client';

import { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronDown, Check } from 'lucide-react';

interface Props {
  items: {
    value: any;
    label: ReactNode;
  }[];
  disabled?: boolean;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

export default function SelectBox({ items, onChange, value, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    return items.find((item) => item.value == value);
  }, [items, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (value: any) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="w-48" ref={containerRef}>
      <div className="relative text-sm">
        <button
          type="button"
          disabled={disabled}
          className={clsx(
            disabled && 'text-sub-text bg-hover-color',
            'relative w-full rounded-lg py-2 text-left cursor-pointer flex items-center px-4',
            'ring shadow-sm hover:bg-soft-background',
            isOpen && 'bg-soft-background',
            'focus:outline-none',
            'transition-all duration-150 ease-in-out'
          )}
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <h4 className={clsx('block truncate text-center', !selectedOption && 'text-gray-500')}>
            {selectedOption ? selectedOption.label : 'Select an item'}
          </h4>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown
              className={clsx(
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </span>
        </button>

        {isOpen && (
          <div
            className={clsx(
              'absolute z-10 mt-1 w-full shadow-lg rounded-lg text-sub-text',
              'ring-1 overflow-auto max-h-60',
              'animate-in fade-in-0 zoom-in-95 duration-100'
            )}
            role="listbox"
          >
            <ul className="">
              {items.map((item) => (
                <li
                  key={item.value}
                  className={clsx(
                    'cursor-pointer select-none py-2.5 px-4 flex items-center justify-between',
                    item == selectedOption && 'text-default-text',
                    'hover:bg-hover-color hover:text-default-text transition-colors duration-100'
                  )}
                  role="item"
                  aria-selected={selectedOption?.value === item.value}
                  onClick={selectOption.bind(null, item.value)}
                >
                  <span
                    className={clsx(
                      'block truncate font-medium ',
                      selectedOption?.value === item.value ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {item.label}
                  </span>

                  {selectedOption?.value === item.value && (
                    <span className="flex items-center pl-3 ">
                      <Check size={14} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
