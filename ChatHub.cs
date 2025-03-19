using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatApp
{
    public class ChatHub : Hub
    {
        // A thread-safe collection to store logged-in users
        private static ConcurrentDictionary<string, string> LoggedInUsers = new ConcurrentDictionary<string, string>();

        public override Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value; // Extract the user ID from the JWT token
            if (userId == null)
            {
                // If the user is not authenticated, disconnect them
                Context.Abort();
                return Task.CompletedTask;
            }
            LoggedInUsers.TryAdd(Context.ConnectionId, userId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            // Remove the user from the collection when they disconnect
            LoggedInUsers.TryRemove(Context.ConnectionId, out _);
            return base.OnDisconnectedAsync(exception);
        }

        public Task SendMessage(string user, string message)
        {
            return Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public static ConcurrentDictionary<string, string> GetLoggedInUsers()
        {
            return LoggedInUsers;
        }
    }
}