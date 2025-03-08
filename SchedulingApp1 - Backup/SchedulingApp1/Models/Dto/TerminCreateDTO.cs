using System.ComponentModel.DataAnnotations;

namespace SchedulingApp1.Models.Dto
{
    public class TerminCreateDTO
    {
        [Required]
        public int SportskiObjekatId { get; set; }
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public TimeSpan VremePocetka { get; set; }
        [Required]
        public TimeSpan VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
