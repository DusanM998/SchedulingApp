using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp1.Models
{
    public class Termin
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public TimeSpan VremePocetka { get; set; }
        [Required]
        public TimeSpan VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
