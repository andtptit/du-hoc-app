import React from 'react';
import { Phone } from 'lucide-react';

export default function ContactWidgets() {
  const phoneNum = "0967593548";
  const formattedPhone = "096 759 35 48";
  
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Messenger */}
      <a
        href="https://www.facebook.com/duhocthaytu"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-end gap-2 outline-none cursor-pointer"
        title="Messenger"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap bg-white text-slate-700 text-xs font-black py-2 px-0 rounded-full shadow-md border border-slate-100 transition-all duration-300 group-hover:max-w-xs group-hover:px-4">
          Messenger
        </span>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-messenger">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.91 1.455 5.513 3.738 7.153v3.748L9.27 20.31a9.92 9.92 0 002.73.38c5.523 0 10-4.145 10-9.244S17.523 2 12 2zm1.03 12.013l-2.585-2.753-5.045 2.753 5.545-5.89 2.585 2.753 5.045-2.753-5.545 5.89z" />
          </svg>
        </div>
      </a>

      {/* Zalo */}
      <a
        href={`https://zalo.me/${phoneNum}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-end gap-2 outline-none cursor-pointer"
        title={`Zalo: ${formattedPhone}`}
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap bg-white text-slate-700 text-xs font-black py-2 px-0 rounded-full shadow-md border border-slate-100 transition-all duration-300 group-hover:max-w-xs group-hover:px-4">
          Zalo: {formattedPhone}
        </span>
        <div className="w-12 h-12 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-zalo">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.477 2 2 6.03 2 11c0 2.378 1.054 4.515 2.766 6.074l-.875 2.625 2.922-.974A9.873 9.873 0 0012 20c5.523 0 10-4.03 10-9s-4.477-9-10-9zm-1.85 10.58H7.31v-1.1l1.86-2.58H7.39V8.67h2.7v1.1l-1.86 2.58h1.92v1.23zm3.17 0h-1.28V8.67h1.28v4.91zm3.76 0h-2.31v-.53c.12-.13.25-.26.39-.39 1.15-1.07 1.47-1.63 1.47-2.14 0-.58-.38-.9-1.02-.9-.59 0-1.03.26-1.39.77l-.92-.61c.54-.78 1.34-1.22 2.39-1.22 1.36 0 2.21.73 2.21 1.83 0 .86-.49 1.57-1.42 2.44-.13.12-.27.25-.41.38h1.99v.76z" />
          </svg>
        </div>
      </a>

      {/* Phone */}
      <a
        href={`tel:${phoneNum}`}
        className="group flex items-center justify-end gap-2 outline-none cursor-pointer"
        title={`Gọi Hotline: ${formattedPhone}`}
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap bg-white text-slate-700 text-xs font-black py-2 px-0 rounded-full shadow-md border border-slate-100 transition-all duration-300 group-hover:max-w-xs group-hover:px-4">
          Hotline: {formattedPhone}
        </span>
        <div className="w-12 h-12 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-phone">
          <Phone className="w-5 h-5 fill-white" />
        </div>
      </a>
    </div>
  );
}
