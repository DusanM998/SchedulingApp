namespace SchedulingApp.Models.Dto
{
    public class RezervacijaHeaderUpdateDTO
    {
        public int RezervacijaHeaderId { get; set; }
        public string ImeKorisnika { get; set; }
        public string EmailKorisnika { get; set; }
        public string BrojKorisnika { get; set; }

        public string StripeIntentPaymentId { get; set; }
        public string Status { get; set; }

    }
}
