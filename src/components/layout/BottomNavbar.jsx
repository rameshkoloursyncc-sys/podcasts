import React, { useState } from "react";

function FloatingBottomNav() {
  const [active, setActive] = useState("what");

  const tabs = ["what", "who", "why"];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2  backdrop-blur-2xl border border-white/10 rounded-2xl px-3 py-2 shadow-xl">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-2 rounded-md text-sm capitalize transition duration-300
              ${
                active === tab
                  ? "underline text-gray-400"
                  : "text-gray-400 hover:text-white"
              }
            `}
          >
            {tab}
          </button>
        ))}

      </div>
    </div>
  );
}

export default FloatingBottomNav;