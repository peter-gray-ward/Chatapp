using Npgsql;
using System.Data;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
        public string ProfileThumbnailBase64 { get; set; } = string.Empty;
    }

    public class Post
    {
        [Key]
        public int PostNumber { get; set; }
        public DateTime DateTime { get; set; }
        public string UserName { get; set; }
        public string RoomId { get; set; }
        public string? Text { get; set; }
    }

    public class Room
    {
        [Key]
        public string Id { get; set; }
        public string UserIds { get; set; }
        public string? Description { get; set; }
    }
}