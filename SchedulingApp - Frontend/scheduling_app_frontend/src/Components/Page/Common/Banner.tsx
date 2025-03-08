import React, { useState } from 'react'
import { useDispatch } from 'react-redux';

function Banner() {

    const [value, setValue] = useState("");
    const dispatch = useDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
    }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between min-h-screen bg-gray-50 p-6">
      <div className="md:w-1/2 text-left">
        <h1 className="text-4xl font-bold text-purple-800">
          Rezerviši sportske termine online.
        </h1>
        <h2 className="text-4xl font-bold text-green-600 mt-2">Besplatno!</h2>
        <p className="mt-4 text-gray-700 text-lg">
          Proveri dostupnost i rezerviši salu za fudbal, teren za tenis ili
          salu za košarku.
        </p>
        <button className="mt-6 bg-black text-white py-3 px-6 rounded-lg text-lg hover:bg-gray-800 transition">
          Rezerviši Termin
        </button>
      </div>

      <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
        <img
          src="/path-to-your-image.png"
          alt="Scheduling App"
          className="max-w-md w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  )
}

export default Banner
