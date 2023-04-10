import type {NextApiRequest, NextApiResponse} from "next";
import type {respostaPadraoMsg} from "../../types/respostaPadraoMsg"; 
import { validarTokenJWT } from '../../middlewares/validarTokenJWT'
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from "../../Models/UsuarioModel";
import { publicacaoModel } from "../../Models/publicacaoModel";
import { seguidorModel } from "../../Models/seguidorModel";
import publicacao from "./publicacao";
import usuario from "./usuario";
import { politicaCORS } from "../../middlewares/politicaCORS";

const feedEndpoint = async (req : NextApiRequest, res: NextApiResponse<respostaPadraoMsg | any>) => {
    try{
        if (req.method === 'GET') {
            if(req?.query?.id){
             const usuario = await UsuarioModel.findById(req?.query?.id);
             if(!usuario) {
        return res.status(400).json({erro : 'usuario nao encontrado'});

             }
             const publicacoes = await publicacaoModel
             .find({idUsuario : usuario._id})
             .sort({data : -1});
           
 
            return res.status(200).json(publicacoes);
        } else{
            const {userId} = req?.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado) {
                return res.status(400).json({erro : 'usuario nao encontrado'})
            }

            const seguidores = await seguidorModel.find({usuarioId : usuarioLogado._id});
            const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

            const publicacoes = await publicacaoModel.find({
                $or : [
                    {idUsuario : usuarioLogado._id},
                    {idUsuario : seguidoresIds}
                ]
            })
            .sort({data : -1});

            const result = [];
            for (const publicacao of publicacoes) {
               const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
               if(usuarioDaPublicacao){
                    const final = {...publicacao._doc, usuario : {
                        nome : usuarioDaPublicacao.nome,
                        avatar : usuarioDaPublicacao.avatar
                    }};
                    result.push(final);  
               }
            }

            return res.status(200).json(result); 
        }
     }
        return res.status(405).json({erro : 'metodo informado nao e valido'});   

    }catch(e) {
        console.log(e);
        
    }
    return res.status(400).json({erro : 'nao foi possivel obter o feed'});
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));