import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import type { respostaPadraoMsg } from '../types/respostaPadraoMsg';

export const conectarMongoDB = (handler : NextApiHandler) =>
async (req: NextApiRequest, res: NextApiResponse<respostaPadraoMsg>) => {
    
     // verificar se o banco ja esta conectado, se estiver seguir para o proximo middleware/endpoint
     if (mongoose.connections[0].readyState)
        return handler(req, res);

        //já que não está conectado, vamos conectar
        //obter a variavel de ambiente preenchida do env
        const {DB_CONEXAO_STRING} = process.env;

        //caso a env esteja vazia aborta o uso do sistema e avisa o dev
        if(!DB_CONEXAO_STRING) {
            return res.status(500).json({ erro : 'ENV de configuração do banco não informado'});
        }

       mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
       mongoose.connection.on('error', error => console.log(`ocorreu erro ao conectar no DB: ${error}`));
       await mongoose.connect(DB_CONEXAO_STRING);
       
       // Agora posso seguir para o endpoint pois estou conectado no DB  
       return handler(req, res);

    
}