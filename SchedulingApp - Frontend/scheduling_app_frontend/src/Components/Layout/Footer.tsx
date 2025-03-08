import React from 'react'

function Footer() {
  return (
    <footer className="bg-[#0E020F] text-white py-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
        <div className="md:w-1/3 mb-6 md:mb-0">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="SchedulingApp Logo" className="w-8 h-8" />
            <span className="text-lg font-bold">SchedulingApp</span>
          </div>
          <p className="text-gray-400 mt-3 text-sm">
            Proveri dostupnost i rezerviši termin u sportskom objektu.
          </p>
          <button className="mt-4 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200">
            Rezerviši Termin
          </button>
        </div>
        
        <div className="md:w-1/3 flex justify-between text-gray-400 text-sm">
          <div>
            <h3 className="text-white font-semibold mb-3">Strane</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Objekti</a></li>
              <li><a href="#" className="hover:text-white">Aplikacija</a></li>
              <li><a href="#" className="hover:text-white">Poslovni korisnici</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Informacije</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Kontakt</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
        <p>© 2025 Dusan Milojkovic</p>
        <p className="mt-2">
          Website developed by <span className="text-white font-bold">Dusan Milojkovic</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
