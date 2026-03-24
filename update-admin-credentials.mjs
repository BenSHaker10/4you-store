import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const newEmail = 'hemoooo.777.oo@gmail.com';
const newPassword = 'MOHAMMEDSHAKER6622';

async function updateAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'product_store'
  });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await connection.execute(
      'UPDATE users SET email = ?, passwordHash = ? WHERE role = "admin"',
      [newEmail, hashedPassword]
    );

    if (result.affectedRows > 0) {
      console.log('SUCCESS: Admin credentials updated successfully.');
    } else {
      console.log('ERROR: No admin user found to update.');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await connection.end();
  }
}

updateAdmin();
