import React, { useEffect, useState } from 'react'
import { SD_VrstaSporta } from '../../Utility/SD'
import { useCreateSportskiObjekatMutation, useGetSportskiObjekatByIdQuery, useUpdateSportskiObjekatMutation } from '../../apis/sportskiObjekatApi';
import { useNavigate, useParams } from 'react-router-dom';
import { inputHelper, toastNotify } from '../../Helper';
import { MainLoader } from '../../Components/Page/Common';

// Predefinisane opcije za vrstu sporta
const VrstaSporta = [
    SD_VrstaSporta.Ostalo,
    SD_VrstaSporta.Fudbal,
    SD_VrstaSporta.Kosarka,
    SD_VrstaSporta.Tenis,
    SD_VrstaSporta.Plivanje,
    SD_VrstaSporta.Padel,
    SD_VrstaSporta.Odbojka,
    SD_VrstaSporta.Rukomet,
    SD_VrstaSporta.Vaterpolo,
    SD_VrstaSporta.Bilijar,
];

// Pocetne vr. forme za unos podataka o sportskom objektu
const sportskiObjekatData = {
  naziv: "",
  lokacija: "",
  vrstaSporta: VrstaSporta[0],
  opis: "",
  radnoVreme: "",
  cenaPoSatu: "",
  kapacitet: ""
};

