﻿using System.ComponentModel.DataAnnotations;

namespace SchedulingApp.Models.Dto
{
    public class SportskiObjekatUpdateDTO
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Naziv { get; set; }
        public string Lokacija { get; set; }
        public string VrstaSporta { get; set; }
        public string Opis { get; set; }
        public string RadnoVreme { get; set; }
        public double CenaPoSatu { get; set; }
        public int Kapacitet { get; set; }
    }
}
