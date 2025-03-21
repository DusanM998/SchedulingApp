import { stavkaKorpeModel } from "../../Interfaces";
import { SD_Status } from "../../Utility/SD";

export interface rezervacijaSummaryProps {
    data: {
        id?: number;
        stavkaKorpe?: stavkaKorpeModel[];
        kolicina?: number;
        userId?: string;
        stripePaymentIntentId?: string;
        status?: SD_Status;
    };
    userInput: {
        name?: string;
        email?: string;
        phoneNumber?: string;
    };
}