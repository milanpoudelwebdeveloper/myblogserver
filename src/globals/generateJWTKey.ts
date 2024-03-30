import jwt from 'jsonwebtoken'
export const generateJWTKey = (id: number | string, role?: string) => {
  const payload = {
    id,
    role
  }
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d'
  })
}
