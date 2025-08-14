import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userModel } from "../Interfaces";
import { RootState } from "../Storage/Redux/store";
import { setLoggedInUser } from "../Storage/Redux/userAuthSlice";
import { Route, Routes } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Footer, Header } from "../Components/Layout";
import { Home, Kontakt, Login, NotFound, Register, UserDetails, UserPage } from "../Pages";
import { SportskiObjekatDetails, SportskiObjekatKreirajAzuriraj, SportskiObjekatList, SportskiObjektiPage, SportskiObjektiTabela, SportskiObjektiWithLocation } from "../Pages/SportskiObjekat";
import { MojeRezervacije, Rezervacija, RezervacijaDetailsPage, RezervacijaPotvrdjena, SveRezervacije } from "../Pages/Rezervacija";
import { setShoppingCart } from "../Storage/Redux/shoppingCartSlice";
import { useGetShoppingCartByIdQuery } from "../apis/shoppingCartApi";
import { TerminiList, TerminKreirajAzuriraj } from "../Pages/Termin";
import { useGetCurrentUserQuery } from "../apis/authApi";
import { Placanje } from "../Pages/Placanje";
import { Filter } from "../Pages/Filter";
import OdabirObjekata from "../Pages/Filter/OdabirObjekata";

function App() {
    const dispatch = useDispatch();
    const [skip, setSkip] = useState(true);
    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
    //const { data: currentUserData, isLoading: userLoading } = useGetCurrentUserQuery();
    const { data, isLoading } = useGetShoppingCartByIdQuery(userData.id, {
        skip: skip,
    });
    
    useEffect(() => { //Koristi se kako bi se token automatski cuvao u localStorage kada se promeni
        const localToken = localStorage.getItem("token");
        //console.log("Logujem token", localToken);

        if (localToken) {
            const { name, id, email, role, phoneNumber }: userModel = jwtDecode(localToken);
            
            dispatch(setLoggedInUser({ name, id, email, role, phoneNumber })); //Akcija setLoggedInUser azurira stanje u store-u o prijavljenom korisniku

            /*if (currentUserData) {
                dispatch(setLoggedInUser(currentUserData));
            }*/
        }
    });

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setShoppingCart(data.result?.stavkaKorpe)); //Koristim dispatch da bih poslao akcije koje azuriraju stanje u Redux store
        }
    }, [data])

    useEffect(() => {
        if (userData.id) setSkip(false);
    }, [userData]);
    
    return (
        <div>
            <Header />
            <div>
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
                    <Route path="/placanje" element={<Placanje />}></Route>
                    <Route path="/sportskiObjektiPage" element={<SportskiObjektiPage />}></Route>
                    <Route path="/rezervacija/rezervacijaPotvrdjena/:id" element={<RezervacijaPotvrdjena />}></Route>
                    <Route path="/rezervacija/sveRezervacije" element={<SveRezervacije />}></Route>
                    <Route path="/rezervacija/rezervacijaDetaljiPage/:id" element={<RezervacijaDetailsPage />}></Route>
                    <Route path="/rezervacija/mojeRezervacije" element={<MojeRezervacije />}></Route>
                    <Route path="/sportskiObjekti/sportskiObjektiWithLocation" element={<SportskiObjektiWithLocation />} ></Route>
                    <Route path="/filter" element={<Filter />} ></Route>
                    <Route path="/filter/odabirObjekata" element={<OdabirObjekata />} ></Route>
                </Routes>
            </div>
        </div>
    )
}

export default App;