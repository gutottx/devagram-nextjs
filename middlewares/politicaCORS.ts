import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { respostaPadraoMsg } from "../types/respostaPadraoMsg";
import NextCors from "nextjs-cors";

export const politicaCORS =  (handler : NextApiHandler) =>
    async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
    try{

        await NextCors(req, res,{
            origin : '*',
            methods : ['GET', 'POST', 'PUT'],
            optionsSuccessStatus: 200  // navegadores antigos dao problema ao retornar 204   
        });

    }catch(e){
        console.log('Erro ao tratar a politica de CORS:', e);
        res.status(500).json({erro : 'Ocorreu um erro ao tratar a politica de CORS'});
    }
}