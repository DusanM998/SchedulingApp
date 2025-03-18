using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Services;
using System.Net;

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
            _response.Result = _db.SportskiObjekti;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_db.SportskiObjekti);
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
            SportskiObjekat sportskiObjekat = _db.SportskiObjekti.FirstOrDefault(u => u.SportskiObjekatId == id);
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
                        Image = imageUrl
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

        [HttpPut]
        public async Task<ActionResult<ApiResponse>> UpdateSportskiObjekat(int id, [FromForm] SportskiObjekatUpdateDTO sportskiObjekatUpdateDTO)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(sportskiObjekatUpdateDTO == null || id != sportskiObjekatUpdateDTO.Id)
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

                    //Upload nove slike ako postoji
                    if (sportskiObjekatUpdateDTO.File != null && sportskiObjekatUpdateDTO.File.Length > 0)
                    {
                        try
                        {
                            string imageUrl = await _cloudinaryService.UploadImageAsync(sportskiObjekatUpdateDTO.File);
                            sportskiObjekatFromDb.Image = imageUrl;
                        }
                        catch (Exception ex)
                        {
                            _response.StatusCode = HttpStatusCode.InternalServerError;
                            _response.IsSuccess = false;
                            _response.ErrorMessages.Add($"Greška prilikom upload-a slike: {ex.Message}");
                            return StatusCode(500, _response);
                        }
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
