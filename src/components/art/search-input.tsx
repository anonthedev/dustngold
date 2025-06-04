"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  debounceTime = 500,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync with parent value when it changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [inputValue, onChange, debounceTime]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={`pl-10 bg-slate-800/40 border-slate-700 focus:border-amber-500/50 focus:ring-amber-500/20 ${className}`}
      />
    </div>
  );
}
