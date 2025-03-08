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
    }
}
