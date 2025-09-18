using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Models.Dto;
using SchedulingApp.Services;
using SchedulingApp.Utility;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace SchedulingApp.Controllers
{
    [Route("api/auth")] //Svi endpoint - ovi u kontroleru pocinju sa ovim
    [ApiController]
    // Controller - rukuje HTTP zahtevima i vraca odgovore. Ovaj kontroler usmerava zahteve ka logici koja
    // vrsi registraciju, prijavljivanje, a potom i autentifikaciju korisnika
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly CloudinaryService _cloudinaryService;
        private string secretKey;

        // Primer DI(Dependency Injection): tehnike dizajna koja omogucava objektima da dobiju svoje zavisnosti(druge objekte)
        // od spoljnog izvora umesto da ih sami kreiraju. Ovde su zavisnosti definisane kao parametri konstruktora
        // Postoji: Constructor, Property, Method i Interface injection
        public AuthController(ApplicationDbContexts db, IConfiguration configuration,
            UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, CloudinaryService cloudinaryService)
        {
            _db = db;
            secretKey = configuration.GetValue<string>("ApiSettings:Secret");
            _response = new ApiResponse();
            _userManager = userManager;
            _roleManager = roleManager;
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("register")]
        // IActionResult interfejs predstavlja bilo koji validan HTTP odgovor
        // Kada metoda vraca IActionResult moze da vrati odgovor tipa Ok(), BadRequest(), NotFound()...
        // IActionResult koristim kada metoda moze da vrati bilo sta (npr. JSON, file, plain text...)
        public async Task<IActionResult> Register([FromForm] RegisterRequestDTO register)
        {
            // Proveravam da li je prosledjen fajl (slika) u zahtevu
            if (register.File == null || register.File.Length == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest();
            }

            // Upload slike na Cloudinary i dobijanje URL-a
            string imageUrl = await _cloudinaryService.UploadImageAsync(register.File);
            if (string.IsNullOrEmpty(imageUrl))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Neuspešan upload slike!");
                return BadRequest(_response);
            }

            // Proveravam da li korisnicko ime vec postoji u bazi
            ApplicationUser userFromDb = _db.ApplicationUsers
                .FirstOrDefault(u => u.UserName.ToLower() == register.UserName.ToLower());

            if(userFromDb != null)
            {
                _response.StatusCode = System.Net.HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnicko ime vec postoji!");
                return BadRequest(_response);
            }

            // Kreiram novog korisnika
            ApplicationUser newUser = new()
            {
                UserName = register.UserName,
                Email = register.UserName,
                NormalizedEmail = register.UserName.ToUpper(),
                Name = register.Name,
                Image = imageUrl,
                PhoneNumber = register.PhoneNumber,
                RefreshToken = null,
            };

            try
            {
                // Kreiram korisnika u bazi koristeci UserManager iz Identity (koji automatski hash-uje sifru)
                var result = await _userManager.CreateAsync(newUser, register.Password); //Koristim Identity da registrujem hashovanu sifru

                if (result.Succeeded)
                {
                    // Proveravam da li role vec postoje, ako ne kreiram ih
                    if (!_roleManager.RoleExistsAsync(SD.Role_Admin).GetAwaiter().GetResult())
                    {
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Admin));
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Customer));
                    }

                    // Dodeljujem rolu korisniku (Admin ili Customer) (na osnovu unosa iz zahteva)
                    if (register.Role.ToLower() == SD.Role_Admin)
                    {
                        await _userManager.AddToRoleAsync(newUser, SD.Role_Admin);
                    }
                    else
                    {
                        await _userManager.AddToRoleAsync(newUser, SD.Role_Customer);
                    }

                    _response.StatusCode = HttpStatusCode.OK;
                    _response.IsSuccess = true;
                    _response.Result = newUser;
                    return Ok(_response);
                }
                else
                {
                    // Ako kreiranje korisnika nije uspelo, vracam greske
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.AddRange(result.Errors.Select(e => e.Description));
                    return BadRequest(_response);
                }
            }
            catch(Exception ex) 
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Došlo je do greške prilikom registracije: " + ex.Message);
                return StatusCode(500, _response);
            }
        }

        // Dodaj helper za generisanje refresh tokena
        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        // Prijava korisnika (autentifikacija)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO login)
        {
            try
            {
                // Validacija input parametara
                if (login == null || string.IsNullOrWhiteSpace(login.UserName) || string.IsNullOrWhiteSpace(login.Password))
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime i šifra su obavezni!");
                    return BadRequest(_response);
                }
                // Provera da li korisnik postoji u bazi
                ApplicationUser userFromDb = _db.ApplicationUsers
                    .FirstOrDefault(u => u.UserName.ToLower() == login.UserName.ToLower());

                if (userFromDb == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime ili šifra su netačni!");
                    return BadRequest(_response);
                }

                // Provera da li je sifra tacna (koristim UserManager iz Identity)
                bool isValid = await _userManager.CheckPasswordAsync(userFromDb, login.Password); //Identity proverava hash sifre
                if (!isValid)
                {
                    _response.Result = new LoginResponseDTO();
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime ili sifra su netacni!");
                    return BadRequest(_response);
                }

                // Autorizacija korisnika (na osnovu role) i generisanje JWT tokena
                var roles = await _userManager.GetRolesAsync(userFromDb);

                //Ako je password tacan generise se JWT token
                JwtSecurityTokenHandler tokenHandler = new(); // Kreira se handler koji sastavlja i serijalizuje JWT
                byte[] key = Encoding.ASCII.GetBytes(secretKey); // Pretvara secretKey (iz appsetting.json) u bajtove koji se koriste za potpis i verifikaciju

                SecurityTokenDescriptor tokenDescriptor = new()
                {
                    // Sastavljam Claims koji ce biti u payloadu tokena
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new Claim("name", userFromDb.Name),
                    new Claim("id", userFromDb.Id.ToString()),
                    new Claim(ClaimTypes.Email, userFromDb.UserName.ToString()),
                    new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                    new Claim("phoneNumber", userFromDb.PhoneNumber ?? "")
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };

                SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
                string jwtToken = tokenHandler.WriteToken(token); // 

                /*
                var cookieOptions = new CookieOptions
                {   Postavljanje JWT tokena u HttpOnly cookie
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddHours(1)
                };
                Response.Cookies.Append("jwt", jwtToken, cookieOptions);*/

                // Generise refresh token
                var refreshToken = GenerateRefreshToken();
                userFromDb.RefreshToken = refreshToken;
                userFromDb.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1); // npr. 1 dan vazenja
                await _db.SaveChangesAsync();

                // Kreiranje odgovora sa email-om i tokenom za korisnika
                LoginResponseDTO loginResponse = new()
                {
                    Email = userFromDb.Email,
                    Token = jwtToken,
                    RefreshToken = refreshToken
                };

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = loginResponse;
                return Ok(_response);
            }
            catch(Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Došlo je do greške prilikom prijave: " + ex.Message);
                return StatusCode(500, _response);
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new { message = "Logout successful!" });
        }

        [HttpGet("{id}", Name = "GetUserDetails")]
        public async Task<IActionResult> GetUserDetails(string id)
        {
            if(id == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            ApplicationUser userFromDb = _db.ApplicationUsers.FirstOrDefault(u => u.Id == id);

            if(userFromDb == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound; 
                _response.IsSuccess = false;
                //_response.ErrorMessages.Add("Korisnik ne postoji!");
                return NotFound(_response);
            }

            // Dohvatanje role korisnika
            var roles = await _userManager.GetRolesAsync(userFromDb);
            var role = roles.FirstOrDefault(); // Ako ima samo jednu rolu

            // Vracamo custom objekat sa rolom
            _response.Result = new
            {
                userFromDb.Id,
                userFromDb.UserName,
                userFromDb.Name,
                userFromDb.Email,
                userFromDb.PhoneNumber,
                userFromDb.Image,
                Role = role
            };

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            return Ok(_response);
        }

        [HttpGet("currentUser")]
        public async Task<IActionResult> GetCurrentUser()
        {
            string userId = User.FindFirst("id")?.Value;
            if(string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Korisnik nije prijavljen!" });
            }

            return await GetUserDetails(userId);
        }

        [HttpPut("{id}")]
        //ActionResult<T> je genericka verzija koja vraca HTTP odgovor koji sadrzi ApiResponse u telu odgovora
        public async Task<ActionResult<ApiResponse>> UpdateUserDetails(string id, [FromForm] UserDetailsUpdateDTO userDetailsUpdateDTO)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    if(userDetailsUpdateDTO == null || id != userDetailsUpdateDTO.Id)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                        return BadRequest(_response);
                    }

                    ApplicationUser user = await _db.ApplicationUsers.FindAsync(id);

                    if(user == null)
                    {
                        _response.StatusCode = HttpStatusCode.NotFound;
                        _response.IsSuccess = false;
                        _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                        return NotFound(_response);
                    }

                    user.UserName = userDetailsUpdateDTO.UserName;
                    user.Name = userDetailsUpdateDTO.Name;
                    user.Email = userDetailsUpdateDTO.UserName;
                    user.NormalizedEmail = userDetailsUpdateDTO.UserName.ToUpper();
                    user.NormalizedUserName = userDetailsUpdateDTO.UserName.ToUpper();
                    user.PhoneNumber = userDetailsUpdateDTO.PhoneNumber;

                    //Azuriranje lozinke samo ako je poslata nova
                    if(!string.IsNullOrWhiteSpace(userDetailsUpdateDTO.Password))
                    {
                        var passwordHasher = new PasswordHasher<ApplicationUser>();
                        user.PasswordHash = passwordHasher.HashPassword(user, userDetailsUpdateDTO.Password);
                    }
                    //Upload nove slike ako postoji
                    if (userDetailsUpdateDTO.File != null && userDetailsUpdateDTO.File.Length > 0)
                    {
                        //Ako se salje nova slika prvo se brisa stara
                        if (!string.IsNullOrEmpty(user.Image))
                        {
                            try
                            {
                                await _cloudinaryService.DeleteImageAsync(user.Image);
                            }
                            catch (Exception ex)
                            {
                                _response.StatusCode = HttpStatusCode.InternalServerError;
                                _response.IsSuccess = false;
                                _response.ErrorMessages.Add($"Greška prilikom brisanja stare slike: {ex.Message}");
                                return StatusCode(500, _response);
                            }
                        }
                        //Upload nove slike
                        try
                        {
                            string imageUrl = await _cloudinaryService.UploadImageAsync(userDetailsUpdateDTO.File);
                            user.Image = imageUrl;
                        }
                        catch (Exception ex)
                        {
                            _response.StatusCode = HttpStatusCode.InternalServerError;
                            _response.IsSuccess = false;
                            _response.ErrorMessages.Add($"Greška prilikom upload-a slike: {ex.Message}");
                            return StatusCode(500, _response);
                        }
                    }


                    _db.ApplicationUsers.Update(user);
                    await _db.SaveChangesAsync();
                    _response.StatusCode = HttpStatusCode.NoContent;
                    _response.IsSuccess = true;
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

        [HttpPost("verify-password")]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordDTO verifyPasswordDTO)
        {
            ApplicationUser userFromDb = _db.ApplicationUsers.FirstOrDefault(u => u.Id == verifyPasswordDTO.Id);
            if(userFromDb == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                return BadRequest(_response);
            }

            var passwordHasher = new PasswordHasher<ApplicationUser>();
            var result = passwordHasher.VerifyHashedPassword(userFromDb, userFromDb.PasswordHash, verifyPasswordDTO.Password);

            if(result == PasswordVerificationResult.Failed)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Neispravna lozinka!");
                return BadRequest(_response);
            }

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = userFromDb;
            return Ok(_response);
        }

        // Endpoint za osvežavanje tokena
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var user = _db.ApplicationUsers.FirstOrDefault(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Neispravan ili istekao refresh token." });
            }

            // Generiši novi JWT token (kao u loginu)
            var roles = await _userManager.GetRolesAsync(user);
            JwtSecurityTokenHandler tokenHandler = new();
            byte[] key = Encoding.ASCII.GetBytes(secretKey);

            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("name", user.Name),
                    new Claim("id", user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.UserName.ToString()),
                    new Claim(ClaimTypes.Role, roles.FirstOrDefault() ?? ""),
                    new Claim("phoneNumber", user.PhoneNumber ?? "")
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
            string newJwtToken = tokenHandler.WriteToken(token);

            var newRefreshToken = GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                token = newJwtToken,
                refreshToken = newRefreshToken
            });
        }
    }
}
