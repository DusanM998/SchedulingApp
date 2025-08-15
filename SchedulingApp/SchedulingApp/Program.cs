using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SchedulingApp.DbContexts;
using SchedulingApp.Models;
using SchedulingApp.Services;
using System.Text;

//Middleware - komponenta kroz koju prolazi svaki HTTP zahtev (i odgovor)
//Svaka middleware komponenta moze da uradi nesto pre sledece komponente (loguje, validira token, itd)
// Moze da prosledi zahtev sledecoj komponenti u lancu ili da presece i odmah vrati odgovor

var builder = WebApplication.CreateBuilder(args); //Kreira se WebApplicationBuilder koji omogucava konfiguraciju aplikacije
//args su argumenti komandne linije koji se mogu proslediti aplikaciji tokom pokretanja

// Add services to the container.
//Registruju se servisi koje aplikacija koristi
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.AddSingleton<CloudinaryService>(); //Omogucava da CloudinaryService ima jednu instancu za celu aplikaciju (Singleton)

var connectionString = builder.Configuration.GetConnectionString("DefaultDbConnection");
builder.Services.AddDbContext<ApplicationDbContexts>(options =>
{
    options.UseSqlServer(connectionString);
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContexts>();

var key = builder.Configuration.GetValue<string>("ApiSettings:Secret");

builder.Services.AddAuthentication(u =>
{
    u.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    u.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(u =>
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

builder.Services.AddHostedService<TerminStatusUpdateService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Description =
            "JWT Authorization header using the Bearer scheme. \r\n\r\n" +
            "Enter 'Bearer' [space] and then your token in the text input below. \r\n\r\n" +
            "Example: \"Bearer 1234abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Scheme = JwtBearerDefaults.AuthenticationScheme
    });
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

app.UseAuthentication(); //Prvo se proveri identitet pa se tek onda...

app.UseAuthorization(); //...proveravaju pravila pristupa (redosled pipeline-a je bitan!)
                        //omogucava da koristim [Authorize] atribute za specificne metode
                        //bez validnog korisnika -> 401, sa korisnikom bez prava -> 403

app.MapControllers(); //Registruje endpoint routing za kontrolere

app.Run();
