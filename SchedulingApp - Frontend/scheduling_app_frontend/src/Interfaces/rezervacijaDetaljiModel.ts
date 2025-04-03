import sportskiObjekatModel from "./sportskiObjekatModel";
import terminModel from "./terminModel";

export default interface rezervacijaDetaljiModel {
    rezervacijaDetaljiId?: number;
    rezervacijaHeaderId?: number;
    sportskiObjekatId?: number;
    sportskiObjekat: sportskiObjekatModel;
    terminId?: number;
    termin: terminModel;
    cena?: number;
    brojUcesnika?: number;
}