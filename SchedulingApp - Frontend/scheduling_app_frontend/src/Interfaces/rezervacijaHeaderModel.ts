import { SD_Status } from "../Utility/SD";
import rezervacijaDetaljiModel from "./rezervacijaDetaljiModel";

export default interface rezervacijaHeaderModel {
    rezervacijaHeaderId?: number;
    imeKorisnika?: string;
    brojKorisnika?: string;
    emailKorisnika?: string;
    ukupnoCena?: number,
    applicationUserId?: string;
    user?: any;
    status?: SD_Status;
    datumRezervacije?: Date;
    ukupnoRezervacija?: number;
    stripePaymentIntentId?: string;
    rezervacijaDetalji: rezervacijaDetaljiModel[];
}