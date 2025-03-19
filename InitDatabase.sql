-- Create the User table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY,
    "UserName" VARCHAR(255) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "ProfileThumbnailBase64" TEXT
);

-- Create the Post table
CREATE TABLE IF NOT EXISTS "Posts" (
    "PostNumber" SERIAL PRIMARY KEY,
    "DateTime" TIMESTAMP NOT NULL,
    "UserId" VARCHAR(255) NOT NULL,
    "RoomId" VARCHAR(255) NOT NULL,
    "Text" TEXT
);

-- Create the Room table
CREATE TABLE IF NOT EXISTS "Rooms" (
    "Id" VARCHAR(255) PRIMARY KEY,
    "UserIds" TEXT NOT NULL,
    "Description" TEXT
);