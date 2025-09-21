import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stavkaKorpeModel, terminModel, userModel } from "../../Interfaces";
import { RootState } from "../../Storage/Redux/store";
import {
  useGetTerminByIdQuery,
} from "../../apis/terminApi";
import {
  useRemoveShoppingCartItemMutation,
  useUpdateShoppingCartMutation,
  useUpdateShoppingCartWithTerminiMutation,
} from "../../apis/shoppingCartApi";
import {
  azurirajCenu,
  azurirajKolicinu,
  azurirajStatusTermina,
  removeFromCart,
  setTerminForObjekat,
} from "../../Storage/Redux/shoppingCartSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import CartItem from "./CartItem"; 

function RezervacijaSummary() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );
  const [selectedTermini, setSelectedTermini] = useState<
    Record<number, terminModel[]>
  >({});
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedSportskiObjekatId, setSelectedSportskiObjekatId] = useState<
    number | null
  >(null);
  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );
  const [azurirajKorpu] = useUpdateShoppingCartMutation();
  const [removeShoppingCartItem] = useRemoveShoppingCartItemMutation();
  const [azurirajKorpuSaTerminima] = useUpdateShoppingCartWithTerminiMutation();

  const {
    data: termini,
    isLoading,
    isError,
    refetch,
  } = useGetTerminByIdQuery(selectedSportskiObjekatId);

  const racunajCenuZaObjekat = useCallback(
    (stavkaKorpe: stavkaKorpeModel, termini?: terminModel[]) => {
      if (!stavkaKorpe.sportskiObjekat) return 0;

      const sportskiObjekatId = stavkaKorpe.sportskiObjekat.sportskiObjekatId;
      const terminiZaObjekat = [
        ...(stavkaKorpe.odabraniTermini || []),
        ...(selectedTermini[sportskiObjekatId] || []),
      ].filter(
        (termin, index, self) =>
          index === self.findIndex((t) => t.terminId === termin.terminId)
      );

      const cenaPoSatu = stavkaKorpe.sportskiObjekat.cenaPoSatu ?? 0;
      const brojUcesnika = stavkaKorpe.kolicina ?? 1;

      if (terminiZaObjekat.length === 0) {
        if (
          stavkaKorpe.cenaZaObjekat !== undefined &&
          stavkaKorpe.cenaZaObjekat !== null
        ) {
          return stavkaKorpe.cenaZaObjekat;
        }
        return cenaPoSatu * brojUcesnika;
      }

      return terminiZaObjekat.reduce((ukupno, termin) => {
        if (!termin.vremePocetka || !termin.vremeZavrsetka) return ukupno;

        const [startHours, startMinutes] = termin.vremePocetka
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = termin.vremeZavrsetka
          .split(":")
          .map(Number);

        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0);

        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0);

        const trajanjeUSatima =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return ukupno + cenaPoSatu * trajanjeUSatima * brojUcesnika;
      }, 0);
    },
    [selectedTermini]
  );

  const handleTerminSelection = useCallback(
    (sportskiObjekatId: number, termin: terminModel) => {
      const stavka = shoppingCartStore.find(
        (s) => s.sportskiObjekat?.sportskiObjekatId === sportskiObjekatId
      );

      if (!stavka) return;

      setSelectedTermini((prev) => {
        const trenutniTermini = prev[sportskiObjekatId] || [];
        const postoji = trenutniTermini.some(
          (t) => t.terminId === termin.terminId
        );
        const noviTermini = postoji
          ? trenutniTermini.filter((t) => t.terminId !== termin.terminId)
          : [...trenutniTermini, termin];

        if (noviTermini.length === 0) {
          dispatch(
            azurirajCenu({
              sportskiObjekatId,
              cenaZaObjekat:
                (stavka.sportskiObjekat?.cenaPoSatu ?? 0) *
                (stavka.kolicina ?? 1),
            })
          );
          dispatch(
            setTerminForObjekat({
              sportskiObjekatId,
              terminId: [],
              termin: [],
            })
          );
          const noviState = { ...prev };
          delete noviState[sportskiObjekatId];
          return noviState;
        }

        const novaCena = racunajCenuZaObjekat({
          ...stavka,
          odabraniTermini: noviTermini,
        });

        dispatch(
          setTerminForObjekat({
            sportskiObjekatId,
            terminId: noviTermini.map((t) => t.terminId),
            termin: noviTermini,
          })
        );
        dispatch(
          azurirajCenu({
            sportskiObjekatId,
            cenaZaObjekat: novaCena,
          })
        );

        return { ...prev, [sportskiObjekatId]: noviTermini };
      });
    },
    [shoppingCartStore, dispatch, racunajCenuZaObjekat]
  );

  const handleBrojUcesnika = useCallback(
    (brojUcesnika: number, stavkaKorpe: stavkaKorpeModel, ukloni?: boolean) => {
      if (ukloni) {
        removeShoppingCartItem({
          sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
          userId: userData.id,
        });
        dispatch(removeFromCart({ stavkaKorpe }));
        toast.info(
          `Uklonjen sportski objekat: ${stavkaKorpe.sportskiObjekat?.naziv}`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }

      const trenutnaKolicina = stavkaKorpe.kolicina || 0;
      const novaKolicina = trenutnaKolicina + brojUcesnika;

      if (novaKolicina > stavkaKorpe.sportskiObjekat?.kapacitet!) {
        toast.error(
          `Prekoračen kapacitet! Maksimalno: ${stavkaKorpe.sportskiObjekat?.kapacitet} učesnika`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }

      if (novaKolicina < 1) {
        toast.error("Minimalni broj učesnika! je 1!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      azurirajKorpu({
        sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
        brojUcesnika: brojUcesnika,
        userId: userData.id,
      });
      dispatch(
        azurirajKolicinu({
          stavkaKorpe: { ...stavkaKorpe },
          kolicina: novaKolicina,
        })
      );
    },
    [dispatch, removeShoppingCartItem, azurirajKorpu, userData.id]
  );

  const handleExpandCard = useCallback((sportskiObjekatId: number) => {
    setExpandedCard((prev) =>
      prev === sportskiObjekatId ? null : sportskiObjekatId
    );
    setSelectedSportskiObjekatId(sportskiObjekatId);
  }, []);

  const handleConfirmSelection = useCallback(
    (sportskiObjekatId: number, stavkaKorpe: stavkaKorpeModel) => {
      if (
        !selectedTermini[sportskiObjekatId] ||
        selectedTermini[sportskiObjekatId].length === 0
      ) {
        toast.error("Morate odabrati bar jedan termin!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      const terminiIds = selectedTermini[sportskiObjekatId].map((t) =>
        Number(t.terminId)
      );

      azurirajKorpuSaTerminima({
        sportskiObjekatId,
        userId: userData.id,
        kolicina: stavkaKorpe.kolicina,
        terminIds: terminiIds,
      })
        .then((response) => {
          if ("data" in response) {
            const azuriraniTermini = selectedTermini[sportskiObjekatId].map(
              (t) => ({
                ...t,
                status: "Zauzet",
              })
            );

            dispatch(
              setTerminForObjekat({
                sportskiObjekatId,
                terminId: terminiIds,
                termin: azuriraniTermini,
              })
            );

            const novaCena = racunajCenuZaObjekat(
              stavkaKorpe,
              selectedTermini[sportskiObjekatId]
            );
            dispatch(
              azurirajCenu({ sportskiObjekatId, cenaZaObjekat: novaCena })
            );

            dispatch(azurirajStatusTermina({ sportskiObjekatId }));

            refetch();

            toast.success("Termini uspešno ažurirani!", {
              position: "top-center",
              autoClose: 3000,
            });
          } else {
            toast.error("Došlo je do greške pri ažuriranju termina!", {
              position: "top-center",
              autoClose: 3000,
            });
          }
        })
        .catch((error) => {
          console.error("Greška prilikom ažuriranja termina:", error);
          toast.error("Došlo je do greške prilikom ažuriranja!", {
            position: "top-center",
            autoClose: 3000,
          });
        });
    },
    [
      selectedTermini,
      azurirajKorpuSaTerminima,
      userData.id,
      dispatch,
      refetch,
      racunajCenuZaObjekat,
    ]
  );

  useEffect(() => {
    if (selectedSportskiObjekatId !== null) {
      const stavkaKorpe = shoppingCartStore.find(
        (s) =>
          s.sportskiObjekat?.sportskiObjekatId === selectedSportskiObjekatId
      );

      if (stavkaKorpe) {
        const sviTermini = [
          ...(stavkaKorpe.odabraniTermini || []),
          ...(selectedTermini[selectedSportskiObjekatId] || []),
        ];

        const jedinstveniTermini = sviTermini.filter(
          (termin, index, self) =>
            index === self.findIndex((t) => t.terminId === termin.terminId)
        );

        const novaCena = racunajCenuZaObjekat({
          ...stavkaKorpe,
          odabraniTermini: jedinstveniTermini,
        });

        if (novaCena !== stavkaKorpe.cenaZaObjekat) {
          dispatch(
            azurirajCenu({
              sportskiObjekatId: selectedSportskiObjekatId,
              cenaZaObjekat: novaCena,
            })
          );
        }
      }
    }
  }, [selectedTermini, selectedSportskiObjekatId, shoppingCartStore, dispatch, racunajCenuZaObjekat]);

  useEffect(() => {
    if (
      selectedSportskiObjekatId !== null &&
      selectedTermini[selectedSportskiObjekatId]
    ) {
      dispatch(
        setTerminForObjekat({
          sportskiObjekatId: selectedSportskiObjekatId,
          terminId: selectedTermini[selectedSportskiObjekatId].map(
            (t) => t.terminId
          ),
          termin: selectedTermini[selectedSportskiObjekatId],
        })
      );
    }
  }, [selectedTermini, selectedSportskiObjekatId, dispatch]);

  const isAdmin = userData.role === "admin";

  if (!shoppingCartStore) {
    return <div>Prazna Korpa!</div>;
  }

  return (
    <div className="container p-4 m-2">
      <h4 className="text-center" style={{ color: "#51285f" }}>
        {t("rezervacijaSummary.title")}
      </h4>
      {shoppingCartStore.length === 0 ? (
        <div className="text-center mt-4">
          <h5 className="text-muted">
            {t("rezervacijaSummary.noReservations")}
          </h5>
        </div>
      ) : (
        shoppingCartStore.map((stavkaKorpe, index) => (
          <CartItem
            key={index}
            stavkaKorpe={stavkaKorpe}
            index={index}
            expandedCard={expandedCard}
            selectedTermini={selectedTermini}
            termini={termini}
            isLoading={isLoading}
            isError={isError}
            isAdmin={isAdmin}
            onParticipantChange={handleBrojUcesnika}
            onRemove={(stavka) => handleBrojUcesnika(0, stavka, true)}
            onExpand={handleExpandCard}
            onTerminSelect={handleTerminSelection}
            onConfirm={handleConfirmSelection}
            racunajCenuZaObjekat={racunajCenuZaObjekat}
          />
        ))
      )}
    </div>
  );
}

export default RezervacijaSummary;