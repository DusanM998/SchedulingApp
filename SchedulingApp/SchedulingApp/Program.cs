using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Repository;
using SchedulingApp.Services;
using SchedulingApp.UnitOfWork;
using System.Text;

// Middleware - komponenta kroz koju prolazi svaki HTTP zahtev (i odgovor)
// Middleware je komponenta koja ucestvuje u obradi HTTP zahteva i odgovora
// Svaka middleware komponenta moze da uradi nesto pre sledece komponente (loguje, validira token, itd)
// Moze da prosledi zahtev sledecoj komponenti u lancu ili da presece i odmah vrati odgovor
// Svi zahtevi u middlware lancu prolaze kroz pipeline (lanac middleware-a)
// Pipeline funkcionise kao niz delegata koji se pozivaju jedan za drugim
// Redosled middleware-a je bitan jer se pipeline izvrsava redosledom kojim je middleware registrovan

var builder = WebApplication.CreateBuilder(args); //Kreira se WebApplicationBuilder koji omogucava konfiguraciju aplikacije
//args su argumenti komandne linije koji se mogu proslediti aplikaciji tokom pokretanja

// Add services to the container.
//Registruju se servisi koje aplikacija koristi
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.AddSingleton<CloudinaryService>(); //Omogucava da CloudinaryService ima jednu instancu za celu aplikaciju
                                                    //(Singleton) - kazem DI containeru da cuva samo jednu instancu CloudinaryService
                                                    //tokom celog zivotnog ciklusa aplikacije

var connectionString = builder.Configuration.GetConnectionString("DefaultDbConnection");
builder.Services.AddDbContext<ApplicationDbContexts>(options =>
{
    options.UseSqlServer(connectionString);
});

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();   // registracija UnitOfWork kao Scoped (jedna instanca po HTTP Requestu)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>)); // registracija generickog repozitorijuma

builder.Services.AddIdentity<ApplicationUser, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContexts>();

var key = builder.Configuration.GetValue<string>("ApiSettings:Secret");

// JWT konfiguracija
// Mora biti pre UseAuthorization jer je bitno znati ko je korisnik pre nego sto se provere prava pristupa
// Konfigurise Autentifikaciju i autorizaciju za celu aplikaciju
builder.Services.AddAuthentication(u => // Registruje se autentifikacija u DI context
{
    u.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Postavlja se default scheme za autentifikaciju na JWT Bearer
    u.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme; // Postavlja se default scheme za izazivanje autentifikacije na JWT Bearer
}).AddJwtBearer(u => // Dodaje JWT Bearer u middleware pipeline za autentifikaciju
{
    u.RequireHttpsMetadata = false; 
    u.SaveToken = true;
    u.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // Dozvoljava samo http://localhost:3000
            policy.WithOrigins("http://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .WithExposedHeaders("X-Pagination")
                .AllowCredentials();
        });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddHostedService<TerminStatusUpdateService>(); // Registruje se HostedService za UpdateStatusTermina

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    //Registruje JWT Bearer Security Scheme u Swagger/OpenAPI dokumentu i dodaje globalni security requirements
    // Da bi se u Swaggeru pojavio Authorize i kada unesem Bearer <token> Swagger ce automatski dodavati header
    // Authorization: Bearer <token> kod poziva iz UI-a
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Description =
            "JWT Authorization header using the Bearer scheme. \r\n\r\n" +
            "Enter 'Bearer' [space] and then your token in the text input below. \r\n\r\n" +
            "Example: \"Bearer 1234abcdef\"",
        Name = "Authorization", // Ime Headera
        In = ParameterLocation.Header, // gde ce se slati header
        Scheme = JwtBearerDefaults.AuthenticationScheme
    });
    // Globalni SecurityRequirement koji referencira definisani Scheme
    options.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

//Ovde se sklapa pipeline (redosled izvrsenja komponenti)
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); //Ako zahtev dodje preko HTTP-a, a vraca 307 na isti URL ali https
                           // tu pipeline staje na taj zahtev, a ako je vec https, samo se
                           //prosledjuje dalje

app.UseCors("AllowFrontend"); //CORS omogucava stranici da zahteva resurse sa drugih domena
                              //od servera izvan njihovog sopstvenog domena

app.UseAuthentication(); // Prvo se proveri identitet pa se tek onda...

app.UseAuthorization();  // Proverava prava pristupa na osnovu role/claim-ova
                        //omogucava da koristim [Authorize] atribute za specificne metode
                        //bez validnog korisnika -> 401, sa korisnikom bez prava -> 403

app.MapControllers(); //Registruje endpoint routing za kontrolere

app.Run();
