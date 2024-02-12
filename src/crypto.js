import crypto from 'crypto'

export async function createHashValue(identifier){
    const hash = crypto.createHash('sha-256')
    hash.update(identifier)
    const hashIdentifier =  hash.digest('hex')
    return hashIdentifier
}