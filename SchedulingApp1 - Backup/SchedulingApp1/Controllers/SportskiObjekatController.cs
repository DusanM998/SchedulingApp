using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchedulingApp1.DbContexts;
using SchedulingApp1.Models;
using SchedulingApp1.Models.Dto;
using System.Net;

namespace SchedulingApp1.Controllers
{
    [Route("api/sportskiObjekat")]
    [ApiController]
    public class SportskiObjekatController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;

        public SportskiObjekatController(ApplicationDbContexts db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet]
        public async Task<IActionResult> GetSportskiObjekti()
        {
            _response.Result = _db.SportskiObjekti;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_db.SportskiObjekti);
        }

        [HttpGet("{id:int}", Name = "GetSportskiObjekatById")]
        public async Task<IActionResult> GetSportskiObjekatById(int id)
        {
            if (id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }
            SportskiObjekat sportskiObjekat = _db.SportskiObjekti.FirstOrDefault(u => u.Id == id);
            if (sportskiObjekat == null)
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
                if (ModelState.IsValid)
                {
                    SportskiObjekat sportskiObjekat = new()
                    {
                        Naziv = sportskiObjekatCreateDTO.Naziv,
                        Lokacija = sportskiObjekatCreateDTO.Lokacija,
                        VrstaSporta = sportskiObjekatCreateDTO.VrstaSporta,
                        Opis = sportskiObjekatCreateDTO.Opis,
                        RadnoVreme = sportskiObjekatCreateDTO.RadnoVreme,
                        CenaPoSatu = sportskiObjekatCreateDTO.CenaPoSatu,
                        Kapacitet = sportskiObjekatCreateDTO.Kapacitet
                    };
                    _db.SportskiObjekti.Add(sportskiObjekat);
                    _db.SaveChanges();
                    _response.Result = sportskiObjekat;
                    _response.StatusCode = HttpStatusCode.Created;
                    return CreatedAtRoute("GetSportskiObjekatById", new { id = sportskiObjekat.Id }, _response);
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

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse>> DeleteSportskiObjekat(int id)
        {
            try
            {
                if (id == 0)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                SportskiObjekat sportskiObjekatFromDb = await _db.SportskiObjekti.FindAsync(id);
                if (sportskiObjekatFromDb == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                _db.SportskiObjekti.Remove(sportskiObjekatFromDb);
                _db.SaveChanges();
                _response.StatusCode = HttpStatusCode.NoContent;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }

        [HttpPut]
        public async Task<ActionResult<ApiResponse>> UpdateSportskiObjekat(int id, [FromForm] SportskiObjekatUpdateDTO sportskiObjekatUpdateDTO)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (sportskiObjekatUpdateDTO == null || id != sportskiObjekatUpdateDTO.Id)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    SportskiObjekat sportskiObjekatFromDb = await _db.SportskiObjekti.FindAsync(id);
                    if (sportskiObjekatFromDb == null)
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
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
            }
            return _response;
        }
    }
}
