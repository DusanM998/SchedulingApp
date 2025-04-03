using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp.Models
{
    public class Korpa
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public ICollection<StavkaKorpe> StavkaKorpe { get; set; }
        [NotMapped]
        public double UkupnoZaPlacanje { get; set; }
        [NotMapped]
        public string StripePaymentIntentId { get; set; }
        [NotMapped]
        public string ClientSecret { get; set; }
    }
}
