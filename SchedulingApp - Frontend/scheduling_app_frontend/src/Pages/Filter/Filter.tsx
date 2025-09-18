import React, { useState } from "react";
import { useGetRecordsQuery } from "../../apis/filterApi";
import { inputHelper } from "../../Helper";
import { MainLoader } from "../../Components/Page/Common";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Filter() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchClicked, setSearchClicked] = useState(false);
  const [filters, setFilters] = useState({
    lokacija: "",
    vrstaSporta: "",
    datum: "",
  });

  const [apiFilters, setApiFilters] = useState({
    lokacija: "",
    vrstaSporta: "",
    datum: "",
  });

  const [pageOptions, setPageOptions] = useState({
    pageNumber: 1,
    pageSize: 5,
  });

  const { data, isLoading } = useGetRecordsQuery(
    {
      ...apiFilters,
      pageNumber: pageOptions.pageNumber,
      pageSize: pageOptions.pageSize,
    },
    { skip: !searchClicked }
  );

  const recordsData = data?.data || [];
  let totalRecords = 0;

  if (data?.totalRecords) {
    try {
      const parsed = JSON.parse(data.totalRecords);
      totalRecords = parsed.TotalRecords || 0;
    } catch (e) {
      console.error("Greška u parsiranju X-Pagination:", e);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters(inputHelper(e, filters));
  };

  const handleFilters = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDatum = filters.datum ? `${filters.datum}T00:00:00` : "";

    setApiFilters({
      lokacija: filters.lokacija,
      vrstaSporta: filters.vrstaSporta,
      datum: formattedDatum,
    });

    setPageOptions((prev) => ({ ...prev, pageNumber: 1 }));
    setSearchClicked(true);
  };

  const getPageDetails = () => {
    const dataStart = (pageOptions.pageNumber - 1) * pageOptions.pageSize + 1;
    const dataEnd = Math.min(
      pageOptions.pageNumber * pageOptions.pageSize,
      totalRecords
    );
    return `${dataStart} - ${dataEnd} od ${totalRecords}`;
  };

  const handlePageOptionChange = (direction: string, pageSize?: number) => {
    if (direction === "prev") {
      setPageOptions((prev) => ({ ...prev, pageNumber: prev.pageNumber - 1 }));
    } else if (direction === "next") {
      setPageOptions((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
    } else if (direction === "change") {
      setPageOptions({ pageNumber: 1, pageSize: pageSize || 5 });
    }
  };

  const handlePageNumberChange = (pageNumber: number) => {
    setPageOptions((prev) => ({ ...prev, pageNumber }));
  };

  const getTotalPages = () => Math.ceil(totalRecords / pageOptions.pageSize);

  const getVisiblePages = () => {
    const totalPages = getTotalPages();
    const current = pageOptions.pageNumber;
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) start = Math.max(1, end - 4);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center" style={{ color: "#51285f" }}>
        {t("filter.searchTerm")}
      </h2>
      <form
        className="row g-3 justify-content-center card shadow p-4 border mx-auto"
        style={{ maxWidth: "900px" }}
        onSubmit={handleFilters}
      >
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">{t("sportskiObjektiPage.location")}</label>
          <input
            type="text"
            className="form-control"
            name="lokacija"
            value={filters.lokacija}
            onChange={handleChange}
            placeholder={t("filter.locationPlaceholder")}
          />
        </div>
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">{t("filter.typeOfSport")}</label>
          <input
            type="text"
            className="form-control"
            name="vrstaSporta"
            value={filters.vrstaSporta}
            onChange={handleChange}
            placeholder={t("filter.sportPlaceholder")}
          />
        </div>
        <div className="col-12 col-md-6 mx-auto">
          <label className="form-label">{t("rezervacijaSummary.date")}</label>
          <input
            type="date"
            className="form-control"
            name="datum"
            value={filters.datum}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 d-flex justify-content-center gap-2 mt-3">
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#51285f", color: "white" }}
          >
            <i className="bi bi-search me-2"></i>{t("filter.searchBtn")}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              navigate(-1);
              setSearchClicked(false);
              setFilters({ lokacija: "", vrstaSporta: "", datum: "" });
              setApiFilters({ lokacija: "", vrstaSporta: "", datum: "" });
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>{t("sportskiObjektiPage.backBtn")}
          </button>
        </div>
      </form>

      <div className="mt-4">
        {isLoading ? (
          <MainLoader />
        ) : searchClicked && recordsData.length > 0 ? (
          <>
            <div
              className="alert"
              style={{
                backgroundColor: "#f8f9fa",
                borderColor: "#51285f",
                color: "#51285f",
              }}
            >
              <h5 className="mb-0">
                <i className="bi bi-check-circle-fill me-2"></i>
                Pronađeno: {totalRecords}{" "}
                {totalRecords === 1 ? "termin" : "termina"}
              </h5>
            </div>

            {/* Pagination Controls - Top */}
            <div className="d-flex mb-3 justify-content-between align-items-center flex-wrap">
              <div className="d-flex align-items-center">
                <span className="me-2">Prikaza po stranici:</span>
                <select
                  className="form-select"
                  onChange={(e) =>
                    handlePageOptionChange("change", Number(e.target.value))
                  }
                  style={{ width: "80px" }}
                  value={pageOptions.pageSize}
                >
                  <option>5</option>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
              </div>
              <div className="text-muted">{getPageDetails()}</div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center mt-3">
                <thead style={{ backgroundColor: "#51285f", color: "white" }}>
                  <tr>
                    <th>#</th>
                    <th>Sportski Objekat</th>
                    <th>Datum</th>
                    <th>Vreme</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsData.map((termin: any, index: number) => (
                    <tr key={termin.terminId || index}>
                      <td>
                        <strong>{termin.terminId}</strong>
                      </td>
                      <td className="fw-bold">
                        {termin.nazivSportskogObjekta}
                      </td>
                      <td>
                        {new Date(termin.datumTermina).toLocaleDateString(
                          "sr-RS"
                        )}
                      </td>
                      <td>
                        <span className="text-primary fw-bold">
                          {termin.vremePocetka} - {termin.vremeZavrsetka}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            termin.status === "Slobodan"
                              ? "bg-success"
                              : termin.status === "Istekao"
                              ? "bg-warning"
                              : "bg-danger"
                          } px-3 py-2`}
                          style={{ fontSize: "0.85em" }}
                        >
                          {termin.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Bottom */}
            {totalRecords > pageOptions.pageSize && (
              <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination pagination-lg">
                  {pageOptions.pageNumber > 1 && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => handlePageNumberChange(1)}
                        style={{ color: "#51285f" }}
                      >
                        <i className="bi bi-chevron-double-left"></i>
                      </button>
                    </li>
                  )}
                  <li
                    className={`page-item ${
                      pageOptions.pageNumber === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageOptionChange("prev")}
                      style={{ color: "#51285f" }}
                      disabled={pageOptions.pageNumber === 1}
                    >
                      <i className="bi bi-chevron-left me-1"></i>Prethodna
                    </button>
                  </li>
                  {getVisiblePages().map((page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        pageOptions.pageNumber === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageNumberChange(page)}
                        style={
                          pageOptions.pageNumber === page
                            ? {
                                backgroundColor: "#51285f",
                                borderColor: "#51285f",
                              }
                            : { color: "#51285f" }
                        }
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      pageOptions.pageNumber * pageOptions.pageSize >=
                      totalRecords
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageOptionChange("next")}
                      style={{ color: "#51285f" }}
                      disabled={
                        pageOptions.pageNumber * pageOptions.pageSize >=
                        totalRecords
                      }
                    >
                      Sledeća<i className="bi bi-chevron-right ms-1"></i>
                    </button>
                  </li>
                  {pageOptions.pageNumber < getTotalPages() && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => handlePageNumberChange(getTotalPages())}
                        style={{ color: "#51285f" }}
                      >
                        <i className="bi bi-chevron-double-right"></i>
                      </button>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </>
        ) : searchClicked ? (
          <div className="alert alert-warning mt-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Nema pronađenih termina za zadate kriterijume.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Filter;
