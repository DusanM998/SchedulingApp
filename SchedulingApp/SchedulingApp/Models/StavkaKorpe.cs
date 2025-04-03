using System.ComponentModel.DataAnnotations.Schema;

namespace SchedulingApp.Models
{
    public class StavkaKorpe
    {
        public int Id { get; set; }
        public int SportskiObjekatId { get; set; }
        [ForeignKey("SportskiObjekatId")]
        public SportskiObjekat SportskiObjekat { get; set; }
        //Lista termina koje je korisnik odabrao
        public List<Termin> OdabraniTermini { get; set; }
        public int Kolicina { get; set; }
        public double CenaZaObjekat { get; set; }
        public int KorpaId { get; set; }
    }
}
