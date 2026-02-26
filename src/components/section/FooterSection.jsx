import React from "react";
import FooterImage from "../../../public/footer.svg";
import Icons from "../../../public/insta2.png";
function FooterSection() {
  return (
    <div className="dark bg-black text-white px-4 ">

      {/* TOP SECTION */}
      <div className="border border-white/20 text-center ">
        <div className="flex flex-col lg:flex-row  justify-center items-center gap-12 border-b border-white/20 pb-16">

          {/* LEFT */}
          <div className="text-center lg:text-left m-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl leading-tight font-semibold">
              create <br />
              your own piece <br />
              of the web
            </h2>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center items-center">
            <img
              src={FooterImage}
              alt="Footer Visual"
              className="w-64 md:w-80 lg:w-auto opacity-80"
            />
          </div>

        </div>

        {/* GRID 1 — 4 COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/20">

          {["Download", "Pricing", "FAQ", "Changelog"].map((item, i) => (
            <div
              key={i}
              className="p-16 border-r border-white/20 last:border-r-0 hover:bg-zinc-900 transition"
            >
              <p className="text-lg hover:text-gray-300 cursor-pointer">
                {item}
              </p>
            </div>
          ))}

        </div>

        {/* GRID 2 — 6 COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

          {[
            "Docs",
            "Community",
            "Blog",
            "Careers",
            "Privacy",
            "Terms"
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 border-r border-b border-white/20 last:border-r-0 hover:bg-zinc-900 transition"
            >
              <p className="text-sm text-gray-400 hover:text-white cursor-pointer">
                {item}
              </p>
            </div>
          ))}

        </div>

      </div>
      <div className="flex mx-5 py-10 gap-10 justify-between">
        <div className="">
          <div className="top">
            <h1>Made by "" — a Koloursyncc association</h1>
          </div>
          <div className="flex justify-between py-2 ">
            <h1 className="text-sm text-white/50 ">Privacy Policy</h1>
            <h1 className="text-sm text-white/50 ">Terms and conditions</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.518605 8.93108C-0.151788 8.7444 -0.179699 7.80185 0.478468 7.57563L18.8964 1.24534C19.4857 1.0428 20.0802 1.53662 19.9911 2.15472L17.6806 18.1901C17.5972 18.7685 16.8913 19.0038 16.479 18.5905L11.647 13.7466L8.9243 17.798C8.74056 18.0715 8.31471 17.9411 8.31471 17.6114V12.0763L17.4785 3.30748L5.81549 10.4061L0.518605 8.93108Z" fill="white"></path>
          </svg>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1659_5296)">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99908 0C4.47773 0 0 4.47566 0 9.99705C0 14.4138 2.86504 18.1604 6.83876 19.4823C7.33908 19.5743 7.52141 19.2657 7.52141 19.0005C7.52141 18.7637 7.51282 18.1346 7.5079 17.3006C4.72636 17.9045 4.13948 15.9603 4.13948 15.9603C3.68458 14.8053 3.02895 14.4979 3.02895 14.4979C2.121 13.878 3.0977 13.8903 3.0977 13.8903C4.10142 13.9609 4.62936 14.9207 4.62936 14.9207C5.52135 16.4482 6.97013 16.0069 7.53983 15.751C7.63068 15.1054 7.88913 14.6648 8.17459 14.415C5.95414 14.1628 3.61951 13.3049 3.61951 9.47419C3.61951 8.38304 4.00933 7.49012 4.64901 6.79174C4.54587 6.53889 4.20271 5.52201 4.74723 4.14611C4.74723 4.14611 5.58642 3.87731 7.49685 5.17097C8.2943 4.94882 9.15007 4.83835 10.0003 4.83406C10.8499 4.83835 11.7051 4.94882 12.5038 5.17097C14.413 3.87731 15.2509 4.14611 15.2509 4.14611C15.7967 5.52201 15.4535 6.53889 15.351 6.79174C15.9919 7.49012 16.3787 8.38304 16.3787 9.47419C16.3787 13.3147 14.0403 14.1597 11.8131 14.407C12.1716 14.7157 12.4915 15.3257 12.4915 16.2586C12.4915 17.5946 12.4792 18.6728 12.4792 19.0005C12.4792 19.2681 12.6597 19.5792 13.1668 19.4817C17.1374 18.1567 20 14.4126 20 9.99705C20 4.47566 15.5223 0 9.99908 0Z" fill="white"></path>
            </g>
            <defs>
              <clipPath id="clip0_1659_5296">
                <rect width="20" height="20" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
          <div data-v-88b4d8d2="" class="icon-twitter icon-block icon whitespace-nowrap text-[20rem] sm:text-[16rem]"><svg viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"></path>
          </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterSection;