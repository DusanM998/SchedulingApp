import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userModel } from "../Interfaces";
import { RootState } from "../Storage/Redux/store";
import { setLoggedInUser } from "../Storage/Redux/userAuthSlice";
import { Route, Routes } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Footer, Header } from "../Components/Layout";
import { Home, Login, NotFound, Register, UserDetails, UserPage } from "../Pages";

function App() {
    const dispatch = useDispatch();
    const [skip, setSkip] = useState(true);
    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
    
    useEffect(() => {
        const localToken = localStorage.getItem("token");

        if (localToken) {
            const { name, id, email, role }: userModel = jwtDecode(localToken);
            dispatch(setLoggedInUser({ name, id, email, role }));
        }
    });

    useEffect(() => {
        if (userData.id) setSkip(false);
    }, [userData]);
    
    return (
        <div>
            <Header />
            <div className="pb-5">
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="*" element={<NotFound />}></Route>
                    <Route path="/register" element={<Register />}></Route>
                    <Route path="/login" element={<Login />}></Route>
                    <Route path="/userPage/:id" element={<UserPage />}></Route>
                    <Route path="/userDetails/userDetailsUpdate/:id" element={<UserDetails />}></Route>
                </Routes>
            </div>
        </div>
    )
}

export default App;