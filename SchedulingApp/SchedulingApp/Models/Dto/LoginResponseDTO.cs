namespace SchedulingApp.Models.Dto
{   
    //Dto koristim da smanjim kolicinu podataka koji se prenose izmedju slojeva aplikacije
    // DTO sluzi kao kontejner za podatke koje treba preneti (za prenos podataka izmedju razlicitih
    // slojeva aplikacije, tipicno izmedju klijenta i servera).
    public class LoginResponseDTO
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string? RefreshToken { get; set; }
    }
}
