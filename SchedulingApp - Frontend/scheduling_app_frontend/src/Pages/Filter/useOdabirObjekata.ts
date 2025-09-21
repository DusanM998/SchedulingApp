import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RootState } from "../../Storage/Redux/store";
import { inputHelper, toastNotify } from "../../Helper";
import {
  useUpdateShoppingCartMutation,
  useUpdateShoppingCartWithTerminiMutation,
} from "../../apis/shoppingCartApi";
import {
  azurirajCenu,
  azurirajKolicinu,
  azurirajStatusTermina,
  setTerminForObjekat,
} from "../../Storage/Redux/shoppingCartSlice";
import { apiResponse, stavkaKorpeModel, terminModel } from "../../Interfaces";
import { useTranslation } from "react-i18next";

export const useOdabirObjekata = () => {
  // State
  const [selectedObjekatId, setSelectedObjekatId] = useState<number | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showTermini, setShowTermini] = useState(false);
  const [showObjekatAndTermini, setShowObjekatAndTermini] = useState(false);
  const [selectedTerminId, setSelectedTerminId] = useState<number | null>(null);
  const [selectedTermini, setSelectedTermini] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [addedToCartIds, setAddedToCartIds] = useState<number[]>([]);
  const [selectedTerminii, setSelectedTerminii] = useState<
    Record<number, terminModel[]>
  >({});

  // Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );

  // Mutations
  const [updateKorpa] = useUpdateShoppingCartMutation();
  const [azurirajKorpuSaTerminima] = useUpdateShoppingCartWithTerminiMutation();

  const { t } = useTranslation();

  // User Input
  const initialUserData = {
    name: userData.name ?? "",
    email: userData.email ?? "",
    phoneNumber: userData.phoneNumber ?? "",
  };
  const [userInput, setUserInput] = useState(initialUserData);

  // Effects
  useEffect(() => {
    const initialIds = shoppingCartStore.map(
      (item) => item.sportskiObjekat?.sportskiObjekatId
    );
    setAddedToCartIds(
      initialIds.filter((id): id is number => id !== undefined)
    );
  }, [shoppingCartStore]);

  useEffect(() => {
    setTimeout(() => setMenuVisible(true), 100);
  }, []);

  useEffect(() => {
    setUserInput({
      name: userData.name ?? "",
      email: userData.email ?? "",
      phoneNumber: userData.phoneNumber ?? "",
    });
  }, [userData]);

  // Handlers
  const handleUserInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    if (typeof e === "string") {
      setUserInput((prev) => ({
        ...prev,
        phoneNumber: e,
      }));
    } else {
      const tempData = inputHelper(e, userInput);
      setUserInput(tempData);
    }
  };

  const handleAddToCart = async (selectedObjekatId: number) => {
    if (!userData.id) {
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);

    const response: apiResponse = await updateKorpa({
      sportskiObjekatId: selectedObjekatId,
      brojUcesnika: 1,
      userId: userData.id,
    });

    console.log("Logujem korpu: ", response.data);
    setAddedToCartIds((prev) => [...prev, selectedObjekatId]);

    if (response.data && response.data.isSuccess) {
      // Note: selectedObjekat needs to be passed from component
      toastNotify(t("toastNotify.sportsObjectSelected"), "info");
    }

    setIsAddingToCart(false);
  };

  const handleSelect = (id: number) => {
    setSelectedObjekatId(id);
    setShowDetails(true);
    setShowTermini(false);
    setSelectedTermini([]);
    setActiveTab(0);
  };

  const handleNastavi = (sportskiObjekatId: number) => {
    if (addedToCartIds.includes(sportskiObjekatId)) {
      setShowTermini(true);
      setSelectedObjekatId(sportskiObjekatId);
      setActiveTab(1);
    } else {
      toast.info("Morate dodati objekat u korpu pre nego što nastavite!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleOtkaziTeren = () => {
    setShowDetails(false);
    setSelectedObjekatId(null);
  };

  const handleOtkaziTermine = () => {
    setShowTermini(false);
    setSelectedTermini([]);
    setActiveTab(0);
  };

  const toggleTerminSelection = (terminId: number) => {
    setSelectedTermini((prev) => {
      if (prev.includes(terminId)) {
        return prev.filter((id) => id !== terminId);
      } else {
        return [...prev, terminId];
      }
    });
  };

  const handleKontaktPodaci = () => {
    setActiveTab(2);
    setShowObjekatAndTermini(true);
  };

  const handleVasaRezervacija = () => {
    setActiveTab(3);
  };

  const handleOtkaziRezervaciju = () => {
    setShowObjekatAndTermini(false);
    setActiveTab(1);
  };

  const handleBrojUcesnika = (
    brojUcesnika: number,
    stavkaKorpe: stavkaKorpeModel
  ) => {
    const trenutnaKolicina = stavkaKorpe.kolicina || 0;
    const novaKolicina = trenutnaKolicina + brojUcesnika;

    if (novaKolicina > stavkaKorpe.sportskiObjekat?.kapacitet!) {
      toastNotify(
        `Prekoračen kapacitet! Maksimalno: ${stavkaKorpe.sportskiObjekat?.kapacitet} učesnika`
      );
      return;
    }

    if (novaKolicina < 1) {
      toastNotify("Minimalni broj učesnika! je 1!");
      return;
    }

    updateKorpa({
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
  };

  const racunajCenuZaObjekat = (
    stavkaKorpe: stavkaKorpeModel,
    termini?: terminModel[]
  ) => {
    if (!stavkaKorpe.sportskiObjekat) return 0;

    const sportskiObjekatId = stavkaKorpe.sportskiObjekat.sportskiObjekatId;
    const terminiZaObjekat = [
      ...(stavkaKorpe.odabraniTermini || []),
      ...(selectedTerminii[sportskiObjekatId] || []),
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
  };

  const handleTerminSelection = (
    sportskiObjekatId: number,
    termin: terminModel
  ) => {
    setSelectedTerminii((prev) => {
      const trenutniTermini = prev[sportskiObjekatId] || [];
      const postoji = trenutniTermini.some(
        (t) => t.terminId === termin.terminId
      );
      const noviTermini = postoji
        ? trenutniTermini.filter((t) => t.terminId !== termin.terminId)
        : [...trenutniTermini, termin];

      const stavka = shoppingCartStore.find(
        (s) => s.sportskiObjekat?.sportskiObjekatId === sportskiObjekatId
      );
      if (stavka) {
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
        console.log(
          `Odabran termin ${termin.terminId} za objekat ${sportskiObjekatId}`
        );
        dispatch(azurirajCenu({ sportskiObjekatId, cenaZaObjekat: novaCena }));
      }

      return { ...prev, [sportskiObjekatId]: noviTermini };
    });

    toggleTerminSelection(termin.terminId);
  };

  const handleConfirmSelection = (
    sportskiObjekatId: number,
    stavkaKorpe: stavkaKorpeModel
  ) => {
    if (
      !selectedTerminii[sportskiObjekatId] ||
      selectedTerminii[sportskiObjekatId].length === 0
    ) {
      toast.error("Morate odabrati bar jedan termin!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const terminiIds = selectedTerminii[sportskiObjekatId].map((t) =>
      Number(t.terminId)
    );

    const izracunataCena = racunajCenuZaObjekat(
      stavkaKorpe,
      selectedTerminii[sportskiObjekatId]
    );

    azurirajKorpuSaTerminima({
      sportskiObjekatId,
      userId: userData.id,
      kolicina: stavkaKorpe.kolicina,
      terminIds: terminiIds,
    })
      .then((response) => {
        console.log("Odgovor servera:", response);
        if ("data" in response) {
          const azuriraniTermini = selectedTerminii[sportskiObjekatId].map(
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
            selectedTerminii[sportskiObjekatId]
          );
          dispatch(
            azurirajCenu({ sportskiObjekatId, cenaZaObjekat: novaCena })
          );

          dispatch(azurirajStatusTermina({ sportskiObjekatId }));

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
  };

  return {
    // State
    selectedObjekatId,
    showDetails,
    menuVisible,
    showTermini,
    showObjekatAndTermini,
    selectedTerminId,
    selectedTermini,
    activeTab,
    setActiveTab,
    isAddingToCart,
    addedToCartIds,
    selectedTerminii,
    userInput,
    shoppingCartStore,
    userData,

    // Handlers
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
    racunajCenuZaObjekat,

    // Utils
    navigate,
  };
};
