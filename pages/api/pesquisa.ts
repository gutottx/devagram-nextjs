import type {NextApiRequest, NextApiResponse} from "next";
import type {respostaPadraoMsg} from "../../types/respostaPadraoMsg";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { UsuarioModel } from "../../Models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const pesquisaEndpoint 
    = async (req: NextApiRequest, res : NextApiResponse<respostaPadraoMsg| any[]> ) => {
    
        try{
            if(req.method === 'GET'){

                if(req?.query?.id){
                    const usuariosEncontrados = await UsuarioModel.findById(req?.query?.id);
                    if(!usuariosEncontrados) {
                    return res.status(400).json({erro : 'usuario nao encontrado'});
                
                }
                usuariosEncontrados.senha = null;
                return res.status(200).json(usuariosEncontrados);
            }else{

                const {filtro} = req.query;
                if(!filtro || filtro.length < 2) {
                    return res.status(400).json({erro : 'favor informado pelo menos 2 caracteres para busca'});
                }
                
               const usuariosEncontrados = await UsuarioModel.find({
                   nome : {$regex : filtro, $options: 'i'}      
               });
               return res.status(200).json(usuariosEncontrados);
            }
        }
            return res.status(405).json({erro : 'metodo informado nao é valido'});
        }catch(e){
            console.log(e);
            return res.status(500).json({erro : 'nao foi possivel buscar usuarios'+ e});
        }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));