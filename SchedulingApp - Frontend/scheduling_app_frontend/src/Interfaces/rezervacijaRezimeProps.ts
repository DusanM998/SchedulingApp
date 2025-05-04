import { SD_Status } from "../Utility/SD";
import stavkaKorpeModel from "./stavkaKorpeModel";

export interface rezervacijaRezimeProps {
    data: {
        rezervacijaHeaderId?: number;
        stavkaKorpe?: stavkaKorpeModel[];
        ukupnoCena?: number;
        userId?: string;
        stripePaymentIntentId?: string;
        status?: SD_Status;
    };
    userInput: {
        name?: string;
        email?: string;
        phoneNumber?: string;
    }
}