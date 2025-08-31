const bcrypt = require('bcrypt');

async function generatePassword() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
    
    // Test against the current hash in database
    const currentHash = '$2b$10$E/UQJ9D8hZGjVw9rVJUdMe.ZtF4B2CxZz5ZZY5m9lGIaY3a5T6nXW';
    const isCurrentValid = await bcrypt.compare(password, currentHash);
    console.log('Current hash verification:', isCurrentValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePassword();
