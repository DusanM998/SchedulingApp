import React, { useState } from 'react'
import { useGetRecordsQuery } from '../apis/filterApi';

function Filter() {
  const [lokacija, setLokacija] = useState("");
  const [datum, setDatum] = useState("");
  const [vremePocetka, setVremePocetka] = useState("");
  const [vremeZavrsetka, setVremeZavrsetka] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [params, setParams] = useState({
    lokacija: "",
    datum: "",
    vremePocetka: "",
    vremeZavrsetka: "",
    pageNumber: 1,
    pageSize: 5
  });

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

  const { data, isFetching } = useGetRecordsQuery(params, {
    skip: !trigger,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({
      lokacija,
      datum: formatDate(new Date(datum)),
      vremePocetka: vremePocetka,
      vremeZavrsetka: vremeZavrsetka,
      pageNumber: 1,
      pageSize: 5,
    });
    setTrigger(true);
    //refetch();
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Pretraga termina</h3>
      <form onSubmit={handleSearch} className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Lokacija</label>
          <input
            type="text"
            className="form-control"
            value={lokacija}
            onChange={(e) => setLokacija(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Datum</label>
          <input
            type="date"
            className="form-control"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Vreme početka</label>
          <input
            type="time"
            className="form-control"
            value={vremePocetka}
            onChange={(e) => setVremePocetka(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Vreme završetka</label>
          <input
            type="time"
            className="form-control"
            value={vremeZavrsetka}
            onChange={(e) => setVremeZavrsetka(e.target.value)}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Pretraži</button>
        </div>
      </form>

      <div className="mt-4">
        {isFetching ? (
          <p>Učitavanje...</p>
        ) : data && data.apiResponse.result.length > 0 ? (
          <>
            <h5>Pronađeno: {JSON.parse(data.totalRecords).totalRecords} termina</h5>
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
                        <td>{new Date(termin.datumTermina).toLocaleDateString()}</td>
                        <td>{termin.vremePocetka} - {termin.vremeZavrsetka}</td>
                        <td>{termin.status}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </>
        ) : trigger ? (
          <p>Nema rezultata za zadate kriterijume.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Filter
