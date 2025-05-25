using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Utility;
using System.Net;

namespace SchedulingApp.Controllers
{
    [Route("api/termin")]
    [ApiController]
    public class TerminController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;

        public TerminController(ApplicationDbContexts db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet]
        public async Task<IActionResult> GetTermini()
        {
            _response.Result = _db.Termini;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_db.Termini);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CreateTermin([FromForm] TerminCreateDTO terminCreateDTO)
        {
            try
            {
                var sportskiObjekat = await _db.SportskiObjekti.FindAsync(terminCreateDTO.SportskiObjekatId);
                if (sportskiObjekat == null)
                {
                    _response.IsSuccess = false;
                    _response.StatusCode = HttpStatusCode.NotFound;
                    _response.ErrorMessages = new List<string> { "Sportski Objekat nije pronadjen!" };
                    return NotFound(_response);
                }
                Termin termin = new()
                {
                    SportskiObjekatId = terminCreateDTO.SportskiObjekatId,
                    DatumTermina = terminCreateDTO.DatumTermina,
                    VremePocetka = terminCreateDTO.VremePocetka,
                    VremeZavrsetka = terminCreateDTO.VremeZavrsetka,
                    Status = String.IsNullOrEmpty(terminCreateDTO.Status) ? SD.StatusTermina_Slobodan : terminCreateDTO.Status
                };

                if(ModelState.IsValid)
                {
                    _db.Termini.Add(termin);
                    _db.SaveChanges();
                    _response.Result = termin;
                    _response.StatusCode = HttpStatusCode.Created;
                    return Ok(_response);
                }
                else
                {
                    return BadRequest(ModelState);
                }
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }
        [HttpGet("{id:int}", Name = "GetTermin")]
        public async Task<IActionResult> GetTermin(int id)
        {
            if (id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }
            var sportskiObjekat = _db.SportskiObjekti.Include(u => u.Termini)
                .FirstOrDefault(u => u.SportskiObjekatId == id);
            if (sportskiObjekat == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }
            _response.Result = sportskiObjekat.Termini;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(sportskiObjekat.Termini);
        }

        [HttpGet("termin/{id:int}", Name = "GetTerminById")]
        public async Task<IActionResult> GetTerminById(int id)
        {
            if (id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }
            var termini = await _db.Termini
                .Include(t => t.SportskiObjekat)
                .Where(t => t.TerminId == id)
                .ToListAsync();

            if (termini == null || !termini.Any())
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }
            _response.Result = termini;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse>> UpdateTermin(int id, [FromForm] TerminUpdateDTO terminUpdateDTO)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(terminUpdateDTO == null || id!=terminUpdateDTO.TerminId)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    Termin terminFromDb = await _db.Termini.FindAsync(id);
                    if(terminFromDb == null)
                    {
                        _response.IsSuccess = false;
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        return BadRequest();
                    }

                    terminFromDb.DatumTermina = terminUpdateDTO.DatumTermina;
                    terminFromDb.VremePocetka = terminUpdateDTO.VremePocetka;
                    terminFromDb.VremeZavrsetka = terminUpdateDTO.VremeZavrsetka;
                    terminFromDb.Status = terminUpdateDTO.Status;
                    terminFromDb.UserId = terminUpdateDTO.UserId;

                    _db.Termini.Update(terminFromDb);
                    _db.SaveChanges();
                    _response.StatusCode = HttpStatusCode.NoContent;
                    return Ok(_response);
                }
                else
                {
                    _response.IsSuccess = false;
                }
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse>> DeleteTermin(int id)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (id == 0)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    Termin terminFromDb = await _db.Termini.FindAsync(id);
                    if (terminFromDb == null)
                    {
                        _response.IsSuccess = false;
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        return BadRequest();
                    }

                    _db.Termini.Remove(terminFromDb);
                    _db.SaveChanges();
                    _response.StatusCode = HttpStatusCode.NoContent;
                    return Ok(_response);
                }
                else
                {
                    _response.IsSuccess = false;
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }
    }
}
