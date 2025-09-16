namespace SchedulingApp.Utility
{
    // Klasa koja cuva staticke detalje o rezervaciji, rolama, itd
    // Koristim je jer tako pravim centralizovano mesto za cuvanje konstanti koje se
    // koriste kroz celu aplikaciju i sve string konstante su mi na jednom mestu
    public class SD
    {
        public const string Role_Admin = "admin";
        public const string Role_Customer = "customer";

        public const string StatusRezervacije_Cekanje = "Na Čekanju";
        public const string StatusRezervacije_Potvrdjeno = "Potvrđeno";
        public const string StatusRezervacije_U_Toku = "U Toku";
        public const string StatusRezervacije_Otkazana = "Otkazana";
        public const string StatusRezervacije_Zavrseno = "Završeno";

        public const string StatusTermina_Slobodan = "Slobodan";
        public const string StatusTermina_Zauzet = "Zauzet";
        public const string StatusTermina_Otkazan = "Otkazan";
        public const string StatusTermina_Istekao = "Istekao";
        public const string StatusTermina_Zavrsen = "Zavrsen";
    }
}
