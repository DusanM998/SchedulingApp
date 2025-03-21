import React, { useEffect, useState } from 'react'
import { SD_Status_Termina } from '../../Utility/SD'
import { useGetSportskiObjekatByIdQuery, useGetSportskiObjektiQuery } from '../../apis/sportskiObjekatApi';
import { useNavigate, useParams } from 'react-router-dom';
import { inputHelper, toastNotify } from '../../Helper';
import { MainLoader } from '../../Components/Page/Common';
import { useCreateTerminMutation, useGetTerminByIdQuery, useUpdateTerminMutation } from '../../apis/terminApi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import sportskiObjekatModel from '../../Interfaces/sportskiObjekatModel';
import { toast } from 'react-toastify';

const Status = [
    SD_Status_Termina.Slobodan,
    SD_Status_Termina.Zauzet
];

const terminData = {
    datumTermina: null as Date | null,
    sportskiObjekatId: 0,
    vremePocetka: "",
    vremeZavrsetka: "",
    status: Status[0]
};

function TerminKreirajAzuriraj() {

    const [terminInputs, setTerminInputs] = useState(terminData);
    const [loading, setLoading] = useState(false);
    const [isSelectedObjekat, setIsSelectedObjekat] = useState<sportskiObjekatModel | null>(null);
    const [createTermin] = useCreateTerminMutation();
    const [updateTermin] = useUpdateTerminMutation();
    const { terminId } = useParams();
    const navigate = useNavigate();
    const { data } = useGetTerminByIdQuery(terminId);
    const { data: dataSportskiObjekti, isLoading } = useGetSportskiObjektiQuery(null);

    //console.log(data);
    console.log(dataSportskiObjekti);
  
    useEffect(() => {
      if (data && data.result) {
        setTerminInputs({
          datumTermina: data.result.datumTermina ? new Date(data.result.datumTermina) : null,
          sportskiObjekatId: Number(data.result.sportskiObjekatId),
          vremePocetka: data.result.vremePocetka,
          vremeZavrsetka: data.result.vremeZavrsetka,
          status: data.result.status,
        });
        //setTerminInputs(tempData);
      }
    }, [data]);
  
    useEffect(() => {
      if (dataSportskiObjekti) {
        const objekat = dataSportskiObjekti?.find((obj: sportskiObjekatModel) => obj.sportskiObjekatId === terminInputs.sportskiObjekatId);
        setIsSelectedObjekat(objekat || null);
      }
    }, [terminInputs.sportskiObjekatId, dataSportskiObjekti]);
  
    const handleTerminInput = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const tempData = inputHelper(e, terminInputs);
      setTerminInputs(tempData);
    };
    
    const handleSportskiObjekatChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
      setTerminInputs({ ...terminInputs, sportskiObjekatId: Number(e.target.value) });
    }
    
    const isTerminValid = () : boolean => {
      const objekat = dataSportskiObjekti?.find(
        (obj: sportskiObjekatModel) =>
          obj.sportskiObjekatId === terminInputs.sportskiObjekatId
      );

      if (!objekat) {
        toastNotify("Niste odabrali sportski objekat!", "error");
        return false;
      }
      if (!objekat.radnoVreme) {
        toastNotify("Radno vreme objekta nije definisano!", "error");
        return false;
      }

      //parsiranje stringa radnog vremena za format npr. 08:00 - 15:00 i 08:00-15:00
      const radnoVremeParts = objekat.radnoVreme.replace(/\s+/g, "").split("-"); // Uklanja razmake pre splitovanja

      const [pocetakRadnogVremena, krajRadnogVremena] = radnoVremeParts;

      if (!terminInputs.vremePocetka || !terminInputs.vremeZavrsetka) {
        toastNotify("Molimo Vas unesite vreme početka i završetka termina!", "error");
        return false;
      }

      //F-ja za konverziju vremena iz "HH:MM" u broj tj. 08:30 -> 830
      const formatirajVreme = (vreme: string) => parseInt(vreme.replace(":", ""), 10);

      const pocetakTermina = formatirajVreme(terminInputs.vremePocetka);
      const krajTermina = formatirajVreme(terminInputs.vremeZavrsetka);
      const radnoVremePocetak = formatirajVreme(pocetakRadnogVremena);
      const radnoVremeKraj = formatirajVreme(krajRadnogVremena);

      if (pocetakTermina < radnoVremePocetak || krajTermina > radnoVremeKraj) {
        toast.info(`Objekat nije dostupan u odabranom vremenu! Radno vreme objekta je ${pocetakRadnogVremena} - ${krajRadnogVremena}.`, {
          position: "top-center",
          type: "error"
        }
        );
        return false;
      }

      if (pocetakTermina >= krajTermina) {
        toastNotify("Vreme početka mora biti pre vremena završetka!", "error");
        return false;
      }

      return true;
    }
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isTerminValid()) {
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("DatumTermina", terminInputs.datumTermina 
        ? terminInputs.datumTermina.toISOString().split('T')[0] : ""
      );
      formData.append("VremePocetka", terminInputs.vremePocetka ?? "");
      formData.append("VremeZavrsetka", terminInputs.vremeZavrsetka ?? "");
      formData.append("Status", terminInputs.status ?? "");
      formData.append("SportskiObjekatId",terminInputs.sportskiObjekatId ? terminInputs.sportskiObjekatId.toString() : "0");

      console.log("Logujem podatke iz forme:", Object.fromEntries(formData.entries()));

      try {
        let response;

        if (terminId) {
          //logika za update
          formData.append("terminId", terminId);
          response = await updateTermin({ data: formData, terminId });
          console.log("Logujem response:", response)

          if (response.error) {
            toastNotify("Došlo je do greške pri ažuriranju!", "error")
          }
          else {
            toastNotify("Termin je uspešno ažuriran!", "success");
          }
        }
        else {
          //logika za kreiranje
          response = await createTermin(formData);
        

          if (response.error) {
            toastNotify("Došlo je do greške pri kreiranju!", "error");
            console.log("Logujem gresku: ", response.error);
          }
          else {
            toastNotify("Termin je uspešno kreiran!", "success");
          }
        }

        if (response) {
          setLoading(true);
          navigate("/termin/terminList");
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
      <h3 className='px-2' style={{ color: "#51285f" }}>{terminId ? "Ažuriraj" : "Kreiraj termin"}</h3>
      <form method='post' encType='multipart/form-data' onSubmit={handleSubmit}>
        <div className='row mt-3'>
          <div className='col'>
            <label className="form-label">Odaberite datum termina: </label>&nbsp;
            <DatePicker
              showIcon
              toggleCalendarOnIconClick
              selected={terminInputs.datumTermina ? new Date(terminInputs.datumTermina) : null}
              onChange={(date: Date | null) => setTerminInputs({
                ...terminInputs, 
                datumTermina: date})}
              className='form-control'
              dateFormat="yyyy-MM-dd"
            />
            <input
              type='text'
              className='form-control mt-3'
              placeholder='Unesite Vreme Početka'
              required
              name='vremePocetka'
              value={terminInputs.vremePocetka}
              onChange={handleTerminInput}
            />
            <input
              type='text'
              className='form-control mt-3'
              placeholder='Unesite Vreme Završetka'
              required
              name='vremeZavrsetka'
              value={terminInputs.vremeZavrsetka}
              onChange={handleTerminInput}
            />
            <select
              className='form-control mt-3 form-select'
              required
              name='status'
              value={terminInputs.status ?? Status[0]}
              onChange={handleTerminInput}
            >
              {Status.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
            <select
              className='form-control mt-3 form-select'
              required
              name='sportskiObjekatId'
              value={terminInputs.sportskiObjekatId ?? ""}
              onChange={handleSportskiObjekatChange}
            >
              <option value="">Izaberite sportski objekat</option>
              {dataSportskiObjekti?.map((objekat: {sportskiObjekatId: number; naziv: string}) => (
                <option key={objekat.sportskiObjekatId} value={objekat.sportskiObjekatId}>{objekat.naziv}</option>
              ))
                
              }
            </select>
            {isSelectedObjekat && (
              <div className='mt-3 p-3 border rounded bg-white'>
                <h5>{isSelectedObjekat.naziv}</h5>
                <p><strong>Radno vreme:</strong> {isSelectedObjekat.radnoVreme}</p>
              </div>
            )}
            <div className='row'>
              <div className='col-6'>
                <button
                  className='btn mt-5 form-control'
                  type='submit'
                  style={{backgroundColor: "#51285f", color: "white"}}
                >
                  {terminId ? "Ažuriraj" : "Kreiraj"}
                </button>
              </div>
              <div className='col-6'>
                <button
                  type='button'
                  className='btn btn-secondary mt-5 form-control'
                  onClick={() => navigate("/termin/terminList")}
                >
                  Nazad
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TerminKreirajAzuriraj
