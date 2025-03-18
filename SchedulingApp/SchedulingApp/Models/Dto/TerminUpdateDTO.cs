using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class TerminUpdateDTO
    {
        [Key]
        public int TerminId { get; set; }
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public string VremePocetka { get; set; }
        [Required]
        public string VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
