import stavkaKorpeModel from "./stavkaKorpeModel";

export default interface korpaModel {
    id?: number;
    userId?: string;
    stavkeKorpe?: stavkaKorpeModel[];
    ukuonoStavki?: number;
    stripePaymentIntentId?: any;
    clientSecret?: any;
}