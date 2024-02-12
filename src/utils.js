import { unlink } from 'fs/promises'
import client from './redisClient.js'

export async function removeFile(path){
    try{
        await unlink(path)
    } catch(e){
        console.log('Error while removing file', e.message)
    }
}
export async function getUserData(userId) {
    return new Promise((resolve, reject) => {  
        client.get(userId, (err, userData) => {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}
