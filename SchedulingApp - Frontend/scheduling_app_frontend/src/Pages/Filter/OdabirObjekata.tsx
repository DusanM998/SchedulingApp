import React from "react";
import { useGetSportskiObjektiQuery } from "../../apis/sportskiObjekatApi";
import { useGetTerminByIdQuery } from "../../apis/terminApi";
import { MainLoader } from "../../Components/Page/Common";
import "./odabirObjekata.css";
import "bootstrap/dist/css/bootstrap.min.css";

//import komponenti
import {
  KontaktPodaci,
  Objekti,
  Navigation,
  OdabirTermina,
  VasaRezervacija,
} from "./OdabirTerminaComponents";

// Import custom hook
import { useOdabirObjekata } from "./useOdabirObjekata";
import sportskiObjekatModel from "../../Interfaces/sportskiObjekatModel";

function OdabirObjekata() {
  const { data: objekti, isLoading } = useGetSportskiObjektiQuery(null);

  const {
    selectedObjekatId,
    showTermini,
    showObjekatAndTermini,
    activeTab,
    setActiveTab,
    menuVisible,
    selectedTermini,
    userInput,
    shoppingCartStore,
    handleUserInput,
    handleAddToCart,
    handleSelect,
    handleNastavi,
    handleOtkaziTeren,
    handleOtkaziTermine,
    handleKontaktPodaci,
    handleVasaRezervacija,
    handleOtkaziRezervaciju,
    handleBrojUcesnika,
    handleTerminSelection,
    handleConfirmSelection,
    navigate,
  } = useOdabirObjekata();

  const {
    data: termini,
    isLoading: loadingTermini,
    error,
  } = useGetTerminByIdQuery(selectedObjekatId, {
    skip: !showTermini || !selectedObjekatId,
  });

  const selectedObjekat = objekti?.find(
    (o: sportskiObjekatModel) => o.sportskiObjekatId === selectedObjekatId
  );

  const stavkaKorpe = shoppingCartStore.find(
    (stavka) => stavka.sportskiObjekatId === selectedObjekatId
  );

  if (isLoading) {
    return (
      <div>
        <MainLoader />
      </div>
    );
  }

  return (
    <div className="container mt-5 odabir-wrapper">
      <div className="row">
        <div className="col-md-3 col-12 mb-3">
          <Navigation 
            activeTab={activeTab}
            menuVisible={menuVisible}
            onTabChange={setActiveTab} />
        </div>
      </div>

      <div className="col-md-9 col-12">
        <div className="content-wrapper flex-fill border rounded p-3">
          {!showObjekatAndTermini && !showTermini && (
            <Objekti
              objekti={objekti}
              selectedObjekatId={selectedObjekatId}
              selectedObjekat={selectedObjekat}
              shoppingCartStore={shoppingCartStore}
              onSelect={handleSelect}
              onAddToCart={handleAddToCart}
              onOtkaziTeren={handleOtkaziTeren}
              onNastavi={handleNastavi}
              onBrojUcesnika={handleBrojUcesnika}
            />
          )}

          {showTermini && selectedObjekat && !showObjekatAndTermini && (
            <OdabirTermina
              selectedObjekat={selectedObjekat}
              termini={termini}
              loadingTermini={loadingTermini}
              error={error}
              selectedTermini={selectedTermini}
              stavkaKorpe={stavkaKorpe}
              onTerminSelection={handleTerminSelection}
              onConfirmSelection={handleConfirmSelection}
              onOtkaziTermine={handleOtkaziTermine}
              onKontaktPodaci={handleKontaktPodaci}
            />
          )}

          {activeTab === 2 && (
            <KontaktPodaci
              userInput={userInput}
              onUserInput={handleUserInput}
              onOtkaziRezervaciju={handleOtkaziRezervaciju}
              onVasaRezervacija={handleVasaRezervacija}
            />
          )}

          {activeTab === 3 && <VasaRezervacija />}
        </div>

        <div className="d-flex justify-content-center m-4">
          <button
            className="btn btn btn-secondary px-5"
            onClick={() => navigate("/")}
          >
            Nazad na početnu
          </button>
        </div>
      </div>
    </div>
  );
}

export default OdabirObjekata;
