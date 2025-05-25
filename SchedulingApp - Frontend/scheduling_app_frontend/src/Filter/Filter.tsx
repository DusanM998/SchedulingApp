import React, { useState } from 'react'
import { useGetRecordsQuery } from '../apis/filterApi';
import { inputHelper } from '../Helper';
import { MainLoader } from '../Components/Page/Common';

function Filter() {
    const [recordsData, setRecordsData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchClicked, setSearchClicked] = useState(false); //da bi se filter izvrsio tek nakon klika na dugme
    const [apiFilters, setApiFilters] = useState({
        lokacija: "",
        vrstaSporta: "",
        datumTermina: "",
    });

    const [filters, setFilters] = useState({
        lokacija: "",
        vrstaSporta: "",
        datumTermina: "",
    })

    const [pageOptions, setPageOptions] = useState({
        pageNumber: 1,
        pageSize: 5,
    });

    const [currentPageSize, setCurrentPageSize] = useState(pageOptions.pageSize);

    // Formatira datum u "YYYY-MM-DD"
    const formatDate = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    // Formatira vreme u "HH:mm"
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString("sr-RS", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        });
    };

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
      datumTermina: apiFilters.datumTermina,
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
        
      setApiFilters({
          lokacija: filters.lokacija,
          vrstaSporta: filters.vrstaSporta,
          datumTermina: filters.datumTermina,
      });

      setPageOptions((prev) => ({
        ...prev,
        pageNumber: 1, // resetuj na prvu stranicu prilikom filtriranja
      }));

      setSearchClicked(true);
    };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Pretraga termina</h3>
      <form className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Lokacija</label>
          <input
            type="text"
            className="form-control"
            name="lokacija"
            value={filters.lokacija}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Vrsta Sporta</label>
          <input
            type="text"
            className="form-control"
            name="vrstaSporta"
            value={filters.vrstaSporta}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Datum</label>
          <input
            type="date"
            className="form-control"
            name="datumTermina"
            value={filters.datumTermina}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" onClick={handleFilters}>Pretraži</button>
        </div>
      </form>

      <div className="mt-4">
        {isLoading ? (
          <MainLoader />
        ) : data && data.apiResponse.result.length > 0 ? (
          <>
            <h5>Pronađeno: {data.apiResponse.result.length} termina</h5>
            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>ID objekta</th>
                    <th>Datum</th>
                    <th>Vreme</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.apiResponse.result.map((termin: any, index: number) => (
                    <tr key={index}>
                        <td>{termin.terminId}</td>
                        <td>{termin.sportskiObjekatId}</td>
                        <td>{new Date(termin.datumTermina).toLocaleDateString('sr-RS')}</td>
                        <td>{termin.vremePocetka} - {termin.vremeZavrsetka}</td>
                        <td>{termin.status}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </>
        ) : (
          <p className="mt-3">Nema rezultata za zadate kriterijume.</p>
        )}
      </div>
    </div>
  );
}

export default Filter
