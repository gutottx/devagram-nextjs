import type {NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import nc from "next-connect";
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {publicacaoModel} from '../../Models/publicacaoModel';
import {UsuarioModel} from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : any, res : NextApiResponse<respostaPadraoMsg>)=> { 
        
        try{

            const {userId} = req.query;
            const usuario = await UsuarioModel.findById (userId);
            if(!usuario){
               return res.status(400).json({erro : 'usuario nao encontrado'})

            }

            if(!req || !req.body) {
               return res.status(400).json({erro : 'parametros de entrada nao informados'})
            }
            const {descricao} = req?.body;
         
            if(!descricao || descricao.length<2) {
            }
            
            if(!req.file || !req.file.originalname) {
               return res.status(400).json({erro : 'imagem e obrigatoria'})
            }
   
            const image = await uploadImagemCosmic(req);
            const publicacao = {
                idUsuario : usuario._id,
                descricao,
                foto : image.media.url,
                data : new Date()

            }

            usuario.publicacoes++;
            await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);

            await publicacaoModel.create(publicacao);

            return res.status(200).json({msg : 'publicacao criada com sucesso'})

        }catch(e) {
            return res.status(400).json({erro : 'erro ao cadastrar'})

        }

}); 

export const config = {
    api : {
            bodyParser : false
    }   
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler))); 