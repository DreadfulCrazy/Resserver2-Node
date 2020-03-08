const express = require('express'); 

const bcrypt =require('bcrypt');

const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client('process.env.CLIENT_ID');

const Usuario = require('../models/users');

const app = express();

app.post('/login',(req,res)=>{

    let body = req.body;

    Usuario.findOne({email:body.email},(err,usuarioDB)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok:false,
                err: {
                    message:'(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync( body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok:false,
                err: {
                    message:'Usuario o (contraseña)  incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario:usuarioDB
        },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN})

        res.json({
                ok:true,
                usuario: usuarioDB,
                token
            });

    });
   
});

//Configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

app.post('/google',async (req,res)=>{


    let token = req.body.idtoken;// recibimos el token 
    
    let googleUser = await verify(token) // enviamos el token a la funcion para que lo verifique y la funcion nos retorna la informacion
                           .catch(e=>{
                                res.status(401).json({
                                    ok:false,
                                    err: e
                                });
                            });

    Usuario.findOne({email: googleUser.email}, (err,usuarioDB) =>{// ahora con lo que retorna en verify. verificamos en la db si hay un usuario con ese email

        if (err){ 
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(usuarioDB){ // si existe ese usuario retorna message osea que debe ingresar normalmente 

            if (usuarioDB.google == false) {
                return res.status(400).json({
                    ok: false,
                    err:{
                        message: 'Debe usar su autenticacion normal'
                    }
                });
                
            }else{// si el usuario efectivamente se autentico con google le creamos el token de nosotros
                let token = jwt.sign({
                    usuario:usuarioDB,
                }, process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                }); 
            }
        } else{ // este else es si es la primera vez que se esta autenticando en nuestra app
            // si el usuario no existe en nuestra base de datos
            let usuario = new   Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err,usuarioDB)=>{// gaurdamos el usuario en nuestra db
                if (err) { // si sucede algun error 
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({ // si no genera el token 
                    usuario:usuarioDB,
                }, process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({ // mando a imprimir la respuesta 
                    ok: true,
                    usuario: usuarioDB,
                    token
                }); 
            });
            
        }
    });                    

    // res.json({
        
    //     usuario: googleUser

    // });

})

module.exports = app;