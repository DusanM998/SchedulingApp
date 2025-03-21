using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class TerminCreateDTO
    {
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public int SportskiObjekatId { get; set; }
        [Required]
        public string VremePocetka { get; set; }
        [Required]
        public string VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
