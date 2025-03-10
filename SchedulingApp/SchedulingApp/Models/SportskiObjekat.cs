using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models
{
    public class SportskiObjekat
    {
        [Key]
        public int SportskiObjekatId { get; set; }
        [Required]
        public string Naziv { get; set; }
        [Required]
        public string Lokacija { get; set; }
        [Required]
        public string VrstaSporta { get; set; }
        public string Opis { get; set; }
        [Required]
        public string RadnoVreme { get; set; }
        [Range(1, double.MaxValue)]
        public double CenaPoSatu { get; set; }
        public int Kapacitet { get; set; }
        //public string Image { get; set; }
    }
}