using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Utility;
using System.Linq;
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
            catch (Exception ex)
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
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                if (rezervacijaHeaderCreateDTO?.RezervacijaDetalji == null || !rezervacijaHeaderCreateDTO.RezervacijaDetalji.Any())
                {
                    return BadRequest(new ApiResponse
                    {
                        IsSuccess = false,
                        ErrorMessages = new List<string> { "Podaci o rezervaciji su nevalidni!" }
                    });
                }

                var terminiIds = rezervacijaHeaderCreateDTO.RezervacijaDetalji.Select(d => d.TerminId).ToList();
                var termini = await _db.Termini.Include(t => t.SportskiObjekat)
                                               .Where(t => terminiIds.Contains(t.TerminId))
                                               .ToListAsync();

                if (termini.Count != rezervacijaHeaderCreateDTO.RezervacijaDetalji.Count())
                {
                    return BadRequest(new ApiResponse
                    {
                        IsSuccess = false,
                        ErrorMessages = new List<string> { "Jedan ili više termina nisu pronađeni!" }
                    });
                }

                int sportskiObjekatId = termini.First().SportskiObjekatId;
                if (termini.Any(t => t.SportskiObjekatId != sportskiObjekatId))
                {
                    return BadRequest(new ApiResponse
                    {
                        IsSuccess = false,
                        ErrorMessages = new List<string> { "Svi termini moraju pripadati istom sportskom objektu!" }
                    });
                }

                var sportskiObjekat = await _db.SportskiObjekti.FindAsync(sportskiObjekatId);
                if (sportskiObjekat == null)
                {
                    return BadRequest(new ApiResponse
                    {
                        IsSuccess = false,
                        ErrorMessages = new List<string> { "Sportski objekat nije pronađen!" }
                    });
                }

                int ukupniBrojUcesnika = rezervacijaHeaderCreateDTO.RezervacijaDetalji.Sum(d => d.BrojUcesnika);
                if (ukupniBrojUcesnika > sportskiObjekat.Kapacitet)
                {
                    return BadRequest(new ApiResponse
                    {
                        IsSuccess = false,
                        ErrorMessages = new List<string> { $"Ukupan broj učesnika ({ukupniBrojUcesnika}) premašuje kapacitet objekta ({sportskiObjekat.Kapacitet})!" }
                    });
                }

                RezervacijaHeader rezervacija = new()
                {
                    ApplicationUserId = rezervacijaHeaderCreateDTO.ApplicationUserId,
                    ImeKorisnika = rezervacijaHeaderCreateDTO.ImeKorisnika,
                    BrojKorisnika = rezervacijaHeaderCreateDTO.BrojKorisnika,
                    EmailKorisnika = rezervacijaHeaderCreateDTO.EmailKorisnika,
                    Status = rezervacijaHeaderCreateDTO.Status ?? SD.StatusRezervacije_Cekanje,
                    DatumRezervacije = DateTime.UtcNow,
                    UkupnoRezervacija = rezervacijaHeaderCreateDTO.RezervacijaDetalji.Count(),
                    StripePaymentIntentId = rezervacijaHeaderCreateDTO.StripePaymentIntentId
                };

                await _db.RezervacijaHeader.AddAsync(rezervacija);
                await _db.SaveChangesAsync();

                foreach (var rezervacijaDetaljiDTO in rezervacijaHeaderCreateDTO.RezervacijaDetalji)
                {
                    var termin = termini.FirstOrDefault(t => t.TerminId == rezervacijaDetaljiDTO.TerminId);
                    if (termin == null || termin.Status == "Zauzet" || termin.SportskiObjekat.Kapacitet < rezervacijaDetaljiDTO.BrojUcesnika)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new ApiResponse
                        {
                            IsSuccess = false,
                            ErrorMessages = new List<string> { $"Termin sa ID-jem {rezervacijaDetaljiDTO.TerminId} nema dovoljno mesta!" }
                        });
                    }

                    termin.SportskiObjekat.Kapacitet -= rezervacijaDetaljiDTO.BrojUcesnika;
                    if (termin.SportskiObjekat.Kapacitet == 0)
                    {
                        termin.Status = "Zauzet";
                    }
                    _db.Termini.Update(termin);

                    RezervacijaDetalji rezervacijaDetalji = new()
                    {
                        RezervacijaHeaderId = rezervacija.RezervacijaHeaderId,
                        TerminId = rezervacijaDetaljiDTO.TerminId,
                        Cena = rezervacijaDetaljiDTO.Cena,
                        BrojUcesnika = rezervacijaDetaljiDTO.BrojUcesnika
                    };

                    await _db.RezervacijaDetalji.AddAsync(rezervacijaDetalji);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(CreateRezervacija), new ApiResponse { IsSuccess = true, Result = rezervacija });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse
                {
                    IsSuccess = false,
                    ErrorMessages = new List<string> { "Greška prilikom kreiranja rezervacije!", ex.Message }
                });
            }
        }

        
    }
}
