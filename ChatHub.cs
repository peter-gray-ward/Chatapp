using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatApp
{
    public class ChatHub : Hub
    {
        private readonly ChatAppContext _context;
        private readonly ChatHubUserManager _users;
        public ChatHub(ChatAppContext context, ChatHubUserManager users)
        {
            _context = context;
            _users = users;
        }
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value; // Extract the user ID from the JWT token
            if (userId == null)
            {
                // If the user is not authenticated, disconnect them
                Context.Abort();
                return;
            }
            _users.AddUser(Context.ConnectionId, userId);

            await Clients.All.SendAsync("UserConnected", userId);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Remove the user from the collection when they disconnect
            _users.RemoveUser(Context.ConnectionId);

            await Clients.All.SendAsync("UserDisconnected", null);

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string roomId, string message)
        {
            var userId = _users.GetUserId(Context.ConnectionId);
            Console.WriteLine("------- " + userId);
            // save Post
            var newPost = new Post
            {
                RoomId = roomId,
                UserId = userId,
                Text = message,
                DateTime = DateTime.UtcNow
            };
            _context.Posts.Add(newPost);
            await _context.SaveChangesAsync(); // Corrected method name
            await Clients.Group(roomId).SendAsync("ReceiveMessage", userId, newPost);
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }
    }
}