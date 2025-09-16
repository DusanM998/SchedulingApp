using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Services;
using System.Net;
using System.Text.Json;

namespace SchedulingApp.Controllers
{
    [Route("api/sportskiObjektiApi")]
    [ApiController]
    public class SportskiObjekatController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;
        private readonly CloudinaryService _cloudinaryService;

        public SportskiObjekatController(ApplicationDbContexts db, CloudinaryService cloudinaryService)
        {
            _db = db;
            _response = new ApiResponse();
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSportskiObjekti()
        {
            var objekti = _db.SportskiObjekti.Include(u => u.Termini).ToList();
            _response.Result = objekti;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_db.SportskiObjekti);
        }

        [HttpGet("/api/sportskiObjektiWithPagination")]
        public async Task<ActionResult<ApiResponse>> GetSportskiObjektiWithPagination(int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                // Eager loading da ucitam sve sportske objekte
                IEnumerable<SportskiObjekat> objekti = _db.SportskiObjekti.Include(u => u.Termini).ToList();
                
                // Kreiram paginaciju, (racunam koliko je objekta preuzeto, koliko ce se prikazivati po stranici PageSize)
                // Server - side paginacija, umesto da vracam sve rezultate, vracam samo stranicu koju klijent trazi
                Pagination pagination = new()
                {
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalRecords = objekti.Count()
                };

                // U headeru stavljam dodatne informacije "X-Pagination" koje frontend moze da koristi
                Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagination));
                // Skip() preskace odr. br el. od pocetka kolekcije (pageNumber - 1) * pageSize racuna koliko el. treba preskociti
                // Take() uzima odr. br. el. nakon sto su preskoceni neki (pageSize - definise koliko max moze da uzme)
                _response.Result = objekti.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpGet("{id:int}", Name = "GetSportskiObjekatById")]
        public async Task<IActionResult> GetSportskiObjekatById(int id)
        {
            if(id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }
            SportskiObjekat sportskiObjekat = _db.SportskiObjekti
                .Include(u => u.Termini)
                .FirstOrDefault(u => u.SportskiObjekatId == id);
            if(sportskiObjekat == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }
            _response.Result = sportskiObjekat;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CreateSportskiObjekat([FromForm] SportskiObjekatCreateDTO sportskiObjekatCreateDTO)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(sportskiObjekatCreateDTO.File == null || sportskiObjekatCreateDTO.File.Length == 0)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    string imageUrl = await _cloudinaryService.UploadImageAsync(sportskiObjekatCreateDTO.File);

                    SportskiObjekat sportskiObjekat = new()
                    {
                        Naziv = sportskiObjekatCreateDTO.Naziv,
                        Lokacija = sportskiObjekatCreateDTO.Lokacija,
                        VrstaSporta = sportskiObjekatCreateDTO.VrstaSporta,
                        Opis = sportskiObjekatCreateDTO.Opis,
                        RadnoVreme = sportskiObjekatCreateDTO.RadnoVreme,
                        CenaPoSatu = sportskiObjekatCreateDTO.CenaPoSatu,
                        Kapacitet = sportskiObjekatCreateDTO.Kapacitet,
                        Image = imageUrl,
                        Termini = new List<Termin>()
                    };
                    _db.SportskiObjekti.Add(sportskiObjekat);
                    _db.SaveChanges();
                    _response.Result = sportskiObjekat;
                    _response.StatusCode = HttpStatusCode.Created;
                    return CreatedAtRoute("GetSportskiObjekatById", new {id = sportskiObjekat.SportskiObjekatId}, _response);
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
        public async Task<ActionResult<ApiResponse>> DeleteSportskiObjekat(int id)
        {
            try
            {
                if(id == 0)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                SportskiObjekat sportskiObjekatFromDb = await _db.SportskiObjekti.FindAsync(id);
                if(sportskiObjekatFromDb == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                if (!string.IsNullOrEmpty(sportskiObjekatFromDb.Image))
                {
                    try
                    {
                        await _cloudinaryService.DeleteImageAsync(sportskiObjekatFromDb.Image);
                    }
                    catch (Exception ex)
                    {
                        _response.StatusCode = HttpStatusCode.InternalServerError;
                        _response.IsSuccess = false;
                        _response.ErrorMessages.Add($"Greška prilikom brisanja stare slike: {ex.Message}");
                        return StatusCode(500, _response);
                    }
                }

                _db.SportskiObjekti.Remove(sportskiObjekatFromDb);
                _db.SaveChanges();
                _response.StatusCode = HttpStatusCode.NoContent;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse>> UpdateSportskiObjekat(int id, [FromForm] SportskiObjekatUpdateDTO sportskiObjekatUpdateDTO)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(sportskiObjekatUpdateDTO == null || id != sportskiObjekatUpdateDTO.SportskiObjekatId)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    SportskiObjekat sportskiObjekatFromDb = await _db.SportskiObjekti.FindAsync(id);
                    if(sportskiObjekatFromDb == null)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    sportskiObjekatFromDb.Naziv = sportskiObjekatUpdateDTO.Naziv;
                    sportskiObjekatFromDb.Lokacija = sportskiObjekatUpdateDTO.Lokacija;
                    sportskiObjekatFromDb.VrstaSporta = sportskiObjekatUpdateDTO.VrstaSporta;
                    sportskiObjekatFromDb.Opis = sportskiObjekatUpdateDTO.Opis;
                    sportskiObjekatFromDb.RadnoVreme = sportskiObjekatUpdateDTO.RadnoVreme;
                    sportskiObjekatFromDb.CenaPoSatu = sportskiObjekatUpdateDTO.CenaPoSatu;
                    sportskiObjekatFromDb.Kapacitet = sportskiObjekatUpdateDTO.Kapacitet;

                    //Ako korinik nije poslao novu sliku, cuvamo staru
                    if (sportskiObjekatUpdateDTO.File == null || sportskiObjekatUpdateDTO.File.Length == 0)
                    {
                        _db.SportskiObjekti.Update(sportskiObjekatFromDb);
                        await _db.SaveChangesAsync();
                        _response.StatusCode = HttpStatusCode.NoContent;
                        return Ok(_response);
                    }

                    //Ako je korisnik poslao novu sliku, brisemo staru i dodajemo novu
                    if(!string.IsNullOrEmpty(sportskiObjekatFromDb.Image))
                    {
                        try
                        {
                            await _cloudinaryService.DeleteImageAsync(sportskiObjekatFromDb.Image);
                        }
                        catch(Exception ex)
                        {
                            _response.StatusCode = HttpStatusCode.InternalServerError;
                            _response.IsSuccess = false;
                            _response.ErrorMessages.Add($"Greska prilikom brisanja stare slike:  {ex.Message}");
                            return StatusCode(500, _response);
                        }
                    }

                    try
                    {
                        string imageUrl = await _cloudinaryService.UploadImageAsync(sportskiObjekatUpdateDTO.File);
                        sportskiObjekatFromDb.Image = imageUrl;
                    }
                    catch(Exception ex)
                    {
                        _response.StatusCode = HttpStatusCode.InternalServerError;
                        _response.IsSuccess = false;
                        _response.ErrorMessages.Add($"Greska prilikom upload-a slike:  {ex.Message}");
                        return StatusCode(500, _response);
                    }

                    _db.SportskiObjekti.Update(sportskiObjekatFromDb);
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

    }
}
