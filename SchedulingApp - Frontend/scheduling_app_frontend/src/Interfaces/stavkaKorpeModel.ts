import sportskiObjekatModel from "./sportskiObjekatModel";
import terminModel from "./terminModel";

export default interface stavkaKorpeModel {
    id?: number;
    sportskiObjekatId?: number;
    sportskiObjekat?: sportskiObjekatModel;
    kolicina?: number;
    cenaZaObjekat?: number;
    odabraniTermini?: terminModel[];
}