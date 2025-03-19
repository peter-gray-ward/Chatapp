using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ChatApp
{
    [ApiController]
    [Route("/")]
    public class ChatAppController : ControllerBase
    {
        private readonly Regex userIdsPattern = new Regex(@"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})*$");
        private readonly TokenService _tokenService;

        public ChatAppController(TokenService tokenService)
        {
            _tokenService = tokenService;
        }

        [HttpPost]
        [Route("register-user")]
        public IActionResult RegisterUser([FromBody] User user)
        {
            if (user == null || string.IsNullOrEmpty(user.UserName) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Invalid user data.");
            }

            using (var db = new ChatAppContext())
            {
                // Check if a user with the same username already exists
                if (db.Users.Any(u => u.UserName == user.UserName))
                {
                    return Conflict("A user with the same username already exists.");
                }

                // Hash the password using BCrypt
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

                db.Users.Add(user);
                db.SaveChanges();
            }

            var token = _tokenService.GenerateToken(user);

			Response.Cookies.Append("chatapp-jwt", token, new CookieOptions
			{
				HttpOnly = true,
				Secure = true,
				SameSite = SameSiteMode.Strict
			});

            return Ok(new { user, token });
        }

		[Authorize]
        [HttpGet]
        [Route("create-chatroom")]
        public IActionResult CreateChatRoom([FromQuery] string userIds, [FromQuery] string? description)
        {
            if (string.IsNullOrEmpty(userIds) || !userIdsPattern.IsMatch(userIds))
            {
                return BadRequest("Invalid user IDs format. Expected format: 'userId1|userId2|...'");
            }
            if (userIds.Split('|').Length < 2)
            {
                return BadRequest("At least two user IDs are required to create a chat room.");
            }

            var room = new Room
            {
                Id = Guid.NewGuid().ToString(),
                UserIds = userIds,
                Description = description
            };

            using (var db = new ChatAppContext())
            {
                db.Rooms.Add(room);
                db.SaveChanges();
            }

            return Ok(room);
        }
    }
}