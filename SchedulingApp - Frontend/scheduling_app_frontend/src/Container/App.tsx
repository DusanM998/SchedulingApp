import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userModel } from "../Interfaces";
import { RootState } from "../Storage/Redux/store";
import { setLoggedInUser } from "../Storage/Redux/userAuthSlice";
import { Route, Routes } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Footer, Header } from "../Components/Layout";
import { Home, Kontakt, Login, NotFound, Register, UserDetails, UserPage } from "../Pages";
import { SportskiObjekatDetails, SportskiObjekatKreirajAzuriraj, SportskiObjekatList, SportskiObjektiTabela } from "../Pages/SportskiObjekat";
import { Rezervacija } from "../Pages/Rezervacija";
import { setShoppingCart } from "../Storage/Redux/shoppingCartSlice";
import { useGetShoppingCartByIdQuery } from "../apis/shoppingCartApi";
import { TerminiList, TerminKreirajAzuriraj } from "../Pages/Termin";

function App() {
    const dispatch = useDispatch();
    const [skip, setSkip] = useState(true);
    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
    const { data, isLoading } = useGetShoppingCartByIdQuery(userData.id, {
        skip: skip,
    });
    
    useEffect(() => {
        const localToken = localStorage.getItem("token");

        if (localToken) {
            const { name, id, email, role }: userModel = jwtDecode(localToken);
            dispatch(setLoggedInUser({ name, id, email, role }));
        }
    });

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setShoppingCart(data.result?.stavkaKorpe));
        }
    }, [data])

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
                    <Route path="/sportskiObjekat/sportskiObjekatList" element={<SportskiObjekatList />}></Route>
                    <Route path='/sportskiObjekatDetails/:sportskiObjekatId' element={<SportskiObjekatDetails />}></Route>
                    <Route path="/rezervacija" element={<Rezervacija />}></Route>
                    <Route path="/sportskiObjekat/sportskiObjekatKreirajAzuriraj/:sportskiObjekatId" element={<SportskiObjekatKreirajAzuriraj />}></Route>
                    <Route path="/sportskiObjekat/sportskiObjekatKreirajAzuriraj" element={<SportskiObjekatKreirajAzuriraj />}></Route>
                    <Route path="/sportskiObjekat/sportskiObjektiTabela" element={<SportskiObjektiTabela />}></Route>
                    <Route path="/termin/terminList" element={<TerminiList />}></Route>
                    <Route path="termin/terminKreirajAzuriraj/:sportskiObjekatId" element={<TerminKreirajAzuriraj />}></Route>
                    <Route path="/termin/terminKreirajAzuriraj" element={<TerminKreirajAzuriraj />}></Route>
                    <Route path="/kontakt" element={<Kontakt />}></Route>
                </Routes>
            </div>
        </div>
    )
}

export default App;