using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class RezervacijaDetaljiCreateDTO
    {
        [Required]
        public int RezervacijaHeaderId { get; set; }
        [Required]
        public int SportskiObjekatId { get; set; }
        [Required]
        public int TerminId { get; set; }
        [Required]
        public double Cena { get; set; }
        public int Kvantitet { get; set; }
    }
}
