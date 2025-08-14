import React, { useEffect, useState } from 'react'
import { useGetRecordsQuery } from '../../apis/filterApi';
import { inputHelper } from '../../Helper';
import { MainLoader } from '../../Components/Page/Common';
import { useNavigate } from 'react-router-dom';

function Filter() {
    const navigate = useNavigate();
    const [recordsData, setRecordsData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchClicked, setSearchClicked] = useState(false); //da bi se filter izvrsio tek nakon klika na dugme
    const [apiFilters, setApiFilters] = useState({
        lokacija: "",
        vrstaSporta: "",
        datum: "",
    });

    const [filters, setFilters] = useState({
        lokacija: "",
        vrstaSporta: "",
        datum: "",
    })

    const [pageOptions, setPageOptions] = useState({
        pageNumber: 1,
        pageSize: 5,
    });

    const [currentPageSize, setCurrentPageSize] = useState(pageOptions.pageSize);

    /*const { data, isLoading } = useGetRecordsQuery({
      ...(apiFilters && {
          lokacija: apiFilters.lokacija,
          vrstaSporta: apiFilters.vrstaSporta,
          datum: apiFilters.datum,
          pageNumber: pageOptions.pageNumber,
          pageSize: pageOptions.pageSize
      },
      {
        skip: !searchClicked
      }
      )
    });*/
    const { data, isLoading } = useGetRecordsQuery(
    {
      lokacija: apiFilters.lokacija,
      vrstaSporta: apiFilters.vrstaSporta,
      datum: apiFilters.datum,
      pageNumber: pageOptions.pageNumber,
      pageSize: pageOptions.pageSize,
    },
    {
      skip: !searchClicked, // skipuj poziv ako nije kliknuto na Pretrazi
    }
  );

  console.log("Logujem data: ", data);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const tempValue = inputHelper(e, filters);
        setFilters(tempValue);
    };

    const handleFilters = (e: React.FormEvent) => {
      e.preventDefault();

      const formattedDatum = filters.datum
        ? `${filters.datum}T00:00:00`
        : "";

        console.log("Formatted Datum: ", formattedDatum);

      setApiFilters({
          lokacija: filters.lokacija,
          vrstaSporta: filters.vrstaSporta,
          datum: formattedDatum,
      });

      setPageOptions((prev) => ({
        ...prev,
        pageNumber: 1, // resetuj na prvu stranicu prilikom filtriranja
      }));

      setSearchClicked(true);
    };

    const getPageDetails = () => {
      const dataStartNumber = (pageOptions.pageNumber - 1) * pageOptions.pageSize + 1;
      const dataEndNumber = pageOptions.pageNumber * pageOptions.pageSize;

      return `${dataStartNumber} - 
        ${dataEndNumber < totalRecords ? dataEndNumber : totalRecords} od ${totalRecords}`;
    };

    const handlePageOptionChange = (direction: string, pageSize?: number) => {
      if (direction === "prev") {
        setPageOptions({ pageSize: 5, pageNumber: pageOptions.pageNumber - 1 });
      } else if (direction === "next") {
        setPageOptions({ pageSize: 5, pageNumber: pageOptions.pageNumber + 1 });
      } else if (direction === "change") {
        setPageOptions({
          pageSize: pageSize ? pageSize : 5,
          pageNumber: 1,
        });
      }
    };

    useEffect(() => {
      if (data) {
        setRecordsData(data.apiResponse.result);
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


  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center" style={{ color:"#51285f" }}>Pretraga termina</h2>
      <form className="row g-3 justify-content-center card shadow p-4 border mx-auto" style={{ maxWidth: "900px" }}>
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">Lokacija</label>
          <input
            type="text"
            className="form-control"
            name="lokacija"
            value={filters.lokacija}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">Vrsta Sporta</label>
          <input
            type="text"
            className="form-control"
            name="vrstaSporta"
            value={filters.vrstaSporta}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">Datum</label>
          <input
            type="date"
            className="form-control"
            name="datum"
            value={filters.datum}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 d-flex justify-content-center gap-2 mt-3">
          <button type="submit" 
            className="btn" 
            onClick={handleFilters}
            style={{ backgroundColor:"#51285f", color:"white" }}>Pretraži</button>
          <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                navigate(-1);
                setSearchClicked(false);
                setFilters({ lokacija: "", vrstaSporta: "", datum: "" });
                setApiFilters({ lokacija: "", vrstaSporta: "", datum: "" });
              }}
            >
              Nazad
          </button>
        </div>
      </form>

      <div className="mt-4">
        {isLoading ? (
          <MainLoader />
        ) : data && data.apiResponse.result.length > 0 ? (
          <>
            {data.apiResponse.result.length === 1 ? (
            <div className="alert alert-success">
              <h5>Pronađeno: {totalRecords} termin</h5>
            </div>
            ) : (
            <div className="alert alert-success">
              <h5>Pronađeno: {totalRecords} termina</h5>
            </div>
            )}
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
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
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
            <table className="table table-bordered table-hover text-center mt-3">
                <thead className='table-light'>
                    <tr>
                    <th>#</th>
                    <th>Sportski Objekat</th>
                    <th>Datum</th>
                    <th>Vreme</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody className="fade show animate__animated animate__fadeIn">
                    {data.apiResponse.result.map((termin: any, index: number) => (
                    <tr key={index}>
                        <td>{termin.terminId}</td>
                        <td style={{ cursor: "pointer" }}>{termin.nazivSportskogObjekta}</td>
                        <td>{new Date(termin.datumTermina).toLocaleDateString('sr-RS')}</td>
                        <td>{termin.vremePocetka} - {termin.vremeZavrsetka}</td>
                        <td 
                          className={`badge ${termin.status === "Slobodan" ? "bg-success" : "bg-danger"} m-2`}
                          style={{ color: "white" }}>{termin.status}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {totalRecords > pageOptions.pageSize && (
              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                  <li className={`page-item ${pageOptions.pageNumber === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => handlePageOptionChange("prev")}>Prethodna</button>
                  </li>
                  {Array.from({ length: Math.ceil(totalRecords / pageOptions.pageSize) }, (_, i) => i + 1).map((page) => (
                    <li key={page} className={`page-item ${pageOptions.pageNumber === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPageOptions({ ...pageOptions, pageNumber: page })}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pageOptions.pageNumber * pageOptions.pageSize >= totalRecords ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => handlePageOptionChange("next")}>Sledeća</button>
                  </li>
                </ul>
              </nav>
            )}

          </>
        ) : (
          searchClicked && (
          <div className="alert alert-warning mt-3">Nema pronađenih termina za zadate kriterijume.</div>
        ))}
      </div>
    </div>
  );
}

export default Filter;
