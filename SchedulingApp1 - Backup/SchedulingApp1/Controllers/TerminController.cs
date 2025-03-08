using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchedulingApp1.DbContexts;
using SchedulingApp1.Models;
using SchedulingApp1.Models.Dto;
using SchedulingApp1.Utility;
using System.Net;

namespace SchedulingApp1.Controllers
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

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CreateTermin([FromBody] TerminCreateDTO terminCreateDTO)
        {
            try
            {
                Termin termin = new()
                {
                    SportskiObjekatId = terminCreateDTO.SportskiObjekatId,
                    DatumTermina = terminCreateDTO.DatumTermina,
                    VremePocetka = terminCreateDTO.VremePocetka,
                    VremeZavrsetka = terminCreateDTO.VremeZavrsetka,
                    Status = String.IsNullOrEmpty(terminCreateDTO.Status) ? SD.StatusTermina_Slobodan : terminCreateDTO.Status
                };

                if (ModelState.IsValid)
                {
                    _db.Termini.Add(termin);
                    _db.SaveChanges();
                    _response.Result = termin;
                    _response.StatusCode = HttpStatusCode.Created;
                    return Ok(_response);
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
            }
            return _response;
        }
    }
}
