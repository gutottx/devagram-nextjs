import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import type {cadastroRequisicao} from '../../types/cadastroRequisicao';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB'
import {UsuarioModel} from '../../Models/UsuarioModel'
import md5 from 'md5';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from "next-connect";
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
           
            const usuario = req.body as cadastroRequisicao;

            if(!usuario.nome || usuario.nome.length < 2) {
                return res.status(400).json({erro : 'nome invalido'});
            }

            if(!usuario.email || usuario.email.length < 5
                || !usuario.email.includes('@')   
                || !usuario.email.includes('.')){
                return res.status(400).json({erro : 'email invalido'});
 
             }

             if(!usuario.senha || usuario.senha.length < 4){
                return res.status(400).json({erro : 'senha inválida'});
             }  

             //validação se ja existe um usuario com o mesmo email
             const usuariosComMesmoEmail = await UsuarioModel.find ({email : usuario.email});
             if (usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0) {
                return res.status(400).json({erro : 'Já existe uma conta com o email informado'});

             }
             
             //enviar a imagem do multer para o cosmic    
             const image = await uploadImagemCosmic(req);

             //salvar no banco de dados
             const usuarioAserSalvo = {
                nome : usuario.nome,
                email : usuario.email,
                senha : md5 (usuario.senha),
                avatar : image?.media?.url 
             }     
             await UsuarioModel.create(usuarioAserSalvo); 
             return res.status(200).json({msg: 'usuario criado com sucesso'});
        });
 
        export const config = {
            api : {
                bodyParser : false  
            } 
        }

    export default politicaCORS(conectarMongoDB(handler));