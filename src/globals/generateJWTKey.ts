import jwt from 'jsonwebtoken'
export const generateJWTKey = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    //expires in 2 minutes
    expiresIn: '2m'
  })
}
