using Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure;

namespace SchedulingApp.Models.Dto
{
    public class RegisterRequestDTO
    {
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public IFormFile File { get; set; }
        public string PhoneNumber { get; set; }
    }
}
