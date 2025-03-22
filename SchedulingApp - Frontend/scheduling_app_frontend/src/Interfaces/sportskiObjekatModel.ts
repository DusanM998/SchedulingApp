import terminModel from "./terminModel"

export default interface sportskiObjekatModel {
    sportskiObjekatId: number
    naziv: string
    lokacija: string
    vrstaSporta: string
    opis: string
    radnoVreme: string
    cenaPoSatu: number
    kapacitet: number
    image: string
    selectedTerminId?: number;
    selectedTermin?: terminModel;
}