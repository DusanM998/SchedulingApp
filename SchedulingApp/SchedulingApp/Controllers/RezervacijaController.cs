using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Utility;
using System.Net;
using System.Text.Json;

namespace SchedulingApp.Controllers
{
    [Route("api/rezervacija")]
    [ApiController]
    public class RezervacijaController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;

        public RezervacijaController(ApplicationDbContexts db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetAllRezervacije()
        {
            try
            {
                IEnumerable<RezervacijaHeader> rezervacijaHeader = _db.RezervacijaHeader
                    .Include(u => u.RezervacijaDetalji)
                        //.ThenInclude(u => u.SportskiObjekat)
                    .Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.Termin)
                    .OrderByDescending(u => u.RezervacijaHeaderId);

                _response.Result = rezervacijaHeader;
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }

        /*[HttpGet]
        public async Task<ActionResult<ApiResponse>> GetRezervacije(string? userId, string? searchString,
            string status, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                IEnumerable<RezervacijaHeader> rezervacijaHeader = _db.RezervacijaHeader
                    .Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.SportskiObjekat)
                    .Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.Termin)
                    .OrderByDescending(u => u.RezervacijaHeaderId);

                if(!string.IsNullOrEmpty(userId))
                {
                    rezervacijaHeader = rezervacijaHeader.Where(u => u.ApplicationUserId == userId);
                }
                if(!string.IsNullOrEmpty(searchString))
                {
                    rezervacijaHeader = rezervacijaHeader.Where(u => u.BrojKorisnika.Contains(searchString.ToLower())
                    || u.EmailKorisnika.Contains(searchString.ToLower())
                    || u.ImeKorisnika.Contains(searchString.ToLower()));
                }
                if(!string.IsNullOrEmpty(searchString))
                {
                    rezervacijaHeader = rezervacijaHeader.Where(u => u.Status.ToLower() == status.ToLower());
                }

                Pagination pagination = new()
                {
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalRecords = rezervacijaHeader.Count()
                };

                Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagination));

                _response.Result = rezervacijaHeader.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }*/

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CreateRezervacija([FromBody] RezervacijaHeaderCreateDTO rezervacijaHeaderCreateDTO)
        {
            try
            {
                RezervacijaHeader rezervacija = new()
                {
                    ApplicationUserId = rezervacijaHeaderCreateDTO.ApplicationUserId,
                    ImeKorisnika = rezervacijaHeaderCreateDTO.ImeKorisnika,
                    BrojKorisnika = rezervacijaHeaderCreateDTO.BrojKorisnika,
                    EmailKorisnika = rezervacijaHeaderCreateDTO.EmailKorisnika,
                    Status = String.IsNullOrEmpty(rezervacijaHeaderCreateDTO.Status) ? SD.StatusRezervacije_Cekanje : rezervacijaHeaderCreateDTO.Status,
                    DatumRezervacije = DateTime.Now,
                    UkupnoRezervacija = rezervacijaHeaderCreateDTO.UkupnoRezervacija,
                    StripePaymentIntentId = rezervacijaHeaderCreateDTO.StripePaymentIntentId,
                };

                if(ModelState.IsValid)
                {
                    _db.RezervacijaHeader.Add(rezervacija);
                    _db.SaveChanges();
                    foreach(var rezervacijaDetaljiDTO in rezervacijaHeaderCreateDTO.RezervacijaDetalji)
                    {

                        var termin = await _db.Termini.FindAsync(rezervacijaDetaljiDTO.TerminId);
                        if(termin == null)
                        {
                            _response.IsSuccess = false;
                            _response.ErrorMessages = new List<string> { "Nevazeci termin!" };
                            return BadRequest(_response);
                        }

                        //Provera da li termin pripada izabranom sportskom objektu
                        //if(termin.SportskiObjekatId != rezervacijaDetaljiDTO.)
                        RezervacijaDetalji rezervacijaDetalji = new()
                        {
                            RezervacijaHeaderId = rezervacija.RezervacijaHeaderId,
                            //SportskiObjekatId = rezervacijaDetaljiDTO.SportskiObjekatId,
                            TerminId = rezervacijaDetaljiDTO.TerminId,
                            Cena = rezervacijaDetaljiDTO.Cena,
                            Kvantitet = rezervacijaDetaljiDTO.Kvantitet
                        };
                        _db.RezervacijaDetalji.Add(rezervacijaDetalji);
                    }
                    _db.SaveChanges();
                    _response.Result = rezervacija;
                    _response.StatusCode = HttpStatusCode.Created;
                    return Ok(_response);
                }
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }
    }
}
