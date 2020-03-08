const jwt = require('jsonwebtoken');

//========================
//Verificar Token
//========================

let verificaToken = (req,res,next) => {

    let token = req.get('token'); //De esta manera obtenemos los headers de la url

    jwt.verify(token,process.env.SEED ,(err,decoded)=>{ // se valida el toke par 1 toke, 2 semilla, callback => err y el token decodificado

            if(err){
                return res.status(401).json({
                    ok:false,
                    err: {
                        message: 'Token no valido'
                    }
                });
            }

            req.usuario = decoded.usuario;
            next();
    });
    
};

let verificarRole = (req,res,next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
    }else{

        return res.status(401).json({
            ok:false,
            err:{
                message: 'El usuario no es admninistrador'
            }
        });
    }

}




module.exports = {
    verificaToken,
    verificarRole
}