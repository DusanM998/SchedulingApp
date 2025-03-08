using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp1.Models
{
    public class StavkaKorpe
    {
        public int Id { get; set; }
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }
        public int Kolicina { get; set; }
        public int KorpaId { get; set; }
    }
}
