// Prints a random value for SESSION_SECRET
import crypto from 'node:crypto'

console.log(crypto.randomBytes(32).toString('base64url'))
