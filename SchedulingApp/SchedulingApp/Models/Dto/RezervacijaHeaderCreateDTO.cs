using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class RezervacijaHeaderCreateDTO
    {
        [Required]
        public string ImeKorisnika { get; set; }
        [Required]
        public string BrojKorisnika { get; set; }
        [Required]
        public string EmailKorisnika { get; set; }
        public string ApplicationUserId { get; set; }
        public string Status { get; set; }
        //public DateTime DatumRezervacije { get; set; }
        public int UkupnoRezervacija { get; set; }
        public string StripePaymentIntentId { get; set; }
        public IEnumerable<RezervacijaDetalji> RezervacijaDetalji { get; set; }
    }
}
