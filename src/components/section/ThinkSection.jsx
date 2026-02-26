import React from "react";
import Home from "../../../public/home.svg";
import Energy from "../../../public/energy.svg";
import Store from "../../../public/stores.svg";

function ThinkSection() {
  return (
    <div
      className="px-6 h-[80vh] flex flex-col items-center justify-center text-center"
      style={{
        background:
          "linear-gradient(147.05deg, rgba(241, 255, 201, 0) 64.83%, #F1FFC9 77.53%, #C5F3E5 90.17%)",
      }}
    >
      {/* Title */}
      <h1 className="text-6xl md:text-7xl lg:text-8xl mb-16">
        Think Fast
      </h1>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        
        {/* Card 1 */}
        <div className="flex flex-col items-center justify-center">
          <img src={Home} alt="Offline First" className="w-10 h-10 mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Offline-first</h2>
          <p className="max-w-xs text-gray-700">
            Your vault lives on your device.
            No server means no lag.
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center justify-center">
          <img src={Energy} alt="Instant Sync" className="w-10 h-10 mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Instant Sync</h2>
          <p className="max-w-xs text-gray-700">
            Changes propagate efficiently
            without compromising speed.
          </p>
        </div>


        {/* Card 3 */}
        <div className="flex flex-col items-center justify-center">
          <img src={Store} alt="Local Storage" className="w-10 h-10 mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Local Storage</h2>
          <p className="max-w-xs text-gray-700">
            Store and retrieve data instantly
            with full control.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ThinkSection;