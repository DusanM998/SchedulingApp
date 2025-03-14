﻿using System.ComponentModel.DataAnnotations;

namespace SchedulingApp1.Models.Dto
{
    public class UserDetailsUpdateDTO
    {
        [Key]
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
    }
}
