/* eslint-disable no-undef */
import db from './db/index.js'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()

export const createFirstSuperAdmin = async () => {
  try {
    const user = await db.query('SELECT * FROM users WHERE email=$1 AND role=$2', ['milanwebdeveloper1@gmail.com', 'superadmin'])
    if (user.rows.length > 0) {
      console.log('Super admin already exists')
      return
    } else {
      const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)'
      const salt = await bcrypt.genSalt(10)
      const password = process.env.SUPER_ADMIN_PASSWORD
      const hashedPassword = bcrypt.hashSync(password, salt)
      const createdUser = await db.query(query, ['Milan Poudel', 'milanwebdeveloper1@gmail.com', hashedPassword, 'superadmin'])
      if (createdUser) {
        console.log('Super admin created successfully')
      }
    }
  } catch (error) {
    console.log('Error in creating first super admin', error)
  }
}

createFirstSuperAdmin()
