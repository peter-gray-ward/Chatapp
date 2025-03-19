using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text.RegularExpressions;
using System.IdentityModel.Tokens.Jwt;

namespace ChatApp
{
    [ApiController]
    [Route("/")]
    public class ChatAppController : ControllerBase
    {
        private readonly Regex userIdsPattern = new Regex(@"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})*$");
        private readonly TokenService _tokenService;
        private readonly ChatAppContext _context;
        private readonly ChatHubUserManager _users;

        public ChatAppController(TokenService tokenService, ChatAppContext context, ChatHubUserManager users)
        {
            _tokenService = tokenService;
            _context = context;
            _users = users;
        }

        [HttpPost]
        [Route("register-user")]
        public IActionResult RegisterUser([FromBody] User user)
        {
            if (user == null || string.IsNullOrEmpty(user.UserName) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Invalid user data.");
            }

            // Check if a user with the same username already exists
            if (_context.Users.Any(u => u.UserName == user.UserName))
            {
                return Conflict("A user with the same username already exists.");
            }

            // Hash the password using BCrypt
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            _context.SaveChanges();

            var token = _tokenService.GenerateToken(user);

            Response.Cookies.Append("chatapp-jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });

            return Ok(new { user, token });
        }

        [HttpPost]
        [Route("login-user")]
        public IActionResult LoginUser([FromBody] User user)
        {
            if (user == null || string.IsNullOrEmpty(user.UserName) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Invalid login data.");
            }

            var existingUser = _context.Users.SingleOrDefault(u => u.UserName == user.UserName);
            if (existingUser == null || !BCrypt.Net.BCrypt.Verify(user.Password, existingUser.Password))
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = _tokenService.GenerateToken(existingUser);
            Response.Cookies.Append("chatapp-jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax
            });
            return Ok(new { user = existingUser, token });
        }

        [Authorize]
        [HttpGet]
        [Route("get-user")]
        public IActionResult GetUser()
        {
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
            }   
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            Console.WriteLine($"Extracted userId from claims: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User not authenticated.");
                return Unauthorized("User not authenticated.");
            }

            var user = _context.Users.SingleOrDefault(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                Console.WriteLine("User not found.");
                return NotFound("User not found.");
            }
            return Ok(user);
        }
        
        [Authorize]
        [HttpGet]
        [Route("get-logged-in-users")]
        public IActionResult GetLoggedInUsers()
        {
            var loggedInUsers = _users.GetLoggedInUsers();
            if (loggedInUsers == null || !loggedInUsers.Any())
            {
                return NotFound("No logged-in users found.");
            }

            var userIds = loggedInUsers.Values.Distinct().ToList();
            User[] users  = _context.Users.Where(u => userIds.Contains(u.Id.ToString())).ToArray();
            if (users == null || !users.Any())
            {
                return NotFound("No users found for the logged-in user IDs.");
            }

            return Ok(users);
        }

        [Authorize]
        [HttpGet]
        [Route("go-to-chatroom")]
        public IActionResult GoToChatRoom([FromQuery] string userIds)
        {
            if (string.IsNullOrEmpty(userIds) || !userIdsPattern.IsMatch(userIds))
            {
                return BadRequest("Invalid user IDs format. Expected format: 'userId1|userId2|...'");
            }
            if (userIds.Split('|').Length < 2)
            {
                return BadRequest("At least two user IDs are required to create a chat room.");
            }

            userIds = string.Join("|", userIds.Split("|")
                .OrderBy(id => id)
                .ToArray());

            var existingRoom = _context.Rooms
                .FirstOrDefault(r => r.UserIds == userIds);

            if (existingRoom != null)
            {
                List<Post> posts = _context.Posts
                    .Where(p => p.RoomId == existingRoom.Id)
                    .OrderByDescending(p => p.DateTime)
                    .ToList();
                existingRoom.Posts = posts;
                return Ok(existingRoom);
            }

            var room = new Room
            {
                Id = Guid.NewGuid().ToString(),
                UserIds = userIds
            };

            _context.Rooms.Add(room);
            _context.SaveChanges();

            return Ok(room);
        }
    }
}