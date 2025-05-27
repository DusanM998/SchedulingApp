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

        [HttpGet("SveRezervacije")]
        public async Task<ActionResult<ApiResponse>> GetAllRezervacije()
        {
            try
            {
                IEnumerable<RezervacijaHeader> rezervacijaHeader = _db.RezervacijaHeader
                    .Include(u => u.RezervacijaDetalji)
                    //.ThenInclude(u => u.SportskiObjekat)
                    //.Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.OdabraniTermini)
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

        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetRezervacije(string? userId, string? searchString,
            string? status, int pageNumber = 1, int pageSize = 2)
        {
            try
            {
                IEnumerable<RezervacijaHeader> rezervacijaHeader = _db.RezervacijaHeader
                    .Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.OdabraniTermini)
                    .OrderByDescending(u => u.RezervacijaHeaderId);

                if(!string.IsNullOrEmpty(userId))
                {
                    rezervacijaHeader = rezervacijaHeader.Where(u => u.ApplicationUserId == userId);
                }
                if(!string.IsNullOrEmpty(searchString))
                {
                    rezervacijaHeader = rezervacijaHeader.Where(u => 
                    u.BrojKorisnika.Contains(searchString.ToLower())
                    || u.EmailKorisnika.Contains(searchString.ToLower())
                    || u.ImeKorisnika.Contains(searchString.ToLower()));
                }
                if(!string.IsNullOrEmpty(status))
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
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse>> GetRezervacijaById(int id)
        {
            try
            {
                if(id == 0)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.ErrorMessages = new List<string>() { $"Rezervacija sa ID {id} ne postoji." };
                    return BadRequest(_response);
                }

                var rezervacijaHeader = _db.RezervacijaHeader
                    .Where(r => r.RezervacijaHeaderId == id)
                    .Include(u => u.RezervacijaDetalji)
                        .ThenInclude(u => u.OdabraniTermini)
                    .OrderByDescending(u => u.RezervacijaHeaderId);

                if(rezervacijaHeader == null)
                {
                    _response.IsSuccess = false;
                    _response.StatusCode = HttpStatusCode.NotFound;
                    _response.ErrorMessages = new List<string> { $"Rezervacija ne postoji!" };
                    return NotFound(_response);
                }

                _response.Result = rezervacijaHeader;
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> KreirajRezervaciju([FromBody] RezervacijaHeaderCreateDTO rezervacijaHeaderCreateDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _response.IsSuccess = false;
                    _response.ErrorMessages = ModelState.Values.SelectMany(v => v.Errors)
                                                               .Select(e => e.ErrorMessage)
                                                               .ToList();
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    return BadRequest(_response);
                }

                // Kreiranje novog rezervacionog zaglavlja
                RezervacijaHeader rezervacija = new()
                {
                    ApplicationUserId = rezervacijaHeaderCreateDTO.ApplicationUserId,
                    ImeKorisnika = rezervacijaHeaderCreateDTO.ImeKorisnika,
                    BrojKorisnika = rezervacijaHeaderCreateDTO.BrojKorisnika,
                    EmailKorisnika = rezervacijaHeaderCreateDTO.EmailKorisnika,
                    UkupnoCena = rezervacijaHeaderCreateDTO.UkupnoCena,
                    Status = string.IsNullOrEmpty(rezervacijaHeaderCreateDTO.Status) ? SD.StatusRezervacije_Cekanje : rezervacijaHeaderCreateDTO.Status,
                    DatumRezervacije = DateTime.Now,
                    UkupnoRezervacija = rezervacijaHeaderCreateDTO.UkupnoRezervacija,
                    StripePaymentIntentId = rezervacijaHeaderCreateDTO.StripePaymentIntentId
                };

                _db.RezervacijaHeader.Add(rezervacija);
                await _db.SaveChangesAsync();

                foreach (var detaljiDTO in rezervacijaHeaderCreateDTO.RezervacijaDetaljiCreateDTO)
                {
                    // (Opcionalno) Proveri da li termin postoji
                    var termin = await _db.Termini
                                  .Include(t => t.SportskiObjekat)
                                  .FirstOrDefaultAsync(t => t.TerminId == detaljiDTO.TerminId);
                    if (termin == null)
                    {
                        _response.IsSuccess = false;
                        _response.ErrorMessages = new List<string> { $"Termin sa ID {detaljiDTO.TerminId} ne postoji." };
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        return BadRequest(_response);
                    }

                    RezervacijaDetalji detalji = new()
                    {
                        RezervacijaHeaderId = rezervacija.RezervacijaHeaderId,
                        TerminId = detaljiDTO.TerminId,
                        BrojUcesnika = detaljiDTO.BrojUcesnika,
                        Cena = detaljiDTO.Cena,
                        NazivSportskogObjekta = termin.SportskiObjekat?.Naziv,
                    };

                    termin.Status = "Zauzet";

                    _db.RezervacijaDetalji.Add(detalji);
                }

                await _db.SaveChangesAsync();

                _response.Result = rezervacija;
                _response.StatusCode = HttpStatusCode.Created;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { "Došlo je do greške prilikom kreiranja rezervacije.", ex.Message, ex.InnerException?.Message ?? "" };
                _response.StatusCode = HttpStatusCode.InternalServerError;
                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }


        /*[HttpPost]
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
                var termini = await _db.Termini
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

                RezervacijaHeader rezervacija = new()
                {
                    ApplicationUserId = rezervacijaHeaderCreateDTO.ApplicationUserId,
                    ImeKorisnika = rezervacijaHeaderCreateDTO.ImeKorisnika,
                    BrojKorisnika = rezervacijaHeaderCreateDTO.BrojKorisnika,
                    EmailKorisnika = rezervacijaHeaderCreateDTO.EmailKorisnika,
                    Status = rezervacijaHeaderCreateDTO.Status ?? SD.StatusRezervacije_Cekanje,
                    DatumRezervacije = DateTime.UtcNow,
                    UkupnoRezervacija = rezervacijaHeaderCreateDTO.RezervacijaDetalji.Count(),
                    UkupnoCena = rezervacijaHeaderCreateDTO.UkupnoCena,
                    StripePaymentIntentId = rezervacijaHeaderCreateDTO.StripePaymentIntentId
                };

                await _db.RezervacijaHeader.AddAsync(rezervacija);
                await _db.SaveChangesAsync();

                foreach (var rezervacijaDetaljiDTO in rezervacijaHeaderCreateDTO.RezervacijaDetalji)
                {
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
        }*/

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse>> UpdateRezervacijeHeader(int id, [FromBody] RezervacijaHeaderUpdateDTO rezervacijaheaderUpdateDTO)
        {
            try
            {
                if(rezervacijaheaderUpdateDTO == null || id!= rezervacijaheaderUpdateDTO.RezervacijaHeaderId)
                {
                    _response.IsSuccess = false;
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    return BadRequest();
                }
                RezervacijaHeader rezervacijaHeaderFromDb = _db.RezervacijaHeader.FirstOrDefault(u => u.RezervacijaHeaderId == id);

                if(rezervacijaHeaderFromDb == null)
                {
                    _response.IsSuccess = false;
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    return BadRequest();
                }
                if(!string.IsNullOrEmpty(rezervacijaheaderUpdateDTO.ImeKorisnika))
                {
                    rezervacijaHeaderFromDb.ImeKorisnika = rezervacijaheaderUpdateDTO.ImeKorisnika;
                }
                if (!string.IsNullOrEmpty(rezervacijaheaderUpdateDTO.EmailKorisnika))
                {
                    rezervacijaHeaderFromDb.EmailKorisnika = rezervacijaheaderUpdateDTO.EmailKorisnika;
                }
                if (!string.IsNullOrEmpty(rezervacijaheaderUpdateDTO.BrojKorisnika))
                {
                    rezervacijaHeaderFromDb.BrojKorisnika = rezervacijaheaderUpdateDTO.BrojKorisnika;
                }
                if (!string.IsNullOrEmpty(rezervacijaheaderUpdateDTO.StripeIntentPaymentId))
                {
                    rezervacijaHeaderFromDb.StripePaymentIntentId = rezervacijaheaderUpdateDTO.StripeIntentPaymentId;
                }
                if (!string.IsNullOrEmpty(rezervacijaheaderUpdateDTO.Status))
                {
                    rezervacijaHeaderFromDb.Status = rezervacijaheaderUpdateDTO.Status;
                }
                _db.SaveChanges();
                _response.StatusCode = HttpStatusCode.NoContent;
                _response.IsSuccess = true;
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }

        [HttpPut("otkaziRezervaciju/{rezervacijaId}")]
        public async Task<ActionResult<ApiResponse>> CancelRezervacija(int rezervacijaId)
        {
            try
            {
                var rezervacija = await _db.RezervacijaHeader
                    .Include(r => r.RezervacijaDetalji)
                    .ThenInclude(d => d.OdabraniTermini)
                    .FirstOrDefaultAsync(r => r.RezervacijaHeaderId == rezervacijaId);

                if (rezervacija == null)
                {
                    _response.IsSuccess = false;
                    _response.StatusCode = HttpStatusCode.NotFound;
                    _response.ErrorMessages = new List<string> { "Rezervacija nije pronađena." };
                    return NotFound(_response);
                }

                // Postavi status rezervacije na "Otkazano"
                rezervacija.Status = SD.StatusRezervacije_Otkazana;
                _db.RezervacijaHeader.Update(rezervacija);

                // Postavi sve povezane termine na "Slobodan" i ukloni UserId
                foreach (var detalj in rezervacija.RezervacijaDetalji)
                {
                    var termin = detalj.OdabraniTermini;
                    if (termin != null)
                    {
                        termin.Status = "Slobodan";
                        termin.UserId = null;
                        _db.Termini.Update(termin);
                    }
                }

                await _db.SaveChangesAsync();

                _response.IsSuccess = true;
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.ErrorMessages = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }
    }
}
