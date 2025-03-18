using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using System.Net;

namespace SchedulingApp.Controllers
{
    [Route("api/korpa")]
    [ApiController]
    public class KorpaController : ControllerBase
    {
        protected ApiResponse _response;
        private readonly ApplicationDbContexts _db;
        public KorpaController(ApplicationDbContexts db)
        {
            _response = new ApiResponse();
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetKorpa(string userId)
        {
            try
            {
                Korpa korpa;

                if(string.IsNullOrEmpty(userId))
                {
                    korpa = new();
                }
                else
                {
                    korpa = _db.Korpe
                        .Include(u => u.StavkaKorpe)
                        .ThenInclude(u => u.SportskiObjekat)
                        .FirstOrDefault(u => u.UserId == userId);
                }

                if(korpa.StavkaKorpe != null && korpa.StavkaKorpe.Count > 0)
                {
                    korpa.UkupnoStavki = korpa.StavkaKorpe
                        .Sum(u => u.Kolicina * u.SportskiObjekat.CenaPoSatu);
                }

                _response.Result = korpa;
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
                _response.StatusCode = HttpStatusCode.BadRequest;
            }
            return _response;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> DodajIliAzurirajStavkuKorpe(string userId, int sportskiObjekatId, int kolicina)
        {
            Korpa korpa = _db.Korpe.Include(u => u.StavkaKorpe)
                .FirstOrDefault(u => u.UserId == userId);
            SportskiObjekat sportskiObjekat = _db.SportskiObjekti.FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);

            if(sportskiObjekat == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }
            if(korpa == null && kolicina > 0)
            {
                Korpa novaKorpa = new() { UserId = userId };
                _db.Korpe.Add(novaKorpa);
                _db.SaveChanges();

                StavkaKorpe novaStavkaKorpe = new()
                {
                    SportskiObjekatId = sportskiObjekatId,
                    Kolicina = kolicina,
                    KorpaId = novaKorpa.Id,
                    SportskiObjekat = null
                };
                _db.StavkeKorpe.Add(novaStavkaKorpe);
                _db.SaveChanges();
            }
            else
            {
                StavkaKorpe stavkaKorpe = korpa.StavkaKorpe.FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);
                if(stavkaKorpe == null)
                {
                    StavkaKorpe novaStavka = new()
                    {
                        SportskiObjekatId = sportskiObjekatId,
                        Kolicina = kolicina,
                        KorpaId = korpa.Id,
                        SportskiObjekat = null
                    };
                    _db.StavkeKorpe.Add(novaStavka);
                    _db.SaveChanges();
                }
                else
                {
                    int novaKolicina = stavkaKorpe.Kolicina + kolicina;
                    if (kolicina == 0 || novaKolicina <= 0)
                    {
                        //Brisem cartItem iz korpe
                        _db.StavkeKorpe.Remove(stavkaKorpe);
                        if (korpa.StavkaKorpe.Count() == 1)
                        {
                            _db.Korpe.Remove(korpa);
                        }
                        _db.SaveChanges();
                    }
                    else
                    {
                        stavkaKorpe.Kolicina = novaKolicina;
                        _db.SaveChanges();
                    }
                }
            }
            return _response;
        }
    }
}
