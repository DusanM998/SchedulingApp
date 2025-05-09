import React, { useEffect, useState } from 'react'
import sportskiObjekatModel from '../../Interfaces/sportskiObjekatModel';
import { SD_SortTypes } from '../../Utility/SD';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSportskiObjektiQuery } from '../../apis/sportskiObjekatApi';
import { RootState } from '../../Storage/Redux/store';
import { setSportskiObjekat } from '../../Storage/Redux/sportskiObjekatSlice';
import { MainLoader } from '../../Components/Page/Common';
import { Carousel } from 'react-bootstrap';
import SportskiObjekatCard from './SportskiObjekatCard';
import maps from "../../Assets/Images/maps.jpg";
import { Footer } from '../../Components/Layout';

function SportskiObjektiPage() {

    const [sportskiObjekti, setSportskiObjekti] = useState<sportskiObjekatModel[]>([]);
    const [selektovanaVrstaSporta, setSelektovanaVrstaSporta] = useState("Sve");
    const [vrstaSportaList, setVrstaSportaList] = useState([""]);
    const [vrstaSportaNaziv, setVrstaSportaNaziv] = useState(SD_SortTypes.Naziv_A_Z);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetSportskiObjektiQuery(null);
    
    const sortOptions: Array<SD_SortTypes> = [
        SD_SortTypes.Naziv_A_Z,
        SD_SortTypes.Naziv_Z_A,
    ];

    const searchValue = useSelector(
        (state: RootState) => state.sportskiObjekatStore.searchSportskiObjekat
    );

    useEffect(() => {
          if (!isLoading && data) {
            dispatch(setSportskiObjekat(data)); // Ažuriranje globalnog stanja
            setSportskiObjekti([...data]); // Prikazuje sve sportske objekte
    
            console.log(data);
        
            const tempCategoryList = ["Sve"];
            data.forEach((item: sportskiObjekatModel) => {
              if (!tempCategoryList.includes(item.vrstaSporta)) {
                tempCategoryList.push(item.vrstaSporta);
              }
            });
        
            setVrstaSportaList(tempCategoryList);
            setSelektovanaVrstaSporta("Sve"); // Postavlja selektovanu kategoriju na "Sve"
          }
        }, [isLoading, data, dispatch]);
      
        useEffect(() => {
          if (data) {
            setSportskiObjekti(handleFilters(vrstaSportaNaziv, selektovanaVrstaSporta, searchValue));
          }
        }, [searchValue, vrstaSportaNaziv, selektovanaVrstaSporta, data]);
    
        const handleCategoryClick = (index: number) => {
          const selectedCategory = vrstaSportaList[index];
          setSelektovanaVrstaSporta(selectedCategory);
      
          const buttons = document.querySelectorAll(".custom-buttons");
          buttons.forEach((button, i) => {
            button.classList.toggle("active", i === index);
          });
      
          if (selectedCategory === "Sve") {
            setSportskiObjekti([...data]); // Prikazuje sve sportske objekte
          } else {
            setSportskiObjekti(handleFilters(vrstaSportaNaziv, selectedCategory, searchValue));
          }
        };
        
        const handleFilters = (sortType: SD_SortTypes, vrstaSporta: string, search: string) => {
          //let tempMenuItems = [...data];
          let tempArray = vrstaSporta === "Sve" ? [...data] : data.filter((item: sportskiObjekatModel) => (
            item.vrstaSporta.toUpperCase() === vrstaSporta.toUpperCase()
          ));
          
          //Funkcionalnost za pretrazivanje proizvoda
          if (search) {
            const tempArray2 = [...tempArray];
            tempArray = tempArray2.filter((item: sportskiObjekatModel) =>
              item.naziv.toUpperCase().includes(search.toUpperCase())
            );
          }
      
          //Funkcionalnost za sortiranje proizvoda
          if (sortType === SD_SortTypes.Naziv_A_Z) {
            tempArray.sort((a: sportskiObjekatModel, b: sportskiObjekatModel) =>
              a.naziv.toUpperCase().charCodeAt(0) -
              b.naziv.toUpperCase().charCodeAt(0));
          }
          if (sortType === SD_SortTypes.Naziv_Z_A) {
            tempArray.sort((a: sportskiObjekatModel, b: sportskiObjekatModel) =>
              b.naziv.toUpperCase().charCodeAt(0) -
              a.naziv.toUpperCase().charCodeAt(0));
          }
      
          return tempArray;
        };
        
        
        const handleSortClick = (i: number) => {
          setVrstaSportaNaziv(sortOptions[i]);
          const tempArray = handleFilters(
            sortOptions[i],
            selektovanaVrstaSporta,
            searchValue,
          );
          setSportskiObjekti(tempArray);
        };
      
        if (isLoading) {
          return <MainLoader />
        }
        
        const itemsPerSlide = 3;
        const groupedSportskiObjekti = [];
        for (let i = 0; i < sportskiObjekti.length; i += itemsPerSlide) {
        groupedSportskiObjekti.push(sportskiObjekti.slice(i, i + itemsPerSlide));
        }

  return (
    <div>
      <div className='container w-100 mb-5' id='containerObjekti'>
      <div className='container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between p-5'>
        <div className='col-md-6 text-start'>
          <h1 style={{ color: "#51285f", fontSize: "3rem" }} className="fw-bold">Sportski objekti</h1>
          <h2 className="text-success fw-bold mt-2">Lista svih dostupnih sportskih objekata</h2>
          <p className='mt-4 text-secondary fs-5'>Proveri dostupnost sportskih objekata, njihovu lokaciju, kao i slobodne termine.</p>
        </div>
      </div>
      <div className="my-3">
        <ul className='nav w-100 d-flex justify-content-center'>
          {vrstaSportaList.map((vrstaSporta, index) => (
            <li className='nav-item'
            style={{...(index === 0 && {marginLeft:"auto"})}}  key={index}>
              <button
                className={`nav-link p-0 pb-2 custom-buttons fs-5 ${
                  index === 0 && "active"
                }`}
                onClick={() => handleCategoryClick(index)}>
                  {vrstaSporta}
              </button>
            </li>
          ))}
          <li className='nav-item dropdown' style={{ marginLeft: "auto" }}>
            <div
              className='nav-link dropdown-toggle text-dark fs-6 border'
              role='button'
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
            {vrstaSportaNaziv}  
            </div>
            <ul className='dropdown-menu'>
              {sortOptions.map((sortType, index) => (
                <li key={index} className='dropdown-item'
                  onClick={()=> handleSortClick(index)}>
                  {sortType}
                </li>
                ))}
            </ul>
          </li>
        </ul>
      </div>
      <div className="container position-relative bg-light rounded">
      <Carousel
        indicators={false}
        interval={null}
        className="w-100"
        nextIcon={<span className="carousel-control-next-icon bg-dark rounded-circle p-3" />}
        prevIcon={<span className="carousel-control-prev-icon bg-dark rounded-circle p-3" />}
      >
        {groupedSportskiObjekti.map((group, index) => (
          <Carousel.Item key={index} className="w-100">
            <div className="container">
              <div className="row gx-3 gap-3 justify-content-center">
                {group.map((sportskiObjekat: sportskiObjekatModel, subIndex: number) => (
                  <div key={subIndex} className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex justify-content-center">
                    <SportskiObjekatCard sportskiObjekat={sportskiObjekat} key={subIndex}/>
                  </div>
                ))}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
    <div className='container-flud d-flex rounded flex-column flex-md-row align-items-center justify-content-between mt-5'
      style={{backgroundColor:"#daefe0"}}
      >
      <div className='col-md-6 text-start'>
        <h3 style={{fontSize:"3rem", color:"#51285f"}} className='fw-bold m-5'>Lokacije sportsth objekata</h3>
        <p className='m-5 text-secondary fs-5'>Svi sportski objekti na jednom mestu. Proverite lokaciju i rezervišite termin u Vašoj blizini.</p>
        <button className='btn btn-lg m-5' style={{backgroundColor:"#26a172", color:"white"}}>Pretraži sportske objekte</button>
      </div>
        <div className='col-md-6 text-center'>
          <img
            src={maps}
            className='img-fluid'
            style={{ width: "100%", height: "100%", objectFit: "cover", borderTopRightRadius: "0.5rem", borderBottomRightRadius: "0.5rem" }}
          />
        </div>
    </div>
      </div>
      <Footer />
    </div>
    
    
  )
}

export default SportskiObjektiPage;
