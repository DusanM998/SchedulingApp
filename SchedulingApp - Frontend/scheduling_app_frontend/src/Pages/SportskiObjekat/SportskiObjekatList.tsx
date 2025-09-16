import React, { useEffect, useState } from "react";
import sportskiObjekatModel from "../../Interfaces/sportskiObjekatModel";
import { Carousel } from "react-bootstrap";
import { MainLoader } from "../../Components/Page/Common";
import { useDispatch, useSelector } from "react-redux";
import { useGetSportskiObjektiQuery } from "../../apis/sportskiObjekatApi";
import { SD_SortTypes } from "../../Utility/SD";
import { RootState } from "../../Storage/Redux/store";
import SportskiObjekatCard from "./SportskiObjekatCard";
import { setSportskiObjekat } from "../../Storage/Redux/sportskiObjekatSlice";

function SportskiObjekatList() {
  const [sportskiObjekti, setSportskiObjekti] = useState<
    sportskiObjekatModel[]
  >([]);
  const [selektovanaVrstaSporta, setSelektovanVrstaSporta] = useState("Sve");
  const [vrstaSportaList, setVrstaSportaList] = useState([""]);
  const [vrstaSportaNaziv, setVrstaSportaNaziv] = useState(
    SD_SortTypes.Naziv_A_Z
  );
  const [localSearch, setLocalSearch] = useState("");
  const dispatch = useDispatch();
  const { data, isLoading } = useGetSportskiObjektiQuery(null);

  //console.log(data);

  const sortOptions: Array<SD_SortTypes> = [
    SD_SortTypes.Naziv_A_Z,
    SD_SortTypes.Naziv_Z_A,
  ];

  const searchValue = useSelector(
    (state: RootState) => state.sportskiObjekatStore.searchSportskiObjekat
  );

  /*useEffect(() => {
      if (data) {
        const tempSportskiObjekatNiz = handleFilters(vrstaSportaNaziv,selektovanaVrstaSporta, searchValue);
        setSportskiObjekti(tempSportskiObjekatNiz);
      }
    }, [searchValue]);*/ //Pokrece se svaki put kada se promeni vrednost searchValue

  useEffect(() => {
    if (!isLoading && data) {
      dispatch(setSportskiObjekat(data)); // Azuriranje globalnog stanja
      setSportskiObjekti([...data]); // Prikazuje sve sportske objekte

      console.log(data);

      // Generisanje liste kategorija
      const tempCategoryList = ["Sve"];
      data.forEach((item: sportskiObjekatModel) => {
        if (!tempCategoryList.includes(item.vrstaSporta)) {
          tempCategoryList.push(item.vrstaSporta);
        }
      });

      setVrstaSportaList(tempCategoryList);
      setSelektovanVrstaSporta("Sve"); // Postavlja selektovanu kategoriju na "Sve" (pocetna vrednost)
    }
  }, [isLoading, data, dispatch]);

  useEffect(() => {
    if (data) {
      setSportskiObjekti(
        handleFilters(
          vrstaSportaNaziv,
          selektovanaVrstaSporta,
          localSearch || searchValue
        )
      );
    }
  }, [
    localSearch,
    searchValue,
    vrstaSportaNaziv,
    selektovanaVrstaSporta,
    data,
  ]);

  const handleCategoryClick = (index: number) => {
    const selectedCategory = vrstaSportaList[index];
    setSelektovanVrstaSporta(selectedCategory);

    const buttons = document.querySelectorAll(".custom-buttons");
    buttons.forEach((button, i) => {
      button.classList.toggle("active", i === index);
    });

    if (selectedCategory === "Sve") {
      setSportskiObjekti([...data]); // Prikazuje sve sportske objekte
    } else {
      setSportskiObjekti(
        handleFilters(vrstaSportaNaziv, selectedCategory, searchValue)
      );
    }
  };

  // Logika za filtriranje i sortiranje
  const handleFilters = (
    sortType: SD_SortTypes,
    vrstaSporta: string,
    search: string
  ) => {
    //let tempMenuItems = [...data];
    let tempArray =
      vrstaSporta === "Sve" // Ako je izabrano "Sve", prikazem sve objekte
        ? [...data]
        : data.filter(
            // u suprotnom filtriram po izabranoj kategoriji
            (item: sportskiObjekatModel) =>
              item.vrstaSporta.toUpperCase() === vrstaSporta.toUpperCase()
          );

    //Funkcionalnost za pretrazivanje sportskog objekta
    if (search) {
      const normalize = (text: string) =>
        text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const searchNormalized = normalize(search);

      tempArray = tempArray.filter(
        (item: sportskiObjekatModel) =>
          normalize(item.naziv).includes(searchNormalized) ||
          normalize(item.lokacija).includes(searchNormalized)
      );
    }

    //Funkcionalnost za sortiranje
    if (sortType === SD_SortTypes.Naziv_A_Z) {
      tempArray.sort((a: sportskiObjekatModel, b: sportskiObjekatModel) =>
        a.naziv.toUpperCase().localeCompare(b.naziv.toUpperCase())
      );
    }
    if (sortType === SD_SortTypes.Naziv_Z_A) {
      tempArray.sort((a: sportskiObjekatModel, b: sportskiObjekatModel) =>
        b.naziv.toUpperCase().localeCompare(a.naziv.toUpperCase())
      );
    }

    return tempArray;
  };

  const handleSortClick = (i: number) => {
    setVrstaSportaNaziv(sortOptions[i]);
    const tempArray = handleFilters(
      sortOptions[i],
      selektovanaVrstaSporta,
      searchValue
    );
    setSportskiObjekti(tempArray);
  };

  if (isLoading) {
    return <MainLoader />;
  }

  const itemsPerSlide = 6;
  const groupedSportskiObjekti = [];
  for (let i = 0; i < sportskiObjekti.length; i += itemsPerSlide) {
    groupedSportskiObjekti.push(sportskiObjekti.slice(i, i + itemsPerSlide));
  }

  return (
    <div className="container w-100" id="containerObjekti">
      <div className="my-3">
        <div className="my-3 d-flex justify-content-center">
          <div className="position-relative w-50">
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Pretraži objekat po nazivu ili lokaciji..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{
                borderRadius: "20px",
                padding: "10px 40px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "2px solid transparent",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#51285f")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
            <span
              className="position-absolute start-0 top-50 translate-middle-y ps-3"
              style={{ color: "#6c757d" }}
            >
              <i className="bi bi-search"></i>
            </span>
            {localSearch && (
              <button
                className="position-absolute end-0 top-50 translate-middle-y pe-3 border-0 bg-transparent"
                onClick={() => setLocalSearch("")}
                style={{ color: "#6c757d" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
        <ul className="nav w-100 d-flex justify-content-center">
          {vrstaSportaList.map((vrstaSporta, index) => (
            <li
              className="nav-item"
              style={{ ...(index === 0 && { marginLeft: "auto" }) }}
              key={index}
            >
              <button
                className={`nav-link p-0 pb-2 custom-buttons fs-5 ${
                  index === 0 && "active"
                }`}
                onClick={() => handleCategoryClick(index)}
              >
                {vrstaSporta}
              </button>
            </li>
          ))}
          <li className="nav-item dropdown" style={{ marginLeft: "auto" }}>
            <div
              className="nav-link dropdown-toggle text-dark fs-6 border"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {vrstaSportaNaziv}
            </div>
            <ul className="dropdown-menu">
              {sortOptions.map((sortType, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSortClick(index)}
                >
                  {sortType}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div className="container position-relative">
        <Carousel
          indicators={false}
          interval={null}
          className="w-100"
          nextIcon={
            <span className="carousel-control-next-icon bg-dark rounded-circle p-3" />
          }
          prevIcon={
            <span className="carousel-control-prev-icon bg-dark rounded-circle p-3" />
          }
        >
          {groupedSportskiObjekti.map((group, index) => (
            <Carousel.Item key={index} className="w-100">
              <div className="container">
                <div className="row gx-3 gap-3 justify-content-center">
                  {group.map(
                    (
                      sportskiObjekat: sportskiObjekatModel,
                      subIndex: number
                    ) => (
                      <div
                        key={subIndex}
                        className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex justify-content-center"
                      >
                        <SportskiObjekatCard
                          sportskiObjekat={sportskiObjekat}
                          key={subIndex}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

export default SportskiObjekatList;
