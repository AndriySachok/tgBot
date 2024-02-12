import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import fs from 'fs'
import { __dirname } from './ogg.js'


class OpenAI{ 
    constructor(key){
        const configuration = new Configuration({apiKey: key});

        this.openai = new OpenAIApi(configuration)
    }
    
    async chat(input){
        try{ 
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: input
            })
            return response.data.choices[0].message
        } catch(e){
            console.log('Error while answering request', e.message)
        }
    }

    async transcription(filepath){
        try{
            const response = await this.openai.createTranscription(fs.createReadStream(filepath), "whisper-1")
            return response.data.text
        } catch(e){
            console.log('Error while transcription', e.message)
        }
    }

}

export const openai = new OpenAI(config.get('OPENAI_KEY'))