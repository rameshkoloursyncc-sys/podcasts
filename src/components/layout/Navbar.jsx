import React, { useState, useEffect } from "react";

const NavBar = () => {
    return (
        <div className="sticky top-0 z-[100] ">
            <div className="mx-auto px-10 py-4 flex justify-between items-center">

                {/* Logo */}
                <h1 className="text-md font-medium">anytype</h1>

                {/* Right Section */}
                <div className="flex items-center gap-4">

                    {/* Download Button */}
                    <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 transition">

                        {/* Android Icon */}
                        <svg
                            viewBox="0 0 34 24"
                            className="w-6 h-6 fill-current text-white"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M24.9063 3.05816C24.6622 2.929 24.3597 3.02217 24.2305 3.26625L16.558 17.7663C16.4289 18.0103 16.5221 18.3129 16.7661 18.442C17.0102 18.5712 17.3128 18.478 17.4419 18.2339L25.1144 3.73395C25.2435 3.48987 25.1504 3.18731 24.9063 3.05816Z"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.09364 3.05816C9.33772 2.929 9.64029 3.02217 9.76944 3.26625L17.4419 17.7663C17.571 18.0103 17.4779 18.3129 17.2338 18.442C16.9897 18.5712 16.6872 18.478 16.558 18.2339L8.88555 3.73395C8.7564 3.48987 8.84957 3.18731 9.09364 3.05816Z"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4 19.0001C4 11.8204 9.82031 6.00012 17 6.00012C24.1797 6.00012 30 11.8204 30 19.0001H4ZM13 14.0001C13 14.5524 12.5523 15.0001 12 15.0001C11.4477 15.0001 11 14.5524 11 14.0001C11 13.4478 11.4477 13.0001 12 13.0001C12.5523 13.0001 13 13.4478 13 14.0001ZM22 15.0001C22.5523 15.0001 23 14.5524 23 14.0001C23 13.4478 22.5523 13.0001 22 13.0001C21.4477 13.0001 21 14.5524 21 14.0001C21 14.5524 21.4477 15.0001 22 15.0001Z"
                            />
                        </svg>

                        <span className="text-sm font-medium">Download</span>
                    </button>

                    {/* Hamburger Button */}
                    <button className="flex flex-col justify-center gap-1 w-6 h-6">
                        <span className="block h-[2px] w-full bg-black"></span>
                        <span className="block h-[2px] w-full bg-black"></span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default NavBar;