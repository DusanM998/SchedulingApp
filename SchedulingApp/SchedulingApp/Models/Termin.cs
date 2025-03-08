using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp.Models
{
    public class Termin
    {
        [Key]
        public int TerminId { get; set; }
        /*[Required]
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }*/
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public string VremePocetka { get; set; }
        [Required]
        public string VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
