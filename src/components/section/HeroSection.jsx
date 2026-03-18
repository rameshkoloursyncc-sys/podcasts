import React from 'react'
import RighIcon from '../../../public/Main.svg'

function HeroSection() {
    return (
        <div
            className="light px-4 py-2 "
            style={{
                background: "linear-gradient(147.05deg, rgba(255, 237, 190, 0) 64.83%, #FFEDBE 77.53%, #FFBCC3 90.17%)"
            }}
        >
            <div className='mx-auto flex flex-col justify-center items-center border border-black '>

                {/* Top Section */}
                <div className="top px-6 md:px-10 py-10 flex flex-col lg:flex-row gap-10 lg:gap-20 mx-auto my-10 items-center lg:items-start">

                    <div className="left">
                        <h1 className='text-2xl md:text-4xl lg:text-6xl leading-tight text-center lg:text-left'>
                            A system for  <br />
                            <span className='text-orange-500'>booking guests</span> <br />
                            without things falling <br />
                            <span className='text-orange-500'>through</span>

                        </h1>
                    </div>

                    <div className="right">
                        <img
                            src={RighIcon}
                            alt="Hero Visual"
                            className="w-64 md:w-80 lg:w-auto"
                        />
                    </div>
                </div>

                {/* Bottom Grid Section */}
                <div className="bottom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full border-t border-black">

                    {/* Grid 1 */}
                    <div className="border-b lg:border-b-0 lg:border-r border-black p-8">
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Clear Ownership
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg">
                            Every guest has one owner. No confusion, no overlap, no awkward double outreach.
                        </p>
                    </div>

                    {/* Grid 2 */}
                    <div className=" md:border-r lg:border-r border-black p-8">
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Follow-ups That Don’t Slip
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg">
                            Never lose a high-value guest because someone forgot to check back in.
                        </p>
                    </div>

                    {/* Grid 3 */}
                    <div className="border-b md:border-b-0 lg:border-r border-black p-8">
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Built for Teams
                        </h2>
                        <p className="text-gray-600 text-base lg:text-lg">
                            Your host, producer, and VA work from the same live pipeline — not scattered DMs.
                        </p>
                    </div>

                    {/* Grid 4 (Empty) */}
                    <div className="p-8 min-h-[220px]">
                        {/* Empty */}
                    </div>

                </div>

            </div>
        </div>
    )
}

export default HeroSection