using Microsoft.AspNetCore.Identity;

namespace SchedulingApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
        public string Image { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}
