import React, { useEffect, useState } from 'react';
import { useGetSportskiObjektiQuery } from '../apis/sportskiObjekatApi';
import sportskiObjekatModel from '../Interfaces/sportskiObjekatModel';
import { FaCheckCircle } from 'react-icons/fa';
import './odabirObjekata.css';
import { MainLoader } from '../Components/Page/Common';
import { useNavigate } from 'react-router-dom';
import { useGetTerminByIdQuery } from '../apis/terminApi';
import { terminModel } from '../Interfaces';

function OdabirObjekata() {
    const { data: objekti, isLoading } = useGetSportskiObjektiQuery(null);
    const [selectedObjekatId, setSelectedObjekatId] = useState<number | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showTermini, setShowTermini] = useState(false);
    const [selectedTerminId, setSelectedTerminId] = useState<number | null>(null);
    const [selectedTermini, setSelectedTermini] = useState<number[]>([]); //Za cuvanje id-eva odabranih termina
    const [activeTab, setActiveTab] = useState(0); //Za seketovanje aktivnog taba, 0 - odaberi teren, 1 - datum

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setMenuVisible(true), 100);
    }, []);

    const handleSelect = (id: number) => {
        setSelectedObjekatId(id);
        setShowDetails(true);
        setShowTermini(false);
        setSelectedTermini([]);
        setActiveTab(0);
    };

    const handleNastavi = (sportskiObjekatId: number) => {
        if (selectedObjekat) {
            setShowTermini(true);
            setSelectedObjekatId(sportskiObjekatId);
            setActiveTab(1);
            console.log("Kliknuto na sportski objekat: ", sportskiObjekatId);
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

    const handleOtkaziRezervaciju = () => {
        setActiveTab(0);
    }

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
    }

    const handleVasaRezervacija = () => {
        setActiveTab(3);
    }

    const selectedObjekat = objekti?.find((o: sportskiObjekatModel) => o.sportskiObjekatId === selectedObjekatId);

    const { data: termini, isLoading: loadingTermini, error } = useGetTerminByIdQuery(selectedObjekatId, {
        skip: !showTermini || !selectedObjekatId,
    });

    if (isLoading) return <div><MainLoader /></div>;

    return (
        <div className="container mt-5 odabir-wrapper">
            <div className='row'>
                <div className='col-md-3 col-12 mb-3'>
                    <div className={`navigation shadow p-3 mb-3 ${menuVisible ? 'slide-in-left' : 'invisible'}`}>
                        <ul className="list-group list-group-horizontal-md w-100 justify-content-center text-center">
                            <li className={`list-group-item ${activeTab === 0 ? 'active' : ''}`}>
                                <i className="bi bi-hdd-fill me-2"></i>Odaberi teren
                            </li>
                            <li className={`list-group-item ${activeTab === 1 ? 'active' : ''}`}>
                                <i className="bi bi-calendar-event me-2"></i>Datum & Vreme
                            </li>
                            <li className={`list-group-item ${activeTab === 2 ? 'active' : ''}`}>
                                <i className="bi bi-file-earmark-text me-2"></i>Kontakt podaci
                            </li>
                            <li className={`list-group-item ${activeTab === 3 ? 'active' : ''}`}>
                                <i className="bi bi-check2-square me-2"></i>Vaša rezervacija
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className='col-md-9 col-12'>
                <div className="content-wrapper flex-fill border rounded p-3">
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

                    {activeTab === 2 && (
                        <div className="p-4 border rounded shadow slide-in-bottom">
                            <h4>Kontakt podaci</h4>
                            <p>Ovde ide forma za unos podataka korisnika.</p>
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
