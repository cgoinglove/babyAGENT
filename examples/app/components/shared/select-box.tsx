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

export default function SelectBox({ items, onChange, value, disabled, placeholder = 'Select an item' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    return items.find((item) => item.value == value);
  }, [items, value]);

  // 드롭다운 위치를 계산하는 함수
  const calculateDropdownPosition = () => {
    if (!containerRef.current || !buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = Math.min(items.length * 41, 240); // 최대 높이 240px, 항목당 약 41px 가정

    // 아래 공간이 부족하고 위 공간이 충분하면 위에 표시
    setShowAbove(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      // 드롭다운이 열릴 때 위치 계산
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const selectOption = (value: any) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative text-sm" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        ref={buttonRef}
        className={clsx(
          isOpen && 'bg-hover-color',
          'hover:bg-hover-color',
          'disabled:bg-hover-color',
          'text-sub-text w-full rounded-lg py-1 gap-1 cursor-pointer flex items-center px-2',
          'focus:outline-none',
          'transition-all duration-150 ease-in-out'
        )}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <h4 className={clsx('block truncate text-center', !selectedOption && 'text-gray-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </h4>
        <ChevronDown
          size={14}
          className={clsx('text-gray-400 transition-transform duration-200', isOpen && 'transform rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={clsx(
            'absolute z-10 shadow-lg rounded-lg text-sub-text',
            'ring-1 overflow-auto max-h-60 bg-background',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            showAbove ? 'bottom-full mb-1' : 'top-full mt-1',
            'w-fit'
          )}
          role="listbox"
        >
          <ul className="">
            {items.map((item) => (
              <li
                key={item.value}
                className={clsx(
                  'cursor-pointer select-none py-2 px-3 flex items-center justify-between',
                  item.value === selectedOption?.value && 'text-default-text',
                  'hover:bg-hover-color hover:text-default-text transition-colors duration-100'
                )}
                role="option"
                aria-selected={selectedOption?.value === item.value}
                onClick={selectOption.bind(null, item.value)}
              >
                <span
                  className={clsx(
                    'block truncate font-medium',
                    selectedOption?.value === item.value ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {item.label}
                </span>

                {selectedOption?.value === item.value && (
                  <span className="flex items-center pl-3">
                    <Check size={14} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
