using Microsoft.AspNetCore.Identity;

namespace SchedulingApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
    }
}
