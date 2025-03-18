using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult<ApiResponse>> CreateTermin([FromBody] TerminCreateDTO terminCreateDTO)
        {
            try
            {
                Termin termin = new()
                {
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
            Termin termin = _db.Termini.FirstOrDefault(u => u.TerminId == id);
            if (termin == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }
            _response.Result = termin;
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
