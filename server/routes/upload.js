const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

const Usuario = require('../models/users');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({useTempFiles : true}));


app.put('/upload/:tipo/:id',(req,res)=>{

    let tipo = req.params.tipo;
    let id = req.params.id;

    if(!req.files){

        return res.status(400).json({
            ok:falso,
            err:{
                message:'No se ha seleccionado ningun archivo'
            }
        });
    }

    //Validar tipo 
    let tiposValidos = ['productos','usuarios'];

    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Laos tipos permitidas son ' + tiposValidos.join(', ')
            }
        });

    }

    

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.'); // tomamos el nombre del archivo y lo dividimos en un arreglo archivo.jpg = [archivo, jpg]
    let extension = nombreCortado[nombreCortado.length-1]; // eliminamos el primer indice del array. [jpg]
    
    
    // Extenciones permitidas
    let extensionesValidas = ['png','jpg','gif','jpeg'];// creamos arreglo con extensiones validas

    if(extensionesValidas.indexOf(extension)<0){ // valida si es menor que 0 no encontro en la variable  extension una extension valida 
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo =`${id}-${new Date().getMilliseconds() }.${extension}`;// le agegamos los milisengundos apra crear un archivo unico para ese id

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`,(err)=>{// dependiendo del tipo de archivo lo va enviar a la carpeta requerida en la varible 

        if(err){

            return res.status(500).json({
                ok: false,
                err
            });
        }

        // aqui, la img esta cargada
        if(tipo==='usuarios'){
            imagenUsuario(id,res,nombreArchivo); // nombre del archivo tambien lo recibimos como un argumento de la funcion , porque es lo que quieresgrabar en el usuario
        }else{
            imagenProducto(id,res,nombreArchivo); // nombre del archivo tambien lo recibimos como un argumento de la funcion , porque es lo que quieresgrabar en el usuario
        }
        // imagenUsuario(id,res,nombreArchivo); // nombre del archivo tambien lo recibimos como un argumento de la funcion , porque es lo que quieresgrabar en el usuario


    });
});


function imagenUsuario(id, res,nombreArchivo) {

    Usuario.findById(id,(err,usuarioDB)=>{

        if(err){
            borrarArchivo(nombreArchivo,'usuarios');// tambien se llama aqui porque aunque suceda un erro la imagen si se subiria y se tiene que borrar

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB){
            borrarArchivo(nombreArchivo,'usuarios');// se ubicaria aqui para que si el usuario inciste evitar que el servidor se llene de basura

            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Usuario no existe'
                }
            });
        }

        // let pathImagen = path.resolve(__dirname,`../../uploads/usuarios/${usuarioDB.img}`)// path se usa cuando una carpeta esta fuera de la carpeta del servidor

        // if(fs.existsSync(pathImagen)){// es una funcion que verifica si ese path existe en el sistema retorna tru si existe y false si no

        //     fs.unlinkSync(pathImagen); // funcion que elimina el path pasado por parametro cuidado: tener cautela al revisar que va eliminar
        // }

        borrarArchivo(usuarioDB.img,'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err,usuarioGuardado)=>{
            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });

}

function imagenProducto(id,res,nombreArchivo) {
    
    Producto.findById(id,(err,productoDB)=>{

        if(err){
            borrarArchivo(nombreArchivo,'productos');// tambien se llama aqui porque aunque suceda un erro la imagen si se subiria y se tiene que borrar

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            borrarArchivo(nombreArchivo,'productos');// tambien se llama aqui porque aunque suceda un erro la imagen si se subiria y se tiene que borrar

            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Producto no existe'
                }
            });

        }


        
        borrarArchivo(productoDB.img,'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err,productoGuardado)=>{
            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            });
            
         });

    });
}
    
    function borrarArchivo(nombreImagen,tipo) {
        let pathImagen = path.resolve(__dirname,`../../uploads/${tipo}/${nombreImagen}`)// path se usa cuando una carpeta esta fuera de la carpeta del servidor
    
            if(fs.existsSync(pathImagen)){// es una funcion que verifica si ese path existe en el sistema retorna tru si existe y false si no
    
                fs.unlinkSync(pathImagen); // funcion que elimina el path pasado por parametro cuidado: tener cautela al revisar que va eliminar
            }
    
    }

module.exports = app;