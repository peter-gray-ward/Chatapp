using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.IO;

namespace ChatApp
{
    public class ChatAppContext : DbContext
    {
        public ChatAppContext(DbContextOptions<ChatAppContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Room> Rooms { get; set; }

        public static void RunSqlScript(string connectionString, string scriptPath)
        {
            var script = File.ReadAllText(scriptPath);

            using var connection = new NpgsqlConnection(connectionString);
            connection.Open();

            using var command = new NpgsqlCommand(script, connection);
            command.ExecuteNonQuery();
        }
    }
    
}