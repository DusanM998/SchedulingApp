using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
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
            int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                // Ucitavaju se termini iz b.p zajedno sa sportskim objektima
                // i primenjuju se filteri na osnovu prosledjenih parametara
                // Posto sam termine definisao kao IQueryable<Termin>
                // svi filteri kasnije (Where, OrderBy, Skip, Take) prevode SQL upit i izvrsavaju se na bazi podataka
                // Koristi se Eager Loading jer .Include direktno ucitava povezane entitete
                IQueryable<Termin> termini = _db.Termini
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
                    var danPocetak = datum.Value.Date;
                    var danKraj = danPocetak.AddDays(1);
                    termini = termini.Where(t => t.DatumTermina >= danPocetak && t.DatumTermina < danKraj);
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

                // Dodajem custom header(X-pagination) sa informacijama o paginaciji
                // u HTTP response, zato sto tako razdvajam podatke i meta-podatke
                // Header ce sadrzati meta-podatke o paginaciji: broj zapisa, trenutnu stranicu i velicinu stranice

                Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagination));

                // Dok ce _response.Result sadrzati samo podatke o terminima
                _response.Result = termini.Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TerminDTO
                    {
                        TerminId = t.TerminId,
                        DatumTermina = t.DatumTermina,
                        VremePocetka = t.VremePocetka,
                        VremeZavrsetka = t.VremeZavrsetka,
                        Status = t.Status,
                        UserId = t.UserId,
                        NazivSportskogObjekta = t.SportskiObjekat.Naziv,
                    }).ToList();
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
