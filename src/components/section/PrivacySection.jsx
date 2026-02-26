import React from "react";
import ImageOne from "../../../public/locker.svg";
import ImageTwo from "../../../public/keys.svg";

function PrivacySection() {
  return (
    <div
      className="light px-4 "
      style={{
        background:
          "linear-gradient(147.05deg, rgba(255, 237, 190, 0) 64.83%, #FFEDBE 77.53%, #FFBCC3 90.17%)",
      }}
    >
      <div className="mx-auto border border-black">

        {/* ===== ROW 1 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">

          {/* Left */}
          <div className="p-12 border-b lg:border-b-0 lg:border-r border-black flex flex-col items-center justify-center text-center min-h-[420px]">
            <h2 className="text-5xl md:text-6xl lg:text-7xl leading-tight">
              Enjoy <br />
              true <br />
              privacy
            </h2>
          </div>

          {/* Right */}
          <div className="p-12 flex flex-col items-center text-center justify-center text-center min-h-[420px]">
            <div className="border px-6 h-8  py-1 items-center text-center  ">
                  <h3 className="text-md">
              1 
            </h3>
            </div>
            <h3 className="text-3xl font-semibold mb-8 leading-snug">
              Nobody can see what’s <br />
              in your vault, <br />
              except for you
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <img src={ImageOne} alt="Encrypted" className="w-48" />
                <p className="text-gray-700">End-to-end encryption</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <img src={ImageTwo} alt="Local first" className="w-48" />
                <p className="text-gray-700">Local-first storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ROW 2 (REVERSED) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">

          {/* Left Content */}
          <div className="p-12 border-b lg:border-b-0 lg:border-r border-black flex flex-col items-center justify-center text-center order-2 lg:order-1 min-h-[420px]">
            <div className="border px-6 h-8  py-1 items-center text-center  ">
                  <h3 className="text-md">
              2 
            </h3>
            </div>
            <h3 className="text-3xl font-semibold mb-8 leading-snug">
             
              Your data stays <br />
              fully under <br />
              your control
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <img src={ImageOne} alt="No tracking" className="w-48" />
                <p className="text-gray-700">No tracking</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <img src={ImageTwo} alt="No lock-in" className="w-48" />
                <p className="text-gray-700">No vendor lock-in</p>
              </div>
            </div>
          </div>

          {/* Right Big Heading */}
          <div className="p-12 flex flex-col items-center justify-center text-center order-1 lg:order-2 min-h-[420px]">
            <h2 className="text-5xl md:text-6xl lg:text-7xl leading-tight">
              Total <br />
              ownership
            </h2>
          </div>
        </div>

        {/* ===== ROW 3 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left */}
          <div className="p-12 border-b lg:border-b-0 lg:border-r border-black flex flex-col items-center justify-center text-center min-h-[420px]">
            <h2 className="text-5xl md:text-6xl lg:text-7xl leading-tight">
              Built for <br />
              secure <br />
              collaboration
            </h2>
          </div>

          {/* Right */}
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[420px]">
            <div className="border px-6 h-8  py-1 items-center text-center  ">
                  <h3 className="text-md">
              3
            </h3>
            </div>
            <h3 className="text-3xl font-semibold mb-8 leading-snug">
              
              Collaborate safely <br />
              without sacrificing <br />
              privacy
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <img src={ImageOne} alt="Secure sharing" className="w-48" />
                <p className="text-gray-700">Encrypted sharing</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <img src={ImageTwo} alt="Permissions" className="w-48" />
                <p className="text-gray-700">Granular permissions</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PrivacySection;