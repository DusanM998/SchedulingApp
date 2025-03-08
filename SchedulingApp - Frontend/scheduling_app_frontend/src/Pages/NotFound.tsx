import React from 'react'

function NotFound() {
  return (
    <div className="w-100 text-center d-flex justify-content-center align-items-center">
      <div>
        <i
          style={{ fontSize: "7rem" }}
          className="bi bi-x-circle-fill text-danger"
        ></i>
        <div className="pb-5">
          <h2 style={{color:"#8d3d5b"}}>Stranica nije pronađena!</h2>
        </div>
      </div>
    </div>
  )
}

export default NotFound