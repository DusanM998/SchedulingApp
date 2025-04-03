using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp.Models
{
    public class RezervacijaDetalji
    {
        [Key]
        public int RezervacijaDetaljiId { get; set; }
        [Required]
        public int RezervacijaHeaderId { get; set; }
        /*[Required]
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }*/
        [Required]
        public int TerminId { get; set; }
        [ForeignKey("TerminId")]
        public Termin Termin { get; set; }
        [Required]
        public double Cena { get; set; }
        public int BrojUcesnika { get; set; }
    }
}
