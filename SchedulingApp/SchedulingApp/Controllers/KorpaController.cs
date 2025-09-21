using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Utility;
using System.Net;

//Controller za upravljanje korpom. Jedan korisnik moze imati jednu korpu
// ApplicationUser - Korpa (1 - 1)
// Jedna Korpa moze imati vise stavki korpe: Korpa - StavkaKorpe (1 - vise)
// StavkaKorpe moze sadrzati SportskiObjekat i OdabraneTermine
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

        // Na osnovu id-a user-a pronalazi njegovu korpu
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetKorpa(string userId)
        {
            try
            {
                Korpa korpa = new();

                if (!string.IsNullOrEmpty(userId))
                {
                    korpa = _db.Korpe
                        .Include(u => u.StavkaKorpe) //Kada ucitava korpu ucitaj i njenu kolekciju StavkaKorpe (eager loading) (LEFT JOIN na StavkaKorpe)
                            .ThenInclude(s => s.SportskiObjekat)  //korak dublje - ucitava za svaku stavku korpe njen SportskiObjekat (INNER JOIN na SportskiObjekat)
                        .Include(u => u.StavkaKorpe) //Priprema za sledeci ThenInclude 
                            .ThenInclude(s => s.OdabraniTermini) // Ucitavamo termine (LEFT JOIN sa Termini)
                        .FirstOrDefault(u => u.UserId == userId) ?? new Korpa(); //Uzima prvu ili jedinu korpu za odr. korisnika
                                                                                 //Ako korisnik nema korpu kreira se nova 
                }

                if (korpa.StavkaKorpe != null && korpa.StavkaKorpe.Count > 0)
                {
                    // Ucitava stavke korpe zajedno sa SportskiomObjektom i OdabranimTerminima
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

                //Menja se status termina kada korisnik ukloni termin iz korpe, ali za jedinstvenog korisnika
                foreach(var termin in stavkaKorpe.OdabraniTermini)
                {
                    if(termin.UserId == userId)
                    {
                        if(termin.Status != SD.StatusTermina_Zauzet)
                        {
                            termin.Status = "Slobodan";
                            termin.UserId = null; //Uklanja vlasnistvo korisnika nad terminom
                            _db.Termini.Update(termin);
                        }
                        else
                        {
                            Console.WriteLine($"Termin {termin.TerminId} je vec potvrdjen!");
                        }
                    }
                    
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
            // Pronalazak postojece korpe
            var korpa = await _db.Korpe
                                 .Include(k => k.StavkaKorpe)
                                     .ThenInclude(sk => sk.OdabraniTermini)
                                 .FirstOrDefaultAsync(k => k.UserId == userId);

            // Provera postojanja objekta
            var sportskiObjekat = await _db.SportskiObjekti.FirstOrDefaultAsync(o => o.SportskiObjekatId == sportskiObjekatId);
            if (sportskiObjekat == null)
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    IsSuccess = false,
                    ErrorMessages = new List<string> { "Sportski objekat ne postoji." }
                });
            }

            // Pronalazak termina
            var sviTermini = await _db.Termini
                .Where(t => terminIds.Contains(t.TerminId) && t.SportskiObjekatId == sportskiObjekatId)
                .ToListAsync();

            if (sviTermini.Count != terminIds.Count)
            {
                return BadRequest(new ApiResponse
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    IsSuccess = false,
                    ErrorMessages = new List<string> { "Neki termini ne postoje ili ne pripadaju ovom objektu." }
                });
            }

            // Obeležavanje termina kao zauzeti
            foreach (var termin in sviTermini)
            {
                if (termin.Status == "Slobodan")
                {
                    termin.Status = "Rezervisan";
                    termin.UserId = userId;
                }
            }
            _db.Termini.UpdateRange(sviTermini);
            await _db.SaveChangesAsync();

            // Ako korpa ne postoji - kreiramo novu
            if (korpa == null)
            {
                korpa = new Korpa { UserId = userId };
                _db.Korpe.Add(korpa);
                await _db.SaveChangesAsync();
            }

            // Pronalazimo stavku za konkretan objekat
            var stavka = korpa.StavkaKorpe.FirstOrDefault(s => s.SportskiObjekatId == sportskiObjekatId);

            if (stavka == null)
            {
                // Ako stavka ne postoji, pravim celu sa sve cenom
                double ukupnoSati = IzracunajUkupnoVremeBezPreklapanja(sviTermini);
                double cena = sportskiObjekat.CenaPoSatu * ukupnoSati * brojUcesnika;

                stavka = new StavkaKorpe
                {
                    SportskiObjekatId = sportskiObjekatId,
                    KorpaId = korpa.Id,
                    Kolicina = brojUcesnika,
                    CenaZaObjekat = cena,
                    SportskiObjekat = sportskiObjekat,
                    OdabraniTermini = sviTermini
                };

                _db.StavkeKorpe.Add(stavka);
            }
            else
            {
                // Filtriram samo nove termine koje jos nema u stavci
                var postojeciIds = stavka.OdabraniTermini.Select(t => t.TerminId).ToHashSet();
                var noviTermini = sviTermini.Where(t => !postojeciIds.Contains(t.TerminId)).ToList();

                if (noviTermini.Any())
                {
                    stavka.OdabraniTermini.AddRange(noviTermini);
                }

                // Ovde **uvek** povlacim sve termine ponovo iz baze da bi imalo sigurne podatke
                var sviTerminiZaStavku = await _db.Termini
                    .Where(t => stavka.OdabraniTermini.Select(ot => ot.TerminId).Contains(t.TerminId))
                    .ToListAsync();

                double ukupnoSati = IzracunajUkupnoVremeBezPreklapanja(sviTerminiZaStavku);
                stavka.CenaZaObjekat = sportskiObjekat.CenaPoSatu * ukupnoSati * stavka.Kolicina;

                // Azuriraj broj ucesnika ako je veci
                if (brojUcesnika > stavka.Kolicina)
                {
                    stavka.Kolicina = brojUcesnika;
                }

                _db.StavkeKorpe.Update(stavka);
            }

            await _db.SaveChangesAsync();

            return Ok(new ApiResponse { StatusCode = HttpStatusCode.OK, IsSuccess = true });
        }

        // Funkcija za racunanje ukupnog vremena bez preklapanja, uz postovanje razlicitih datuma
        private double IzracunajUkupnoVremeBezPreklapanja(List<Termin> termini)
        {
            double ukupnoSati = 0;

            foreach (var termin in termini)
            {
                var pocetak = DateTime.Parse(termin.VremePocetka);
                var kraj = DateTime.Parse(termin.VremeZavrsetka);

                ukupnoSati += (kraj - pocetak).TotalHours;
            }

            return ukupnoSati;
        }
    }
}
