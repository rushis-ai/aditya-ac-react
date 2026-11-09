// Usage: npm run hash-password -- "the password"
// Prints the value to put next to the username in PORTAL_USERS.
import { hashPassword } from '../api/_lib/session.js'

const pw = process.argv[2]
if (!pw || pw.length < 10) {
  console.error('Give a password of at least 10 characters: npm run hash-password -- "the password"')
  process.exit(1)
}
console.log(hashPassword(pw))
