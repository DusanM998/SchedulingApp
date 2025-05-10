import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { userModel } from '../../Interfaces';
import { RootState } from '../../Storage/Redux/store';
import { emptyUserState, setLoggedInUser } from '../../Storage/Redux/userAuthSlice';
import { SD_Roles } from '../../Utility/SD';
import "./header.css";
let logo = require("../../Assets/Images/logo.png");


const Header = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);

    const handleLogout = () => {
        localStorage.removeItem("token");

        dispatch(setLoggedInUser({ ...emptyUserState }));
        navigate("/");
    }

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className='container-fluid'>
            <NavLink className="nav-link" aria-current="page" to="/">
                <img src={logo} style={{ height: "40px" }} className='m-1'></img>
            </NavLink>
            <button className="navbar-toggler" 
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className='collapse navbar-collapse' id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100">
                    <li className="nav-item">
                        <NavLink className="nav-link" aria-current="page" to="/">Početna</NavLink>
                    </li>
                    {userData.role == SD_Roles.ADMIN ?
                    (
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Admin Panel
                            </a>
                            <ul className="dropdown-menu">
                                <li
                                    className='dropdown-item' 
                                    onClick={() => navigate("/rezervacija/sveRezervacije")}
                                    style={{cursor:"pointer"}}>
                                Sve rezervacije
                                </li>
                                <li 
                                    className='dropdown-item' 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/sportskiObjekat/sportskiObjektiTabela")}
                                >
                                Upravljanje Sportskim Objektima
                                </li>
                                <li 
                                    className='dropdown-item' 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/termin/terminList")}
                                >
                                Upravljanje Terminima
                                </li>
                                <li 
                                    className='dropdown-item' 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("*")}
                                >
                                Upravljanje Rezervacijama
                                </li>
                                <li 
                                    className='dropdown-item' 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("*")}
                                >
                                Not Found
                                </li>
                            </ul>
                        </li>
                    ) :
                    (
                        <li>
                            <NavLink className="nav-link" aria-current="page" to="/">Moje rezervacije</NavLink>
                        </li>
                    )}
                    <li className='nav-item'>
                        <NavLink className="nav-link" aria-current="page" to="/rezervacija">
                            <i className='bi bi-cart4'>&nbsp;Rezervacije</i>{" "}
                        </NavLink>
                    </li>
                    <div className='d-flex' style={{marginLeft: "auto"}}>
                        {userData.id &&
                        (<>
                            <li className='nav-item'>
                                <button
                                    className='nav-link active'
                                    style={{
                                        cursor:"pointer",
                                        background: "transparent",
                                        border: 0
                                    }}
                                    onClick={() => navigate("/userPage/" + userData.id)}
                                    >
                                    Dobrodošli, {userData.name}
                                </button>
                            </li>
                            <li className='nav-item'>
                                <button className='btn btn-outlined rounded-pill text-white mx-2'
                                    style={{
                                        border: "none",
                                        height: "40px",
                                        width: "100px",
                                        backgroundColor:"#4da172"
                                    }}
                                    onClick={handleLogout}
                                    >
                                    <i className='bi bi-box-arrow-in-left'></i>{" "}
                                    Logout
                                </button>
                            </li>
                        </>)}
                        {!userData.id &&
                            (<>
                                <li className='nav-item'>
                                    <NavLink className="nav-link" to="/register">
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink className="nav-link btn btn-outlined rounded-pill text-white mx-2" to="/login"
                                        style={{
                                            border: "none",
                                            height: "40px",
                                            width: "100px",
                                            backgroundColor: "#4da172"
                                        }}
                                    >
                                    Login {" "}
                                    <i className='bi bi-box-arrow-in-right'></i>
                                    </NavLink>
                                </li>
                            </>)
                        }
                    </div>
                </ul>
            </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
