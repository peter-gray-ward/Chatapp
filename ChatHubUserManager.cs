using System.Collections.Concurrent;

namespace ChatApp
{
    public class ChatHubUserManager
    {
        private readonly ConcurrentDictionary<string, string> _loggedInUsers = new ConcurrentDictionary<string, string>();

        public void AddUser(string connectionId, string userId)
        {
            _loggedInUsers.TryAdd(connectionId, userId);
        }

        public void RemoveUser(string connectionId)
        {
            _loggedInUsers.TryRemove(connectionId, out _);
        }

        public string GetUserId(string connectionId)
        {
            _loggedInUsers.TryGetValue(connectionId, out var userId);
            return userId;
        }

        public ConcurrentDictionary<string, string> GetLoggedInUsers()
        {
            return _loggedInUsers;
        }
    }
}