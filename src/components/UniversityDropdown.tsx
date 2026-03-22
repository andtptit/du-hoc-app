/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { University } from '../types';

interface UniversityDropdownProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showDropdown: boolean;
  onShowDropdown: (show: boolean) => void;
  filteredUnis: University[];
  onSelect: (id: string) => void;
}

export default function UniversityDropdown({
  searchQuery,
  onSearchChange,
  showDropdown,
  onShowDropdown,
  filteredUnis,
  onSelect,
}: UniversityDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fix bug: đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, onShowDropdown]);

  return (
    <div className="space-y-2 mb-8 relative" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <Search className="w-3 h-3" /> Trường mong muốn
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm trường..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
          value={searchQuery}
          onFocus={() => onShowDropdown(true)}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {showDropdown && (
        <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-64 overflow-y-auto">
          {filteredUnis.length > 0 ? (
            filteredUnis.map((u) => (
              <button
                key={u.id}
                className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 flex flex-col"
                onMouseDown={() => onSelect(u.id)}
              >
                <span className="font-bold text-slate-800">
                  {u.name} ({u.nameKr})
                </span>
                <span className="text-xs text-slate-500">
                  {u.rank}
                </span>
              </button>
            ))
          ) : (
            <div className="px-6 py-4 text-slate-400 text-sm">Không tìm thấy trường phù hợp</div>
          )}
        </div>
      )}
    </div>
  );
}
