namespace SchedulingApp.Models.Dto
{
    public class TerminDTO
    {
        public int TerminId { get; set; }
        public DateTime DatumTermina { get; set; }
        public string VremePocetka { get; set; }
        public string VremeZavrsetka { get; set; }
        public string Status { get; set; }
        public string? UserId { get; set; }
        public string NazivSportskogObjekta { get; set; }
    }
}
