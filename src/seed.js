/* eslint-disable no-undef */
import db from './db/index.js'

import dotenv from 'dotenv'

dotenv.config()

export const createFirstSuperAdmin = async () => {
  try {
    const user = await db.query('SELECT * FROM users WHERE email=$1 AND role=$2', ['milanwebdeveloper1@gmail.com', 'superadmin'])
    if (user.rows.length > 0) {
      console.log('Super admin already exists')
      return
    } else {
      const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)'
      const createdUser = await db.query(query, ['Milan Poudel', 'milanwebdeveloper1@gmail.com', 'superadmin', 'superadmin'])
      if (createdUser) {
        console.log('Super admin created successfully')
      }
    }
  } catch (error) {
    console.log('Error in creating first super admin', error)
  }
}

createFirstSuperAdmin()
