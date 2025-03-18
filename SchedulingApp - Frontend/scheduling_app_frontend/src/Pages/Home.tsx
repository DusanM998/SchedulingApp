import React from 'react'
import { Banner } from '../Components/Page/Common'
import { Footer } from '../Components/Layout'
import { SportskiObjekatList } from './SportskiObjekat'

function Home() {
  return (
    <div>
      <Banner />
        <div className='container' style={{maxWidth: "100%"}}>
            <SportskiObjekatList />
      </div>
      <Footer />
    </div>
  )
}

export default Home
