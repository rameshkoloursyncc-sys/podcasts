import React, { useEffect } from "react";

const primaryLinks = [
  "Download",
  "Subscribe to updates",
  "Anytype for Business",
  "Browse Gallery",
  "Pricing",
];

// 2 cols × 3 rows = 6 items; flattened for grid (index 0,2,4 = left col; 1,3,5 = right col)
const secondaryLinksFlat = [
  "FAQ",
  "Community",
  "Blog",
  "Docs",
  "Testimonials",
  "Contact",
];

const HamburgerMenu = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[200] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel - slides in from right */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[min(500px,85vw)] bg-[#222222] z-[201] flex flex-col shadow-2xl ${isOpen ? "animate-slide-in-right" : "animate-slide-out-right"
          }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4 pt-6 animate-slide-out-left">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition  "
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Primary nav - vertical stack, text center */}
        <nav className="flex-1 px-8 pt-6 flex flex-col">
          <ul className="space-y-0 text-cente">
            {primaryLinks.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="block w-full py-6 px-0 text-white text-base font-medium  border-l border-r border-t border-white/10  hover:bg-white/10 transition text-center"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Secondary nav - 2 col × 3 row grid; each of 6 items has full border (t,r,b,l), single center line */}
          <ul className=" border-t border-l border-white/10 grid grid-cols-2">
            {secondaryLinksFlat.map((label, index) => (
              <li key={`${label}-${index}`} className="border-r border-b border-white/10">
                <a
                  href="#"
                  className="block w-full py-4 px-4 text-white/90 text-sm hover:text-white hover:underline transition text-center"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom action icons - centered */}
        <div className="p-6 pt-4 flex items-center justify-center gap-4 border-t border-white/10">
          <a
            href="#"
            className="text-white/80 hover:text-white transition"
            aria-label="Share"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition"
            aria-label="GitHub"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition"
            aria-label="X (Twitter)"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </aside>
    </>
  );
};

export default HamburgerMenu;
