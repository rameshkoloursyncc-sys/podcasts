import React from 'react'
import Chats from '../../../public/chats.png'
import Documents from '../../../public/documents.png'
import Database from '../../../public/private-databases.svg'
function FeatersSection() {
    return (
        <div className="dark bg-black px-4 py-2 text-white ">
            <h1 className='text-6xl text-white text-center m-auto p-15'>track, follow up, confirm</h1>
            <div className="mx-auto flex flex-col justify-center items-center border border-white/20  mb-20 mt-10">

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 border-b border-white/20 text-center">
                    <div className="border-b lg:border-b-0 lg:border-r border-white/20 p-8  ">
                        <div className="h-80 flex items-center justify-center mb-6">
                            <img src={Chats} alt="" className="max-h-full object-contain" />
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Guest Conversations
                        </h2>
                        <p className="text-gray-600 text-base lg:text-md">
                            All outreach — DMs, emails, replies — tracked in one place so nothing disappears.
                        </p>
                    </div>
                    <div className="border-b lg:border-b-0 lg:border-r border-white/20 p-8">
                        <div className="h-80 flex items-center justify-center mb-6">
                            <img src={Documents} alt="" className="max-h-full object-contain" />
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Guest Pipeline
                        </h2>
                        <p className="text-gray-600 text-base lg:text-md">
                            See exactly where every guest is: contacted, replied, scheduled, or confirmed.
                        </p>
                    </div>
                    <div className="p-8">
                        <div className="h-80 flex items-center justify-center mb-6">
                            <img src={Database} alt="" className="max-h-full object-contain" />
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
                            Booking Calendar
                        </h2>
                        <p className="text-gray-600 text-base lg:text-md">
                            Your upcoming slots stay visible and filled — no last-minute scrambling.
                        </p>
                    </div>

                </div>

                <h2 className='text-white p-8'>See how your pipeline is breaking →</h2>
            </div>
        </div>
    )
}

export default FeatersSection