import React from 'react'
import { useGetSportskiObjektiQuery } from '../../apis/sportskiObjekatApi';
import { MainLoader } from '../../Components/Page/Common';
import { Footer } from '../../Components/Layout';

function SportskiObjektiWithLocation() {

    const { data, isLoading } = useGetSportskiObjektiQuery(null);

  if (isLoading) {
    return <MainLoader />;
  }

  if (!data || data.length === 0) {
    return <div className="container text-center my-5">Nema dostupnih sportskih objekata.</div>;
  }

  return (
    <>
        <div className="container my-5">
        <h1 className="text-center fw-bold mb-5" style={{ color: '#51285f' }}>
            Svi Sportski Objekti
        </h1>
        <p className='m-5 text-secondary fs-5 text-center'>Možete videti sve sportske objekte u ponudi, sa njihovom lokacijom, cenom, kao i radnim vremenom.</p>

        {data.map((objekat: any, index: number) => (
            <div key={objekat.sportskiObjekatId} className="card mb-4 shadow-sm">
            <div className="row g-0">
                <div className="col-md-4">
                <img
                    src={objekat.image}
                    alt={objekat.naziv}
                    className="img-fluid rounded-start"
                    style={{ height: '100%', objectFit: 'cover' }}
                />
                </div>
                <div className="col-md-8 d-flex flex-column justify-content-between p-4">
                <div>
                    <h3 className="card-title" style={{ color: '#26a172' }}>{objekat.naziv}</h3>
                    <p className="card-text text-muted mb-1"><strong>Lokacija:</strong> {objekat.lokacija}</p>
                    <p className="card-text text-muted mb-1"><strong>Vrsta sporta:</strong> {objekat.vrstaSporta}</p>
                    <p className="card-text text-muted mb-1"><strong>Radno vreme:</strong> {objekat.radnoVreme}</p>
                    <p className="card-text text-muted mb-1"><strong>Kapacitet:</strong> {objekat.kapacitet}</p>
                    <p className="card-text text-muted mb-2"><strong>Cena po satu:</strong> {objekat.cenaPoSatu} RSD</p>
                </div>
                <div className="mt-3">
                    <iframe
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(objekat.lokacija)}&output=embed`}
                    ></iframe>
                </div>
                </div>
            </div>
            </div>
        ))}
        
        </div>
        <Footer />
    </>
  );
}

export default SportskiObjektiWithLocation
