using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class UserDetailsUpdateDTO
    {
        [Key]
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public IFormFile? File { get; set; }
    }
}
