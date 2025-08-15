using System.Net;

namespace SchedulingApp.Models
{
    //Koristim ApiResponse da standartizujem izgled response-a
    //Tada klijent uvek zna sta da ocekuje u JSON odgovoru
    public class ApiResponse
    {
        public ApiResponse()
        {
            ErrorMessages = new List<string>();
        }

        public HttpStatusCode StatusCode { get; set; }
        public bool IsSuccess { get; set; } = true;
        public List<string> ErrorMessages { get; set; }
        public object Result { get; set; }
    }
}
