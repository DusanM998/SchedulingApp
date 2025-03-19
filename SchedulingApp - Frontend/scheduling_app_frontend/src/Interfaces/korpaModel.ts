import stavkaKorpeModel from "./stavkaKorpeModel";

export default interface korpaModel {
    id?: number;
    userId?: string;
    stavkaKorpe?: stavkaKorpeModel[];
    ukuonoStavki?: number;
    stripePaymentIntentId?: any;
    clientSecret?: any;
}