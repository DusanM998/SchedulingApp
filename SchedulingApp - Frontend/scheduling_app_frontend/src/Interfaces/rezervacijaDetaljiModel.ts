import sportskiObjekatModel from "./sportskiObjekatModel";
import terminModel from "./terminModel";

export default interface rezervacijaDetaljiModel {
    rezervacijaDetaljiId?: number;
    rezervacijaHeaderId?: number;
    sportskiObjekatId?: number;
    sportskiObjekat: sportskiObjekatModel;
    terminId?: number;
    odabraniTermini?: terminModel[];
    cena?: number;
    brojUcesnika?: number;
}