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
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContexts _db;
        private ApiResponse _response;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly CloudinaryService _cloudinaryService;
        private string secretKey;

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
        public async Task<IActionResult> Register([FromForm] RegisterRequestDTO register)
        {
            if (register.File == null || register.File.Length == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest();
            }

            string imageUrl = await _cloudinaryService.UploadImageAsync(register.File);

            ApplicationUser userFromDb = _db.ApplicationUsers.FirstOrDefault(u => u.UserName.ToLower() == register.UserName.ToLower());

            if(userFromDb != null)
            {
                _response.StatusCode = System.Net.HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnicno ime vec postoji!");
                return BadRequest(_response);
            }

            ApplicationUser newUser = new()
            {
                UserName = register.UserName,
                Email = register.UserName,
                NormalizedEmail = register.UserName.ToUpper(),
                Name = register.Name,
                Image = imageUrl
            };

            try
            {
                var result = await _userManager.CreateAsync(newUser, register.Password);

                if(result.Succeeded)
                {
                    if (!_roleManager.RoleExistsAsync(SD.Role_Admin).GetAwaiter().GetResult())
                    {
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Admin));
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Customer));
                    }

                    if(register.Role.ToLower() == SD.Role_Admin)
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
            }
            catch(Exception) 
            {
                
            }

            _response.StatusCode = HttpStatusCode.BadRequest;
            _response.IsSuccess = false;
            _response.ErrorMessages.Add("Neuspesna registracija!");
            return BadRequest(_response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO login)
        {
            ApplicationUser userFromDb = _db.ApplicationUsers
                .FirstOrDefault(u => u.UserName.ToLower() == login.UserName.ToLower());

            bool isValid = await _userManager.CheckPasswordAsync(userFromDb, login.Password);

            if(isValid == false)
            {
                _response.Result = new LoginResponseDTO();
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnicno ime ili sifra su netacni!");
                return BadRequest(_response);
            }

            var roles = await _userManager.GetRolesAsync(userFromDb);
            JwtSecurityTokenHandler tokenHandler = new();
            byte[] key = Encoding.ASCII.GetBytes(secretKey);

            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("name", userFromDb.Name),
                    new Claim("id", userFromDb.Id.ToString()),
                    new Claim(ClaimTypes.Email, userFromDb.UserName.ToString()),
                    new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
            string jwtToken = tokenHandler.WriteToken(token);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1)
            };

            Response.Cookies.Append("jwt", jwtToken, cookieOptions);

            LoginResponseDTO loginResponse = new()
            {
                Email = userFromDb.Email,
                Token = tokenHandler.WriteToken(token)
            };

            if(loginResponse.Email == null || string.IsNullOrEmpty(loginResponse.Token))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnicno ime ili sifra su netacni!");
                return BadRequest(_response);
            }

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = loginResponse;
            return Ok(_response);
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
            _response.Result = userFromDb;
            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            return Ok(_response);
        }

        [HttpPut("{id}")]
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
                        return NotFound(_response);
                    }

                    user.UserName = userDetailsUpdateDTO.UserName;
                    user.Name = userDetailsUpdateDTO.Name;
                    user.Email = userDetailsUpdateDTO.UserName;
                    user.NormalizedEmail = userDetailsUpdateDTO.UserName.ToUpper();
                    user.NormalizedUserName = userDetailsUpdateDTO.UserName.ToUpper();
                    var passwordHasher = new PasswordHasher<ApplicationUser>();
                    user.PasswordHash = passwordHasher.HashPassword(user, userDetailsUpdateDTO.Password);

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

                    //Upload nove slike ako postoji
                    if (userDetailsUpdateDTO.File != null && userDetailsUpdateDTO.File.Length > 0)
                    {
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
                    _db.SaveChanges();
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
    }
}