function SportskiObjekatKreirajAzuriraj() {

    const [sportskiObjekatInputs, setSportskiObjekatInputs] = useState(sportskiObjekatData);
    const [loading, setLoading] = useState(false);
    const [createSportskiObjekat] = useCreateSportskiObjekatMutation();
    const [updateSportskiObjekat] = useUpdateSportskiObjekatMutation();
    const { sportskiObjekatId } = useParams();
    const navigate = useNavigate();
    const { data } = useGetSportskiObjekatByIdQuery(sportskiObjekatId); // Ucivam podatke o sportskom objektu za update
    const [imageToBeStore, setImageToBeStore] = useState<any>(); // Cuva File objekat koji ce biti poslat na backend
    const [imageToBeDisplay, setImageToBeDisplay] = useState<any>(); //Cuva URL slike koji ce biti prikazan na frontendu

    //console.log(data);
  
    // Automatski popunjavam formu za update
    // Kada ucitam podatke o sportkom objektu, useEffect ce se okinuti i popunjava formu
    useEffect(() => {
      if (data && data.result) {
        const tempData = {
          naziv: data.result.naziv,
          lokacija: data.result.lokacija,
          vrstaSporta: data.result.vrstaSporta,
          opis: data.result.opis,
          radnoVreme: data.result.radnoVreme,
          cenaPoSatu: data.result.cenaPoSatu,
          kapacitet: data.result.kapacitet,
        };
        setSportskiObjekatInputs(tempData);
        setImageToBeDisplay(data.result.image);
      }
    }, [data]);
  
    const handleSportskiObjekatInput = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const tempData = inputHelper(e, sportskiObjekatInputs);
      console.log("Odabrana vrsta sporta: ", tempData.vrstaSporta);
      setSportskiObjekatInputs(tempData);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
          //console.log(file);
          const imgType = file.type.split("/")[1];
          const validImgTypes = ["jpeg", "jpg", "png", "webp"];

          const isImgTypeValid = validImgTypes.filter((e) => {
              return e === imgType;
          });

          // Ogranicenje velicine fajla na 5MB
          if (file.size > 5000 * 1024) {
              setImageToBeStore("");
              toastNotify("Veličina fajla mora biti manja od 5MB!", "error");
              return;
          }
          else if (isImgTypeValid.length === 0) {
              setImageToBeStore("");
              toastNotify("Fajl mora biti u jpeg, jpg ili png formatu!", "error");
              return;
          }

          // FileReader API - cita fajl i pretvara u URL koji moze da se prikaze na frontendu
          const reader = new FileReader();
          reader.readAsDataURL(file);
          setImageToBeStore(file);
          reader.onload = (e) => {
              const imgUrl = e.target?.result as string;
              setImageToBeDisplay(imgUrl);
          }
      }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setLoading(true);

      // Validacija - slika je obavezna prilikom kreiranja novog sportskog objekta
      if (!imageToBeStore && !sportskiObjekatId) {
        toastNotify("Molimo Vas dodajte sliku!", "error");
        setLoading(false);
        return;
      }

      // FormData objekat - koristim ga da saljem podatke na backend
      const formData = new FormData();

      formData.append("Naziv", sportskiObjekatInputs.naziv ?? "");
      formData.append("Lokacija", sportskiObjekatInputs.lokacija ?? "");
      formData.append("VrstaSporta", sportskiObjekatInputs.vrstaSporta ?? "");
      formData.append("Opis", sportskiObjekatInputs.opis ?? "");
      formData.append("RadnoVreme", sportskiObjekatInputs.radnoVreme ?? "");
      formData.append("CenaPoSatu", sportskiObjekatInputs.cenaPoSatu ?? "");
      formData.append("Kapacitet", sportskiObjekatInputs.kapacitet ?? "");
      if (imageToBeDisplay) formData.append("File", imageToBeStore); // File se dodaje samo ako postoji nova slika

      console.log("Logujem podatke iz forme:", Object.fromEntries(formData.entries()));

      try {
        let response;

        if (sportskiObjekatId) {
          //logika za update
          formData.append("SportskiObjekatId", sportskiObjekatId);
          response = await updateSportskiObjekat({ data: formData, sportskiObjekatId });
          console.log("Logujem response:", response)

          if (response.error) {
            toastNotify("Došlo je do greške pri ažuriranju!", "error")
          }
          else {
            toastNotify("Sportski Objekat je uspešno ažuriran!", "success");
          }
        }
        else {
          //logika za kreiranje
          response = await createSportskiObjekat(formData);
        

          if (response.error) {
            toastNotify("Došlo je do greške pri kreiranju!", "error");
          }
          else {
            toastNotify("Sportski Objekat je uspešno kreiran!", "success");
          }
        }

        if (response) {
          setLoading(true);
          navigate("/sportskiObjekat/sportskiObjektiTabela");
        }
      }
      catch (error) {
        toastNotify("Greška prilikom slanja podataka!", "error");
        console.log("Greska", error);
      }
      finally {
        setLoading(false);
      }
    }

  return (
    <div className='container rounded mt-5 p-5 bg-light'>
      {loading && <MainLoader />}
      <h3 className='px-2' style={{ color: "#51285f" }}>{sportskiObjekatId ? "Ažuriraj" : "Kreiraj Sportski Objekat"}</h3>
      <form method='post' encType='multipart/form-data' onSubmit={handleSubmit}>
        <div className='row mt-3'>
          <div className='col-md-7'>
            <input
              type='text'
              className='form-control'
              placeholder='Unesite Naziv'
              required
              name='naziv'
              value={sportskiObjekatInputs.naziv}
              onChange={handleSportskiObjekatInput}
            />
            <input
              type='text'
              className='form-control mt-3'
              placeholder='Unesite Lokaciju'
              required
              name='lokacija'
              value={sportskiObjekatInputs.lokacija}
              onChange={handleSportskiObjekatInput}
            />
            <label className='form-label mt-3'>Odaberite Vrstu Sporta: </label>
            <select
              className='form-control form-select'
              required
              name='vrstaSporta'
              value={sportskiObjekatInputs.vrstaSporta ?? VrstaSporta[0]}
              onChange={handleSportskiObjekatInput}
            >
              {VrstaSporta.map((vrstaSporta, index) => (
                <option key={index} value={vrstaSporta}>{vrstaSporta}</option>
              ))}
            </select>
            <textarea
              className='form-control mt-3'
              placeholder='Unesite Opis'
              required
              name='opis'
              value={sportskiObjekatInputs.opis}
              onChange={handleSportskiObjekatInput}
            />
            <input
              type='text'
              className='form-control mt-3'
              placeholder='Unesite Radno Vreme'
              required
              name='radnoVreme'
              value={sportskiObjekatInputs.radnoVreme}
              onChange={handleSportskiObjekatInput}
            />
            <input
              type='number'
              className='form-control mt-3'
              placeholder='Unesite Cenu po Satu'
              required
              name='cenaPoSatu'
              value={sportskiObjekatInputs.cenaPoSatu}
              onChange={handleSportskiObjekatInput}
            />
            <input
              type='number'
              className='form-control mt-3'
              placeholder='Unesite Kapacitet'
              required
              name='kapacitet'
              value={sportskiObjekatInputs.kapacitet}
              onChange={handleSportskiObjekatInput}
            />
            <label className='form-label mt-3'>Odaberite Sliku: </label>
            <input
              type='file'
              className='form-control'
              onChange={handleFileChange}
            />
            <div className='row'>
              <div className='col-6'>
                <button
                  className='btn mt-5 form-control'
                  type='submit'
                  style={{backgroundColor: "#51285f", color: "white"}}
                >
                  {sportskiObjekatId ? "Ažuriraj" : "Kreiraj"}
                </button>
              </div>
              <div className='col-6'>
                <button
                  type='button'
                  className='btn btn-secondary mt-5 form-control'
                  onClick={() => navigate("/sportskiObjekat/sportskiObjektiTabela")}
                >
                  Nazad
                </button>
              </div>
            </div>
          </div>
          <div className='col-md-5 text-center'>
            <img
              src={imageToBeDisplay}
              style={{ width: "100%", borderRadius: "30px" }}
              alt=''
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default SportskiObjekatKreirajAzuriraj
