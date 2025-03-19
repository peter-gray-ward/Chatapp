using Npgsql;
using System.Data;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ChatApp
{
    public class User
    {
        [Key]
        [Required]
        public Guid Id { get; set; }
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
        public string ProfileThumbnailBase64 { get; set; } = string.Empty;
    }

    public class Post
    {
        [Key]
        [Required]
        public int PostNumber { get; set; }
        public DateTime DateTime { get; set; }
        [Required]
        public string UserId { get; set; } = string.Empty;
        [Required]
        public string RoomId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    public class Room
    {
        [Key]
        [Required]
        public string Id { get; set; } = string.Empty;
        [Required]
        public string UserIds { get; set; } = string.Empty;
        // navigation property for posts
        public virtual List<Post> Posts { get; set; } = new List<Post>();
    }
    
}