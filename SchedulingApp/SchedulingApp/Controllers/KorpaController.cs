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
                Korpa korpa = new();

                if (!string.IsNullOrEmpty(userId))
                {
                    korpa = _db.Korpe
                        .Include(u => u.StavkaKorpe)
                            .ThenInclude(s => s.SportskiObjekat)
                        .Include(u => u.StavkaKorpe)
                            .ThenInclude(s => s.OdabraniTermini) // Ucitavamo termine
                        .FirstOrDefault(u => u.UserId == userId) ?? new Korpa();
                }

                if (korpa.StavkaKorpe != null && korpa.StavkaKorpe.Count > 0)
                {
                    korpa.UkupnoZaPlacanje = korpa.StavkaKorpe.Sum(stavka =>
                        stavka.OdabraniTermini.Sum(termin =>
                            stavka.SportskiObjekat?.CenaPoSatu ?? 0
                        )
                    );
                }
                else
                {
                    korpa.UkupnoZaPlacanje = 0;
                }

                _response.Result = korpa;
                _response.StatusCode = HttpStatusCode.OK;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.ToString() };
                _response.StatusCode = HttpStatusCode.BadRequest;
                return _response;
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> DodajIliAzurirajStavkuKorpe(string userId, int sportskiObjekatId, int brojUcesnika)
        {
            Korpa korpa = _db.Korpe.Include(u => u.StavkaKorpe)
                .ThenInclude(s => s.OdabraniTermini)
                .FirstOrDefault(u => u.UserId == userId);

            SportskiObjekat sportskiObjekat = _db.SportskiObjekti.
                FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);

            if (sportskiObjekat == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            //ako korisnik nema korpu, kreira se nova
            if (korpa == null && brojUcesnika > 0)
            {
                Korpa novaKorpa = new() { UserId = userId };
                _db.Korpe.Add(novaKorpa);
                _db.SaveChanges();

                //Dodaje se nova stavka u korpu
                StavkaKorpe novaStavkaKorpe = new()
                {
                    SportskiObjekatId = sportskiObjekatId,
                    Kolicina = brojUcesnika,
                    KorpaId = novaKorpa.Id,
                    SportskiObjekat = sportskiObjekat,
                    CenaZaObjekat = sportskiObjekat.CenaPoSatu, 
                };
                _db.StavkeKorpe.Add(novaStavkaKorpe);
                _db.SaveChanges();
            }
            else
            {
                //Ako korpa vec postoji, proverava se da li je vec dodata stavka za dati sportski objekat
                StavkaKorpe stavkaKorpe = korpa.StavkaKorpe.FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);

                if (stavkaKorpe == null)
                {
                    StavkaKorpe novaStavka = new()
                    {
                        SportskiObjekatId = sportskiObjekatId,
                        Kolicina = brojUcesnika,
                        KorpaId = korpa.Id,
                        SportskiObjekat = sportskiObjekat,
                        OdabraniTermini = new List<Termin>(),
                        CenaZaObjekat = sportskiObjekat.CenaPoSatu,
                    };
                    _db.StavkeKorpe.Add(novaStavka);
                    _db.SaveChanges();
                }
                else
                {
                    //Ako stavka postoji, azuriramo kolicinu
                    int novaKolicina = stavkaKorpe.Kolicina + brojUcesnika;
                    if (novaKolicina > 0)
                    {
                        stavkaKorpe.Kolicina = novaKolicina;
                        _db.SaveChanges();
                    }
                    else
                    {
                        _db.StavkeKorpe.Remove(stavkaKorpe);

                        if (korpa.StavkaKorpe.Count() == 1)
                        {
                            _db.Korpe.Remove(korpa);
                        }
                        _db.SaveChanges();
                    }
                }
            }
            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            return Ok(_response);
        }

        [HttpPost("ukloniStavku")]
        public async Task<ActionResult<ApiResponse>> UkloniStavkuIzKorpe(string userId, int sportskiObjekatId)
        {
            try
            {
                //Pronalazi korpu za odredjenog korisnika
                Korpa korpa = _db.Korpe
                    .Include(u => u.StavkaKorpe)
                    .ThenInclude(s => s.OdabraniTermini) //Ucitava termine vezane za stavku korpe
                    .FirstOrDefault(u => u.UserId == userId);

                if(korpa == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages = new List<string> { "Korpa nije pronadjena!" };
                    return BadRequest(_response);
                }

                //Pronalazi stavku u korpi koja odgovara datom sportskom objektu
                StavkaKorpe stavkaKorpe = korpa.StavkaKorpe.FirstOrDefault(u => u.SportskiObjekatId ==  sportskiObjekatId);

                if(stavkaKorpe == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages = new List<string> { "Stavka korpe nije pronadjena!" };
                    return BadRequest(_response);
                }

                //Menja se status termina kada korisnik ukloni termin iz korpe
                foreach(var termin in stavkaKorpe.OdabraniTermini)
                {
                    termin.Status = "Slobodan";
                    _db.Termini.Update(termin);
                }

                stavkaKorpe.OdabraniTermini.Clear(); //Prekida se veza izmedju stavke i termina(ali se ne brise termin)

                _db.StavkeKorpe.Remove(stavkaKorpe);

                //Ako je to bila poslednja stavka u korpi, ukloni celu korpu
                if(korpa.StavkaKorpe.Count() == 1)
                {
                    _db.Korpe.Remove(korpa);
                }

                await _db.SaveChangesAsync();

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
                return BadRequest(_response);
            }
        }

        [HttpPost("dodajIliAzurirajKorpuSaTerminima")]
        public async Task<ActionResult<ApiResponse>> DodajIliAzurirajKorpuSaTerminima(string userId, int sportskiObjekatId, int brojUcesnika, [FromBody] List<int> terminIds)
        {
            Korpa korpa = _db.Korpe.Include(u => u.StavkaKorpe)
                .ThenInclude(s => s.OdabraniTermini)
                .FirstOrDefault(u => u.UserId == userId);

            SportskiObjekat sportskiObjekat = _db.SportskiObjekti.
                FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);

            if (sportskiObjekat == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            List<Termin> odabraniTermini = _db.Termini
                .Where(t => terminIds.Contains(t.TerminId) && t.SportskiObjekatId == sportskiObjekatId)
                .ToList();

            if (odabraniTermini.Count != terminIds.Count)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { "Neki odabrani termini ne postoje." };
                return BadRequest(_response);
            }

            double ukupnaCena = 0;
            DateTime? poslednjiZavrsniTermin = null;
            List<DateTime> zauzetiTermini = new List<DateTime>(); //Lista zauzetih termina koju vec obracunavamo

            foreach (var termin in odabraniTermini.OrderBy(t => DateTime.Parse(t.VremePocetka)))
            {
                DateTime vremePocetka = DateTime.Parse(termin.VremePocetka);
                DateTime vremeZavrsetka = DateTime.Parse(termin.VremeZavrsetka);

                if (termin.Status == "Slobodan")
                {
                    termin.Status = "Zauzet";
                    _db.Termini.Update(termin);
                }

                //Provera da li se terminni preklapaju
                bool terminPreklapa = false;
                foreach(var zauzetTermin in zauzetiTermini)
                {
                    if(vremePocetka < zauzetTermin)
                    {
                        terminPreklapa = true;
                        break;
                    }
                }

                if(!terminPreklapa)
                {
                    //Ako se termin ne preklapa sa prethodnim, racunamo njegovu cenu
                    double trajanjeTermina = (vremeZavrsetka - vremePocetka).TotalMinutes / 60.0;
                    ukupnaCena += sportskiObjekat.CenaPoSatu * trajanjeTermina;
                    zauzetiTermini.Add(vremeZavrsetka); //Dodajem zavrsni termin u listu zauzetih
                }
                else
                {
                    //Ako se preklapa racunamo samo dodato trajanje
                    if(vremeZavrsetka > (DateTime)poslednjiZavrsniTermin)
                    {
                        double trajanjeTermina = (vremeZavrsetka - vremePocetka).TotalMinutes / 60.0;
                        ukupnaCena += sportskiObjekat.CenaPoSatu * trajanjeTermina;
                    }
                }

                //Azurira poslednji zavrsni termin
                poslednjiZavrsniTermin = poslednjiZavrsniTermin == null ? vremeZavrsetka :
                    (vremeZavrsetka > (DateTime)poslednjiZavrsniTermin ? vremeZavrsetka : (DateTime)poslednjiZavrsniTermin);
            }
            //Racuna ukupnu cenu na osnovu ukupnog trajanja termina
            //ukupnaCena = sportskiObjekat.CenaPoSatu * ukupnoTrajanje;
            _db.SaveChanges();

            //ako korisnik nema korpu, kreira se nova
            if (korpa == null && brojUcesnika > 0)
            {
                Korpa novaKorpa = new() { UserId = userId };
                _db.Korpe.Add(novaKorpa);
                _db.SaveChanges();

                //Dodaje se nova stavka u korpu
                StavkaKorpe novaStavkaKorpe = new()
                {
                    SportskiObjekatId = sportskiObjekatId,
                    Kolicina = brojUcesnika,
                    KorpaId = novaKorpa.Id,
                    SportskiObjekat = sportskiObjekat,
                    OdabraniTermini = odabraniTermini,
                    CenaZaObjekat = ukupnaCena
                };
                _db.StavkeKorpe.Add(novaStavkaKorpe);
                _db.SaveChanges();
            }
            else
            {
                //Ako korpa vec postoji, proverava se da li je vec dodata stavka za dati sportski objekat
                StavkaKorpe stavkaKorpe = korpa.StavkaKorpe.FirstOrDefault(u => u.SportskiObjekatId == sportskiObjekatId);

                if (stavkaKorpe == null)
                {
                    StavkaKorpe novaStavka = new()
                    {
                        SportskiObjekatId = sportskiObjekatId,
                        Kolicina = brojUcesnika,
                        KorpaId = korpa.Id,
                        SportskiObjekat = sportskiObjekat,
                        OdabraniTermini = _db.Termini.Where(t => terminIds.Contains(t.TerminId)).ToList(),
                        CenaZaObjekat = ukupnaCena,
                    };
                    _db.StavkeKorpe.Add(novaStavka);
                    _db.SaveChanges();
                }
                else
                {
                    //Ako stavka postoji, azuriramo broj ucesnika, samo ako je novi broj veci
                    if(brojUcesnika > stavkaKorpe.Kolicina)
                    {
                        stavkaKorpe.Kolicina += brojUcesnika;
                    }

                    //Preuzima postojece termine
                    var postojeciTermini = stavkaKorpe.OdabraniTermini.Select(t => t.TerminId).ToList();

                    //Pronalazi nove termine koje korisnik rezervise
                    var noviTermini = odabraniTermini.Where(t => !postojeciTermini.Contains(t.TerminId)).ToList();

                    //dodaje nove termine na postojece
                    stavkaKorpe.OdabraniTermini.AddRange(noviTermini);

                    //Azurira cenu samo za nove termine
                    double dodatnaCena = 0;
                    foreach(var termin in noviTermini)
                    {
                        DateTime vremePocetka = DateTime.Parse(termin.VremePocetka);
                        DateTime vremeZavrsetka = DateTime.Parse(termin.VremeZavrsetka);
                        double trajanjeTermina = (vremeZavrsetka - vremePocetka).TotalMinutes / 60.0;
                        dodatnaCena += sportskiObjekat.CenaPoSatu * trajanjeTermina;
                    }

                    //stavkaKorpe.OdabraniTermini = _db.Termini.Where(t => terminIds.Contains(t.TerminId)).ToList(); //Azurira termine
                    //stavkaKorpe.SportskiObjekat = sportskiObjekat;
                    stavkaKorpe.CenaZaObjekat += dodatnaCena;
                    stavkaKorpe.SportskiObjekat = sportskiObjekat;
                    _db.SaveChanges();
                }
            }
            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            return Ok(_response);
        }

    }
}
