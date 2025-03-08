using Microsoft.AspNetCore.Identity;

namespace SchedulingApp1.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
    }
}
