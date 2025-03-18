import sportskiObjekatModel from "./sportskiObjekatModel";
import terminModel from "./terminModel";

export default interface stavkaKorpeModel {
    id?: number;
    sportskiObjekatId?: number;
    sportskiObjekat?: sportskiObjekatModel;
    terminId?: number;
    termin?: terminModel;
    kolicina?: number;
}