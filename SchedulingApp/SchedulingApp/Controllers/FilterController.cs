using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using System.Net;
using System.Text.Json;

namespace SchedulingApp.Controllers
{
    [Route("api/filter")]
    [ApiController]
    public class FilterController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;

        public FilterController(ApplicationDbContexts db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetRecords(string? lokacija, string? vrstaSporta, DateTime? datum,
            int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                IEnumerable<Termin> termini = _db.Termini
                    .Include(t => t.SportskiObjekat)
                    .OrderBy(t => t.DatumTermina)
                    .ThenBy(t => t.VremePocetka);

                //Filter po lokaciji
                if (!string.IsNullOrEmpty(lokacija))
                {
                    termini = termini.Where(t => t.SportskiObjekat.Lokacija.ToLower()
                        .Contains(lokacija.ToLower()));
                }

                //Filter po vrsti sporta
                if (!string.IsNullOrEmpty(vrstaSporta))
                {
                    termini = termini.Where(t => t.SportskiObjekat.VrstaSporta.ToLower()
                        .Contains(vrstaSporta.ToLower()));
                }

                //Filter po datumu termina
                if (datum.HasValue)
                {
                    termini = termini.Where(t => t.DatumTermina.Date == datum.Value.Date);
                }

                //Filter po vremenu pocetka
                /*if (!string.IsNullOrEmpty(vremePocetka))
                {
                    termini = termini.Where(t => string.Compare(t.VremePocetka, vremePocetka) >= 0);
                }

                //Filter po vremenu zavrsetka
                if (!string.IsNullOrEmpty(vremeZavrsetka))
                {
                    termini = termini.Where(t => string.Compare(t.VremeZavrsetka, vremeZavrsetka) <= 0);
                }*/

                int totalRecords = termini.Count();

                Pagination pagination = new()
                {
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalRecords = totalRecords
                };

                Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagination));

                _response.Result = termini.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
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
