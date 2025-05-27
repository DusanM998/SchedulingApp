import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useGetSveRezervacijeQuery } from '../../apis/rezervacijaApi';
import { MainLoader } from '../../Components/Page/Common';
import RezervacijaLista from './RezervacijaLista';
import { inputHelper } from '../../Helper';
import { SD_Status } from '../../Utility/SD';

const filterOptions = [
  "Sve",
  SD_Status.Potvrdjena,
  SD_Status.U_Toku,
  SD_Status.Otkazana,
  SD_Status.Zavrsena,
];

function MojeRezervacije() {

    const userId = useSelector((state: RootState) => state.userAuthStore.id);
    //const { data, isLoading } = useGetSveRezervacijeQuery({ userId });

    console.log("Logujem data za korisnicku rezervaciju");

    const [rezervacijaData, setRezervacijaData] = useState([]);
    const [filters, setFilters] = useState({ searchString: "", status: "" });
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageOptions, setPageOptions] = useState({
      pageNumber: 1,
      pageSize: 5,
    });
    
    const [currentPageSize, setCurrentPageSize] = useState(pageOptions.pageSize);
    
    const [apiFilters, setApiFilters] = useState({
      searchString: "",
      status: ""
    });
    
    const { data, isLoading } = useGetSveRezervacijeQuery({
      ...(apiFilters && {
        userId: userId,
        searchString: apiFilters.searchString,
        status: apiFilters.status,
        pageNumber: pageOptions.pageNumber,
        pageSize: pageOptions.pageSize,
      }),
    });
    
    //console.log("Logujem data: ", data);
    
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const tempValue = inputHelper(e, filters);
      setFilters(tempValue);
    };
    
    const handleFilters = () => {
      setApiFilters({
        searchString: filters.searchString,
        status: filters.status
      });
    };
    
    useEffect(() => {
      if (data) {
        setRezervacijaData(data.apiResponse.result);
        let total = 0;
        try {
          const parsed = JSON.parse(data.totalRecords);
          total = parsed.TotalRecords ?? 0;
        } catch (e) {
          console.error("Greška prilikom parsiranja totalRecords:", e);
        }
    
        setTotalRecords(total);
      }
    }, [data]);
    
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
  }

    

  return (
    <>
        {isLoading && <MainLoader />}
        {!isLoading && (
            <>
                <div className='d-flex align-items-center justify-content-between mx-5 mt-5'>
                    <h1 className='text' style={{ color: "#51285f" }}>Moje Rezervacije: </h1>
                    <div className='d-flex' style={{width: "40%"}}>
                      <input
                        type='text'
                        className='form-control mx-2'
                        placeholder='Pretraži'
                        name='searchString'
                        onChange={handleChange}
                      />
                      <select
                        className='form-select w-50 mx-2'
                        onChange={handleChange}
                        name='status'
                      >
                        {filterOptions.map((item, index) => (
                            <option key={index} value={item === "Sve" ? "" : item}>{item}</option>
                        ))}
                      </select>
                      <button
                        className='btn btn-outline'
                        style={{ backgroundColor: "#51285f", color: "white" }}
                        onClick={handleFilters}
                      >
                        Filtriraj
                      </button>
                    </div>
                </div>
                  {data?.apiResponse.result.length > 0 && (
                    <>
                    <RezervacijaLista
                        isLoading = {isLoading}
                        rezervacijaData = {data?.apiResponse.result}
                      />
                      <div className='d-flex mx-5 justify-content-end align-items-center'>
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
                                    onClick={() => handlePageOptionChange("prev")}
                                    disabled={pageOptions.pageNumber === 1}
                                    className='btn btn-outline-secondary px-3 mx-2'
                                  >
                                    <i className='bi bi-chevron-left'></i>
                                  </button>
                                  <button
                                    onClick={() => handlePageOptionChange("next")}
                                    disabled={pageOptions.pageNumber * pageOptions.pageSize >= totalRecords}
                                    className='btn btn-outline-secondary px-3 mx-2'
                                  >
                                    <i className='bi bi-chevron-right'></i>
                                  </button>
                                </div>
                    </>
                  )}
                  {!(data?.apiResponse.result.length > 0) && (
                      <div className='px-5 py-3'>
                        <h5 className="text-muted">Još uvek nemate rezervaciju.</h5>
                      </div>
                  )}
            </>
        )}
    </>
  )
}

export default MojeRezervacije
