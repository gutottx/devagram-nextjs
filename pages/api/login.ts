import type {NextApiRequest, NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import type { respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import type {loginResposta} from '../../types/loginResposta';
import md5 from 'md5';
import { UsuarioModel } from '../../Models/UsuarioModel';
import jwt from 'jsonwebtoken'; 
import { politicaCORS } from '../../middlewares/politicaCORS';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<respostaPadraoMsg | loginResposta>
) => {

    const {MINHA_CHAVE_JWT} = process.env;
    if(!MINHA_CHAVE_JWT) {
        return res.status(500).json({erro : 'ENV JWT não informada'});  
    }

    
    if(req.method ==='POST') {
        const {login, senha} = req.body;
    
        const usuariosEncontrados = await UsuarioModel.find({email : login, senha : md5(senha)})        
        if (usuariosEncontrados && usuariosEncontrados.length > 0){
                const usuarioEncontrado = usuariosEncontrados[0];

                const token = jwt.sign({_id : usuarioEncontrado._id}, MINHA_CHAVE_JWT);

                return res.status(200).json({
                    nome : usuarioEncontrado.nome, 
                    email : usuarioEncontrado.email, 
                    token});
            }
            return res.status(400).json ({erro : 'usuario ou senha nao encontrados'});  
        
    } return res.status(405).json ({erro : 'metodo informado não é valido'});
}

export default politicaCORS(conectarMongoDB(endpointLogin));