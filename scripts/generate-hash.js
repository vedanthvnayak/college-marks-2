const bcrypt = require("bcryptjs")

async function generateHash() {
  const password = "admin123"
  const saltRounds = 10
  const hash = await bcrypt.hash(password, saltRounds)
  console.log("Password:", password)
  console.log("Hash:", hash)
  console.log("Hash length:", hash.length)
}

generateHash()
