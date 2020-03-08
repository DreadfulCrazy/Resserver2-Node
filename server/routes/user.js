const express = require('express');

const bcrypt =require('bcrypt');

const _=require('underscore');

const Usuario = require('../models/users');

const { verificaToken, verificarRole } = require('../middelwares/authentication');

const app = express();

app.get('/usuario',verificaToken, (req,res) =>  {
    

    // return res.json({
    //     usuario:req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });


    let desde = req.query.desde || 0;
    desde = Number(desde);
    
    let limite = req.query.limite || 5;
    limite = Number(limite);
    

    Usuario.find({estado:true},'nombre email img role estado google')
           .skip(desde)
           .limit(limite)
           .exec((err,usuarios)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            Usuario.count({estado:true},(err,conteo)=>{

              res.json({
                ok:true,
                usuarios,
                cuantos:conteo
              });  

            });

            
           });

});

app.post('/usuario',[verificaToken,verificarRole],function (req,res) {
    
    let body = req.body; 

    let usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password,10), // crea el hash de una via danto 10 vueltas
        role: body.role
    });


    usuario.save((err,usuarioDb)=>{

        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        // usuarioDb.password = null;

        res.json({
            ok:true,
            usuario:usuarioDb
        });
    });
    

});

app.put('/usuario/:id', [verificaToken,verificarRole],function (req,res) {
    
    let id = req.params.id;
    let body = _.pick(req.body,['nombre','email','img','role','estado']);// .pick pasa un arreglo de las opciones que si se puedan actualizar

    Usuario.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,usuarioDb)=>{ // encuentra el id y lo actualiza
        // new genera el nuevo objeto // run validator corre todos las validaciones del sistema
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        
        res.json({
            ok: true,
            usuario: usuarioDb
        });
        
    });
    
});
// app.delete('/usuario/:id',function (req,res) {

//     let id = req.params.id;

//     Usuario.findByIdAndRemove(id,(err,usuarioBorrado)=>{

//         if (err) {
            
//             return res.status(400).json({
//                 ok: false,
//                 err

//             });

//         }

//         if (!usuarioBorrado) {
            
//             return res.status(400).json({

//                 ok:false,
//                 err:{
                    
//                     message: 'Usuario no encontrado'

//                 }
                
//             })
//         }

//         res.json({
//             ok:true,
//             usuarioBorrado
//         });
//     });



// });

app.delete('/usuario/:id', [verificaToken,verificarRole],function(req,res){

    let id =req.params.id;

    let cambiaEstado ={
        estado: false
    }
    

    Usuario.findByIdAndUpdate(id,cambiaEstado,{new:true},(err,usuarioBorrado)=>{

        if (err) {
            
            return res.status(400).json({
                ok: false,
                err

            });

        }

        if (!usuarioBorrado) {
            
            return res.status(400).json({

                ok:false,
                err:{
                    
                    message: 'Usuario no encontrado'

                }
                
            });
        }

        res.json({
            ok:true,
            usuarioBorrado
        });
    });

});

module.exports = app; 