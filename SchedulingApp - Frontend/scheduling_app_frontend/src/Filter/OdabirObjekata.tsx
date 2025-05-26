import React, { useEffect, useState } from 'react';
import { useGetSportskiObjektiQuery } from '../apis/sportskiObjekatApi';
import sportskiObjekatModel from '../Interfaces/sportskiObjekatModel';
import { FaCheckCircle, FaShoppingCart} from 'react-icons/fa';
import './odabirObjekata.css';
import { MainLoader } from '../Components/Page/Common';
import { useNavigate } from 'react-router-dom';
import { useGetTerminByIdQuery } from '../apis/terminApi';
import { apiResponse, stavkaKorpeModel, terminModel } from '../Interfaces';
import { RootState } from '../Storage/Redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { inputHelper, toastNotify } from '../Helper';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useUpdateShoppingCartMutation } from '../apis/shoppingCartApi';
import { toast } from 'react-toastify';
import { azurirajKolicinu } from '../Storage/Redux/shoppingCartSlice';

function OdabirObjekata() {
    const { data: objekti, isLoading } = useGetSportskiObjektiQuery(null);
    const [selectedObjekatId, setSelectedObjekatId] = useState<number | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showTermini, setShowTermini] = useState(false);
    const [showObjekatAndTermini, setShowObjekatAndTermini] = useState(false);
    const [selectedTerminId, setSelectedTerminId] = useState<number | null>(null);
    const [selectedTermini, setSelectedTermini] = useState<number[]>([]); //Za cuvanje id-eva odabranih termina
    const [activeTab, setActiveTab] = useState(0); //Za seketovanje aktivnog taba, 0 - odaberi teren, 1 - datum
    const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
    const [updateKorpa] = useUpdateShoppingCartMutation();
    const [addedToCartIds, setAddedToCartIds] = useState<number[]>([]); //Stanje koje prati koji id-evi objekata su dodati u korpu

    const shoppingCartStore: stavkaKorpeModel[] = useSelector(
        (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
    );


    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userData = useSelector((state: RootState) => state.userAuthStore);

    //console.log("User Data:", userData);

    const initialUserData = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
    };

    const [userInput, setUserInput] = useState(initialUserData);

    const handleUserInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
    ) => {
        if(typeof e ==="string"){
            setUserInput(prev => ({
                ...prev,
                phoneNumber: e
            }));
        } else {
            const tempData = inputHelper(e, userInput);
            setUserInput(tempData);
        }
    }

    useEffect(() => {
        setTimeout(() => setMenuVisible(true), 100);
    }, []);

    useEffect(() => {
        //console.log("Logujem user data: ", userData);
        setUserInput({
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
        })
    }, [userData]);

    const selectedObjekat = objekti?.find((o: sportskiObjekatModel) => o.sportskiObjekatId === selectedObjekatId);

    const handleAddToCart = async (selectedObjekatId: number) => {
        if (!userData.id) {
            navigate("/login");
            return;
        }

        setIsAddingToCart(true);

        const response: apiResponse = await updateKorpa({
            sportskiObjekatId: selectedObjekatId,
            brojUcesnika: 1,
            userId: userData.id
        });

        console.log("Logujem korpu: ", response.data);

        //Dodaje id objekta u listu dodatih
        setAddedToCartIds((prev) => [...prev, selectedObjekatId]);

        if (response.data && response.data.isSuccess) {
            toastNotify("Odabrali ste sportski objekat: " + selectedObjekat.naziv);
        }

        setIsAddingToCart(false);
    };

    const { data: termini, isLoading: loadingTermini, error } = useGetTerminByIdQuery(selectedObjekatId, {
        skip: !showTermini || !selectedObjekatId,
    });

    const handleSelect = (id: number) => {
        setSelectedObjekatId(id);
        setShowDetails(true);
        setShowTermini(false);
        setSelectedTermini([]);
        setActiveTab(0);

        //Dodaje se objekat u korpu prilikom selekcije
        //handleAddToCart(id);
    };

    const handleNastavi = (sportskiObjekatId: number) => {
        if (!addedToCartIds.includes(sportskiObjekatId)) {
            toast.info("Morate dodati objekat u korpu pre nego što nastavite!", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        
        if (selectedObjekat) {
            setShowTermini(true);
            setSelectedObjekatId(sportskiObjekatId);
            setActiveTab(1);
            //console.log("Kliknuto na sportski objekat: ", sportskiObjekatId);
        }
    };

    const handleOtkaziTeren = () => {
        setShowDetails(false);
        setSelectedObjekatId(null);
    }

    const handleOtkaziTermine = () => {
        setShowTermini(false);
        setSelectedTermini([]);
        setActiveTab(0);
    };

    const toggleTerminSelection = (terminId: number) => {
        setSelectedTermini(prev => {
            if (prev.includes(terminId)) {
                return prev.filter(id => id !== terminId);
            } else {
                return [...prev, terminId];
            }
        });
    };

    const handleKontaktPodaci = () => {
        setActiveTab(2);
        setShowObjekatAndTermini(true);
    }

    const handleVasaRezervacija = () => {
        setActiveTab(3);
    }

    const handleOtkaziRezervaciju = () => {
        setShowObjekatAndTermini(false);
        setActiveTab(1);
    }
    
    const handleBrojUcesnika = (brojUcesnika: number, stavkaKorpe: stavkaKorpeModel) => {
        const trenutnaKolicina = stavkaKorpe.kolicina || 0;
        const novaKolicina = trenutnaKolicina + brojUcesnika;

        if (novaKolicina > stavkaKorpe.sportskiObjekat?.kapacitet!) {
            toastNotify(`Prekoračen kapacitet! Maksimalno: ${stavkaKorpe.sportskiObjekat?.kapacitet} učesnika`);
            return;
        }

        if (novaKolicina < 1) {
            toastNotify("Minimalni broj učesnika! je 1!");
            return;
        }

        updateKorpa({
            sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
            brojUcesnika: brojUcesnika,
            userId: userData.id,
        });
        dispatch(azurirajKolicinu({ stavkaKorpe: { ...stavkaKorpe }, kolicina: novaKolicina }));
    }

    if (isLoading) return <div><MainLoader /></div>;

    return (
        <div className="container mt-5 odabir-wrapper">
            <div className='row'>
                <div className='col-md-3 col-12 mb-3'>
                    <div className={`navigation rounded shadow p-3 mb-3 ${menuVisible ? 'slide-in-left' : 'invisible'}`}>
                        <ul className="list-group list-group-horizontal-md w-100 justify-content-center text-center">
                            <li className="list-group-item">
                                <i className="bi bi-hdd-fill me-2"
                                    style={{ color: activeTab === 0 ? '#26a172' : '' }}
                                ></i>
                                <span style={{ color: activeTab === 0 ? '#26a172' : '' }}>Odaberi teren</span>
                            </li>
                            <li className="list-group-item">
                                <i className="bi bi-calendar-event me-2"
                                    style={{ color: activeTab === 1 ? '#26a172' : '' }}
                                ></i>
                                <span style={{ color: activeTab === 1 ? '#26a172' : '' }}>Datum & Vreme</span>
                            </li>
                            <li className="list-group-item">
                                <i className="bi bi-file-earmark-text me-2"
                                    style={{ color: activeTab === 2 ? '#26a172' : '' }}
                                ></i>
                                <span style={{ color: activeTab === 2 ? '#26a172' : '' }}>Kontakt podaci</span>
                            </li>
                            <li className="list-group-item">
                                <i className="bi bi-check2-square me-2"
                                    style={{ color: activeTab === 3 ? '#26a172' : '' }}
                                ></i>
                                <span style={{ color: activeTab === 3 ? '#26a172' : '' }}>Vaša rezervacija</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className='col-md-9 col-12'>
                <div className="content-wrapper flex-fill border rounded p-3">
                    {!showObjekatAndTermini && (
                        <>
                            <h4 className="fw-bold">Odaberi teren</h4>
                            <div className="row mx-1">
                                {objekti?.map((objekat: sportskiObjekatModel) => (
                                    <div
                                        key={objekat.sportskiObjekatId}
                                        className={`col-md-5 mb-4 mx-3 p-3 rounded border objekat-card ${selectedObjekatId === objekat.sportskiObjekatId ? 'selected' : ''}`}
                                        onClick={() => handleSelect(objekat.sportskiObjekatId)}
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <img src={objekat.image} alt={objekat.naziv} className="rounded-circle me-3 objekat-image" />
                                                <span>{objekat.naziv}</span>
                                            </div>
                                            {selectedObjekatId === objekat.sportskiObjekatId && (
                                                
                                                <FaCheckCircle className="text-success fs-4" />
                                            )}
                                        </div>
                                        {/* Dugme za dodavanje u korpu se prikazuje tek nakon sto je objekat selektovan*/}
                                        {selectedObjekatId === objekat.sportskiObjekatId && (
                                            <div className='fade-in d-flex justify-content-center mt-3'> 
                                                <button
                                                    className="btn custom-cart-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Sprecava onClick selekciju kartice
                                                        handleAddToCart(objekat.sportskiObjekatId);
                                                    }}
                                                >
                                                    <FaShoppingCart size={20} />
                                                </button>
                                            </div>
                                            
                                        )}
                                        
                                    </div>
                                ))}
                            </div>

                            {!showTermini && selectedObjekat && (
                                <div className="p-4 mt-3 border rounded shadow slide-in-bottom">
                                    <h5>{selectedObjekat.naziv}</h5>
                                    <p><strong>Lokacija:</strong> {selectedObjekat.lokacija}</p>
                                    <p><strong>Vrsta sporta:</strong> {selectedObjekat.vrstaSporta}</p>
                                    <p><strong>Radno vreme:</strong> {selectedObjekat.radnoVreme}</p>
                                    <p><strong>Cena po satu:</strong> {selectedObjekat.cenaPoSatu} RSD</p>
                                    <p><strong>Kapacitet:</strong> {selectedObjekat.kapacitet}</p>
                                    <p>{selectedObjekat.opis}</p>
                                    {shoppingCartStore.length > 0 && (
                                        shoppingCartStore
                                            .filter((stavkaKorpe: stavkaKorpeModel) => stavkaKorpe.sportskiObjekatId === selectedObjekatId)
                                            .map((stavkaKorpe: stavkaKorpeModel, index: number) => (
                                            <div key={index}>
                                                <span className='me-2'>
                                                    <p>Broj učesnika: </p>
                                                </span>
                                                <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                                                    <i className='bi bi-dash-circle-fill' 
                                                        onClick={() => handleBrojUcesnika(-1, stavkaKorpe)}
                                                    />
                                                </span>
                                                <span className='m-1'>
                                                    <b>{stavkaKorpe.kolicina}</b>
                                                </span>
                                                <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                                                    <i className='bi bi-plus-circle-fill' 
                                                        onClick={() => handleBrojUcesnika(1, stavkaKorpe)}
                                                    />
                                                </span>
                                            </div>
                                            
                                        ))
                                    )}
                                    
                                    <hr />
                                    <div className='d-flex justify-content-end align-items-center'>
                                        <button className='btn btn-outline-secondary mx-2'
                                            onClick={handleOtkaziTeren}
                                        >Otkaži</button>
                                        <button className='btn mx-2'
                                            style={{ backgroundColor: "#26a172", color: "white" }}
                                            onClick={() => handleNastavi(selectedObjekat.sportskiObjekatId)}>
                                            Nastavi na odabir termina
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showTermini && selectedObjekat && (
                                <div className='p-4 mt-3 border rounded shadow slide-in-bottom'> 
                                    <h4>Termini za izabrani objekat</h4>
                                    {loadingTermini && <MainLoader />}
                                    {error && <p>Greska pri ucitavanju termina!</p>}
                                    {termini?.length === 0 && <p>Nema dostupnih termina.</p>}
                                    {termini?.length > 0 && (
                                        <div className="row">
                                            {termini.map((termin: terminModel) => (
                                                <div
                                                    key={termin.terminId}
                                                    className={`col-md-4 mb-3 p-3 m-2 border rounded shadow ${selectedTerminId === termin.terminId ? 'border-success' : ''}`}
                                                    onClick={() => toggleTerminSelection(termin.terminId)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <h5>Datum: {termin.datumTermina ? new Date(termin.datumTermina).toLocaleDateString("sr-RS") : "Nepoznat datum"}</h5>
                                                    <p>Vreme: {termin.vremePocetka} - {termin.vremeZavrsetka}</p>
                                                    <p>Status: {termin.status}</p>
                                                    {selectedTermini.includes(termin.terminId) && (
                                                        <FaCheckCircle className="text-success fs-4" />
                                                    )}

                                                </div>
                                            ))}
                                            <hr />
                                            <div className='d-flex justify-content-end align-items-center'>
                                                <button className='btn btn-outline-secondary mx-2'
                                                    onClick={handleOtkaziTermine}
                                                >Otkaži</button>
                                                    <button className='btn mx-2'
                                                        style={{ backgroundColor: "#26a172", color: "white" }}
                                                        onClick={handleKontaktPodaci}>
                                                        Potvrdi odabir
                                                    </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </>
                    )}
                        

                    {activeTab === 2 && (
                        <div className="p-4 border rounded shadow slide-in-bottom">
                            <h4>Kontakt podaci</h4>
                            <form className='col-10 mx-auto'>
                                <div className='form-group mt-3'>
                                    Ime:
                                    <input
                                        type='text'
                                        value={userInput.name}
                                        className='form-control'
                                        placeholder="Ime..."
                                        name="name"
                                        required
                                        onChange={handleUserInput}
                                    />
                                </div>
                                <div className='form-group mt-3'>
                                    Email:
                                    <input
                                        type='email'
                                        value={userInput.email}
                                        className='form-control'
                                        placeholder='E-mail'
                                        name='email'
                                        required
                                        onChange={handleUserInput}
                                    />
                                </div>
                                <div className='form-group mt-3'>
                                    Broj Telefona
                                    <PhoneInput
                                        inputProps={{
                                            name:"phoneNumber"
                                        }}
                                        value={userInput.phoneNumber}
                                        onChange={handleUserInput}
                                    />
                                </div>
                            </form>
                            <hr />
                            <div className='d-flex justify-content-end mt-3'>
                                <button className='btn btn-outline-secondary mx-2'
                                    onClick={handleOtkaziRezervaciju}
                                >Otkaži</button>
                                <button className='btn btn-success' onClick={handleVasaRezervacija}>Nastavi</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="p-4 border rounded shadow slide-in-bottom">
                            <h4>Vaša rezervacija</h4>
                            <p>Ovde ide prikaz odabranih termina i unetih podataka.</p>
                        </div>
                    )}
                </div>
                <div className='d-flex justify-content-center m-4'>
                    <button
                        className='btn px-5'
                        style={{ backgroundColor: "#26a172", color: "white" }}
                        onClick={() => navigate("/")}>
                        Nazad na početnu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OdabirObjekata;
