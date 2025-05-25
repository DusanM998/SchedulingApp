import React, { useEffect, useState } from 'react';
import { useGetSportskiObjektiQuery } from '../apis/sportskiObjekatApi';
import sportskiObjekatModel from '../Interfaces/sportskiObjekatModel';
import { FaCheckCircle } from 'react-icons/fa';
import './odabirObjekata.css';
import { MainLoader } from '../Components/Page/Common';
import { useNavigate } from 'react-router-dom';

function OdabirObjekata() {
    const { data: objekti, isLoading } = useGetSportskiObjektiQuery(null);
    const [selectedObjekatId, setSelectedObjekatId] = useState<number | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setMenuVisible(true), 100);
    }, []);

    const handleSelect = (id: number) => {
        setSelectedObjekatId(id);
        setShowDetails(true);
    };

    const selectedObjekat = objekti?.find((o: sportskiObjekatModel) => o.sportskiObjekatId === selectedObjekatId);

    if (isLoading) return <div><MainLoader /></div>;

    return (
        <div className="container mt-5 odabir-wrapper">
            <div className='row'>
                <div className='col-md-3 col-12 mb-3'>
                    <div className={`navigation shadow p-3 mb-3 ${menuVisible ? 'slide-in-left' : 'invisible'}`}>
                        <ul className="list-group list-group-horizontal-md w-100 justify-content-center text-center">
                            <li className="list-group-item active"><i className="bi bi-hdd-fill me-2"></i>Odaberi teren</li>
                            <li className="list-group-item"><i className="bi bi-calendar-event me-2"></i>Datum & Vreme</li>
                            <li className="list-group-item"><i className="bi bi-file-earmark-text me-2"></i>Kontakt podaci</li>
                            <li className="list-group-item"><i className="bi bi-check2-square me-2"></i>Vaša rezervacija</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className='col-md-9 col-12'>
                <div className="content-wrapper flex-fill border rounded p-3">
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

                    {selectedObjekat && (
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
                                <button className='btn btn-outline-secondary mx-2'>Otkaži</button>
                                <button className='btn mx-2'
                                    style={{ backgroundColor: "#26a172", color: "white" }}
                                    onClick={() => navigate("/")}>
                                    Nastavi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className='d-flex justify-content-center mt-4'>
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
