import React from "react";
import Profile from "../../../public/profile.png";

function TestimonialSection() {
  return (
    <div className="dark px-4 py-20 bg-black text-white">
      <div className="mx-auto border border-white/20">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr">

          {/* Card 1 */}
          <div className="border-b md:border-r border-white/20 p-8 hover:bg-zinc-900 transition duration-300">
            <div className="text-5xl mb-4">''</div>
            <p className="mb-6 text-gray-400">
              “We stopped losing guests we actually wanted.” <br />
              We had follow-ups slipping constantly. Now everything is tracked and owned.

            </p>
            <div className="flex items-center gap-3">
              <img src={Profile} alt="User" className="w-8 h-8 rounded-full" />
              <span className="font-medium">Ramesh Kumar</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border-b md:border-r border-white/20 p-8 hover:bg-zinc-900 transition duration-300">
            <div className="text-5xl mb-4">''</div>
            <p className="mb-6 text-gray-400">
              “Our team finally knows what’s happening.” <br />
              No more asking around. The pipeline shows everything clearly.

            </p>
            <div className="flex items-center gap-3">
              <img src={Profile} alt="User" className="w-8 h-8 rounded-full" />
              <span className="font-medium">Ananya Patel</span>
            </div>
          </div>

          {/* Card 3 (ROW SPAN 2) */}
          <div className="md:row-span-2 border-b md:border-b-0 border-white/20 p-8 hover:bg-zinc-900 transition duration-300">
            <div className="text-5xl mb-4">''</div>
            <p className="mb-6 text-gray-400">
              “We filled our calendar without chasing people last minute.” <br />
              Before this, booking felt chaotic. Now it’s predictable.

            </p>
            <div className="flex items-center gap-3">
              <img src={Profile} alt="User" className="w-8 h-8 rounded-full" />
              <span className="font-medium">Arjun Mehta</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border-b md:border-r border-white/20 p-8 hover:bg-zinc-900 transition duration-300">
            <div className="text-5xl mb-4">''</div>
            <p className="mb-6 text-gray-400">
              “No more duplicate outreach disasters.” <br />
              That alone made this worth it.


            </p>
            <div className="flex items-center gap-3">
              <img src={Profile} alt="User" className="w-8 h-8 rounded-full" />
              <span className="font-medium">Sneha Rao</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="border-b md:border-r border-white/20 p-8 hover:bg-zinc-900 transition duration-300">
            <div className="text-5xl mb-4">''</div>
            <p className="mb-6 text-gray-400">
              “Simple system, massive difference.” <br />
              We didn’t need more tools. We needed clarity.



            </p>
            <div className="flex items-center gap-3">
              <img src={Profile} alt="User" className="w-8 h-8 rounded-full" />
              <span className="font-medium">Vikram Shah</span>
            </div>
          </div>

        </div>

        {/* READ MORE OUTSIDE GRID */}
        <div className="border-t border-white/20 bg-black text-white text-center py-4 px-6 hover:bg-zinc-900 transition duration-300 cursor-pointer">
          <h3 className="text-xl">
            Read more →
          </h3>
        </div>

      </div>
    </div>
  );
}

export default TestimonialSection;