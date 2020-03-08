const express = require('express');

const app = express();

let Producto = require('../models/producto');

let  { verificaToken,verificarRole } =  require('../middelwares/authentication');



// ============================
// Mostrar lista de categorias 
// ============================
app.get('/producto',(req,res)=>{

    let desde = req.query.desde || 0;
    desde = Number(desde); // recuerda que esto va dentro de los parametros 

    Producto.find({})
            .skip(desde)
            .limit(5)
            .sort('nombre')
            .populate('categoria','nombre')
            .populate('usuario','nombre email')
            .exec((err,productos)=>{
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
    
                res.json({
                    ok: true,
                    productos
                });

            })
            
});

// ============================
// Busca un producto por su id
// ============================

app.get('/producto/:id',(req,res)=>{
    
    let id = req.params.id;

    Producto.findById(id,(err,productoDB)=>{


        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    })
});

// ============================
// Busca un producto por el nombre
// ============================

app.get('/producto/buscar/:termino',verificaToken,(req,res)=>{

    let termino = req.params.termino;
    // expresion regular 
    let regex = new RegExp(termino,'i');  // i para que sea insensible a las mayusculas 

    Producto.find({nombre:regex})
            .populate('categoria')
            .exec((err,productos)=>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
    
                res.json({
                    ok: true,
                    productos
                });

            });

});


// ============================
// Crea un producto 
// ============================

app.post('/producto',verificaToken,(req,res)=>{

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err,productoDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ============================
// Actualiza un producto
// ============================

app.put('/producto/:id',verificaToken,(req,res)=>{

    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,productoDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    

    });

});

// ============================
// Cambia de estado de un producto 
// ============================

app.delete('/producto/:id',(req,res)=>{

    let estado = {disponible:false};
    let id = req.params.id;

    Producto.findByIdAndUpdate(id,estado,{new:true},(err,productoDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

module.exports = app;

