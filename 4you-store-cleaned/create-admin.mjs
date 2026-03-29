import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

async function createAdmin() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected. Creating admin user...");
  
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);
  
  await conn.execute(
    "INSERT IGNORE INTO users (openId, name, email, passwordHash, loginMethod, role, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["admin_owner", "Admin", "admin@example.com", adminHash, "email", "admin", 1]
  );
  console.log("Admin user created.");
  
  await conn.execute(
    "INSERT IGNORE INTO users (openId, name, email, passwordHash, loginMethod, role, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["local_user1", "User", "user@example.com", userHash, "email", "user", 1]
  );
  console.log("Regular user created.");
  
  await conn.end();
  console.log("Done!");
}
createAdmin().catch(console.error);
