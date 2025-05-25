import React, { useEffect, useState } from 'react'
import { useGetSportskiObjektiQuery, useGetSportskiObjektiWithPaginationQuery } from '../../apis/sportskiObjekatApi';
import { MainLoader } from '../../Components/Page/Common';
import { Footer } from '../../Components/Layout';
import { inputHelper } from '../../Helper';
import { useNavigate } from 'react-router-dom';

function SportskiObjektiWithLocation() {

  const navigate = useNavigate();
  const [sportskiObjektiData, setSportskiObjektiData] = useState([]);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageOptions, setPageOptions] = useState({
    pageNumber: 1,
    pageSize: 2,
  });
  const [currentPageSize, setCurrentPageSize] = useState(pageOptions.pageSize);

  const { data, isLoading } = useGetSportskiObjektiWithPaginationQuery({
    ...({
      pageNumber: pageOptions.pageNumber,
      pageSize: pageOptions.pageSize,
      }),
  });

  console.log("Logujem Data: ", data);

  useEffect(() => {
    if (data) {
      setSportskiObjektiData(data.apiResponse.result);
      let total = 0;
      try {
        const parsed = JSON.parse(data.totalRecords);
        total = parsed.TotalRecords ?? 0;
      } catch (e) {
        console.error("Greška prilikom parsiranja totalRecords:", e);
      }

      setTotalRecords(total);

      console.log("totalRecords:", data.totalRecords);
      console.log("typeof totalRecords:", typeof data.totalRecords);
    }
  }, [data]);

  const getPageDetails = () => {
    const dataStartNumber = (pageOptions.pageNumber - 1) * pageOptions.pageSize + 1;
    const dataEndNumber = pageOptions.pageNumber * pageOptions.pageSize;

    return `${dataStartNumber} - 
      ${dataEndNumber < totalRecords ? dataEndNumber : totalRecords} od ${totalRecords}`;
  };

  //console.log("Logujem total records", totalRecords);

  const handlePageOptionChange = (direction: string, pageSize?: number) => {
    if (direction === "prev") {
      setPageOptions({ pageSize: 2, pageNumber: pageOptions.pageNumber - 1 });
    } else if (direction === "next") {
      setPageOptions({ pageSize: 2, pageNumber: pageOptions.pageNumber + 1 });
    } else if (direction === "change") {
      setPageOptions({
        pageSize: pageSize ? pageSize : 2,
        pageNumber: 1,
      });
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  if (isLoading) {
    return <MainLoader />;
  }

  if (!data) {
    return <div className="container text-center my-5">Nema dostupnih sportskih objekata.</div>;
  }

  return (
    <>
        <div className="container my-5">
        <h1 className="text-center fw-bold mb-5" style={{ color: '#51285f' }}>
            Svi Sportski Objekti
        </h1>
        <p className='m-5 text-secondary fs-5 text-center'>Možete videti sve sportske objekte u ponudi, sa njihovom lokacijom, cenom, kao i radnim vremenom.</p>
        <div className='d-flex mb-5 justify-content-end align-items-center'>
          <div>Prikaza po stranici: </div>
          <div>
            <select
              className='form-select mx-2'
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                handlePageOptionChange("change", Number(e.target.value));
                setCurrentPageSize(Number(e.target.value));
              }}
              style={{ width: "80px" }}
              value={currentPageSize}
            >
              <option>2</option>
              <option>4</option>
              <option>6</option>
              <option>10</option>
            </select>
          </div>
          <div className='mx-2'>
            {getPageDetails()}
          </div>
          <button
            className='btn btn-outline-secondary px-3 mx-2'
            onClick={() => handlePageOptionChange("prev")}
            disabled={pageOptions.pageNumber === 1}
          >
            <i className='bi bi-chevron-left'></i>
          </button>
          <button
            className='btn btn-outline-secondary px-3 mx-2'
            onClick={() => handlePageOptionChange("next")}
            disabled={pageOptions.pageNumber * pageOptions.pageSize >= totalRecords}
          >
            <i className='bi bi-chevron-right'></i>
          </button>
        </div>
        {data?.apiResponse?.result?.map((objekat: any, index: number) => (
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
                  <button
                    className='btn btn-outline-success mt-3'
                    onClick={() => toggleExpand(objekat.sportskiObjekatId)}
                  >
                    {expandedCardId === objekat.sportskiObjekatId ? "Sakrij termine" : "Prikaži termine"}
                  </button>
                  {expandedCardId === objekat.sportskiObjekatId && (
                    <div
                      className="mt-3 overflow-hidden"
                      style={{
                        maxHeight: '1000px',
                        transition: 'max-height 0.5s ease-in-out',
                      }}
                    >
                      <h5>Termini</h5>
                      {objekat.termini && objekat.termini.length > 0 ? (
                        objekat.termini.map((termin: any, idx: number) => (
                          <div key={idx} className="border p-2 rounded mb-2 bg-light">
                            <div><strong>Datum:</strong> {termin.datumTermina ? new Date(termin.datumTermina).toLocaleDateString("sr-RS") : "Nepoznat datum"}</div>
                            <div><strong>Vreme:</strong> {termin.vremePocetka} - {termin.vremeZavrsetka}</div>
                            <div><strong>Status:</strong> {termin.status}</div>
                          </div>
                        ))
                      ) : (
                        <p className='text-muted'>Nema dostupnih termina.</p>
                      )}
                    </div>
                  )}
                </div>
            </div>
            </div>
        ))}
        <button className='btn btn-secondary' onClick={() => navigate(-1)}>Nazad</button>
        <div className='d-flex mb-5 justify-content-end align-items-center'>
          <div>Prikaza po stranici: </div>
          <div>
            <select
              className='form-select mx-2'
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                handlePageOptionChange("change", Number(e.target.value));
                setCurrentPageSize(Number(e.target.value));
              }}
              style={{ width: "80px" }}
              value={currentPageSize}
            >
              <option>2</option>
              <option>4</option>
              <option>6</option>
              <option>10</option>
            </select>
          </div>
          <div className='mx-2'>
            {getPageDetails()}
          </div>
          <button
            className='btn btn-outline-secondary px-3 mx-2'
            onClick={() => handlePageOptionChange("prev")}
            disabled={pageOptions.pageNumber === 1}
          >
            <i className='bi bi-chevron-left'></i>
          </button>
          <button
            className='btn btn-outline-secondary px-3 mx-2'
            onClick={() => handlePageOptionChange("next")}
            disabled={pageOptions.pageNumber * pageOptions.pageSize >= totalRecords}
          >
            <i className='bi bi-chevron-right'></i>
          </button>
        </div>
        </div>
        <Footer />
    </>
  );
}

export default SportskiObjektiWithLocation
