import React, { useState } from "react";
import BlockOne from "../../../public/block1.png";
import BlockTwo from "../../../public/block2.png";
import BlockThree from "../../../public/block3.png";
import EditorImg from "../../../public/editor.png"
import LeftTwo from "../../../public/left2.png"

function ComposeSection() {
  const [activeTab, setActiveTab] = useState("Table");

  const tabImages = {
    Table: BlockOne,
    Kanban: BlockTwo,
    Gallery: BlockThree,
  };

  return (
    <div
      className="px-4 py-20 bg-black text-white"
     
    >
      <div className="mx-auto border border-white/20">

        {/* ================= TITLE ================= */}
        <div className="border-b border-white/20 p-12 text-center">
          <h2 className="text-6xl md:text-7xl lg:text-8xl leading-tight">
            Compose beautifully
          </h2>
        </div>

        {/* ================= ROW 1 (2 COL) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-white/20">

          {/* LEFT */}
          <div className="border-b lg:border-b-0 lg:border-r border-white/20 p-12 flex flex-col items-center justify-center text-center min-h-[420px]">
            <p className="text-xl mb-8 max-w-md">
              Block-based editor
            </p>

            <img src={EditorImg} alt="Compose" className="w-80 mt-6" />
          </div>

          {/* RIGHT */}
          <div className="p-12 flex items-center col-span-2 justify-center text-center min-h-[420px]">
            <h3 className="text-4xl font-semibold leading-snug">
              Powerful, no-code creation:
              <br />
              Compose anything you can
              <br />
              imagine visually
            </h3>
          </div>
        </div>

        {/* ================= ROW 2 (3 COL) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/20">

          {[1, 2, 3].map((item, index) => (
            <div
              key={index}
              className={`p-12 flex flex-col items-center justify-center text-center min-h-[420px]
              ${index !== 2 ? "md:border-r border-white/20" : ""}`}
            >
              <p className="text-lg mb-6 max-w-xs">
                Structured
              </p>
              <img
                src={BlockOne}
                alt="Block"
                className="w-56 mt-4"
              />
            </div>
          ))}
        </div>

        {/* ================= ROW 3 (MERGED 1 COL) ================= */}
        <div className="p-16 text-center border-b border-white/20">

          <h3 className="text-5xl md:text-6xl leading-tight mb-8">
            Single objects, infinite possibilities
            <br />
            Visualise connections using graph &
            <br />
            database views
          </h3>

          {/* ===== TAB BAR ===== */}
          <div className="flex justify-center gap-12 mb-12">
            {["Table", "Kanban", "Gallery"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xl pb-2 border-b-2 transition-all duration-300
                  ${
                    activeTab === tab
                      ? "border-white/20 font-semibold"
                      : "border-transparent opacity-60"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ===== CONTENT BELOW TABS ===== */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16">

            {/* LEFT SVG STATIC */}
            <div>
              <img src={LeftTwo} alt="Graph View" className="w-96" />
            </div>

            {/* RIGHT DYNAMIC IMAGE */}
            <div>
              <img
                src={tabImages[activeTab]}
                alt={activeTab}
                className="w-96 transition-all duration-300"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ComposeSection;