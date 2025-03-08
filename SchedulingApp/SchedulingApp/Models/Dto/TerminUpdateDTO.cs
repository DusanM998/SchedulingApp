using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class TerminUpdateDTO
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime DatumTermina { get; set; }
        [Required]
        public TimeSpan VremePocetka { get; set; }
        [Required]
        public TimeSpan VremeZavrsetka { get; set; }
        public string Status { get; set; }
    }
}
