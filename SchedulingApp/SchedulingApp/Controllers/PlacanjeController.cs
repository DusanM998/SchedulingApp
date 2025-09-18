using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using Stripe;
using System.Net;

namespace SchedulingApp.Controllers
{
    // Controller za upravljanje placanjem
    [Route("api/placanje")]
    [ApiController]
    public class PlacanjeController : ControllerBase
    {
        protected ApiResponse _response;
        private readonly IConfiguration _configuration; // IConfiguration je DI servis koji mi pruza da citam konfiguraciju iz razlicitih izvora
        private readonly ApplicationDbContexts _db;

        public PlacanjeController(IConfiguration configuration, ApplicationDbContexts db)
        {
            _configuration = configuration;
            _db = db;
            _response = new();
        }

        // HTTP POST zahtev za iniciranje placanja
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> OmoguciPlacanje(string userId)
        {
            // Najpre dohvatamo korpu korisnika iz baze podataka
            Korpa korpa = _db.Korpe
                .Include(u => u.StavkaKorpe)
            .ThenInclude(sk => sk.SportskiObjekat)
                .Include(u => u.StavkaKorpe)
            .ThenInclude(sk => sk.OdabraniTermini)
            .FirstOrDefault(u => u.UserId == userId);

            // Ako je korpa prazna ili ne postoji, vracam BadRequest
            if (korpa == null || korpa.StavkaKorpe == null || korpa.StavkaKorpe.Count() == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            // Kreira se Payment Intent koristeci Stripe API
            #region Kreiraj Payment Intent

            // U okviru appsettings.json mi se nalazi Stripe SecretKey i pomocu IConfiguration ga citam odatle
            string stripeApiKey = _configuration["StripeSettings:SecretKey"];
            if (string.IsNullOrEmpty(stripeApiKey))
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Stripe API ključ nije pronađen u konfiguraciji.");
                return StatusCode(500, _response);
            }

            StripeConfiguration.ApiKey = stripeApiKey;

            // Racuna se ukupna cena za placanje tj. za rezervaciju
            korpa.UkupnoZaPlacanje = korpa.StavkaKorpe.Sum(u => u.CenaZaObjekat);

            try
            {
                PaymentIntentCreateOptions options = new()
                {
                    Amount = Convert.ToInt32(Math.Round(korpa.UkupnoZaPlacanje * 100)), 
                    Currency = "rsd",
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                    },
                };

                PaymentIntentService service = new();
                PaymentIntent response = service.Create(options);
                korpa.StripePaymentIntentId = response.Id;
                korpa.ClientSecret = response.ClientSecret;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add($"Greška prilikom kreiranja Stripe PaymentIntent-a: {ex.Message}");
                return StatusCode(500, _response);
            }

            #endregion

            _response.Result = korpa;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }
    }
}
