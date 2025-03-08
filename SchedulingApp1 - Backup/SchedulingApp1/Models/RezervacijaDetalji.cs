using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingApp1.Models
{
    public class RezervacijaDetalji
    {
        [Key]
        public int RezervacijaDetaljiId { get; set; }
        [Required]
        public int RezervacijaHeaderId { get; set; }
        [ForeignKey("RezervacijaHeaderId")]
        public RezervacijaHeader RezervacijaHeader { get; set; }
        [Required]
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }
        [Required]
        public int TerminId { get; set; }
        [ForeignKey("TerminId")]
        public Termin Termin { get; set; }
        [Required]
        public double Cena { get; set; }
        public int Kvantitet { get; set; }
    }
}
