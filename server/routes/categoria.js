const express = require('express');

const Categoria = require('../models/categoria');

const app = express();

let  { verificaToken,verificarRole } =  require('../middelwares/authentication');

// ============================
// Mostrar lista de categorias 
// ============================

app.get('/categoria',verificaToken,(req,res)=>{

    Categoria.find({})
             .sort('descripcion')
             .populate('usuario','nombre email') // pirmer argumento el id que quiere relacionar en la tabla el segundo la informacion que quiere que muestre de esa tabla a la cual hace referencia.
             .exec((err,categorias)=>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
    
                res.json({
                    ok: true,
                    categorias
                });
             });
});

// ============================
// Mostrar una categoria por ID
// ============================

app.get('/categoria/:id',verificaToken,(req,res)=>{

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
})


// ============================
// Crear nueva categoria
// ============================
app.post('/categoria',verificaToken,(req,res)=>{

    let body = req.body;

    let categoria = new Categoria({
        
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err,categoriaDB)=>{

        if(err){

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){

            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria:categoriaDB
        });

    });
});

// ============================
// Mostrar todas las categorias
// ============================

app.put('/categoria/:id', verificaToken,(req,res)=>{

    let id = req.params.id;

    let body = req.body;

    Categoria.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,categoriaDB)=>{

        if(err){

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){

            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria:categoriaDB
        });

    });


});


// ============================
// Mostrar todas las categorias
// ============================

app.delete('/categoria/:id',[verificaToken,verificarRole],(req,res)=>{

     // solo un administrador puede borrar categorias
    // Categoria.findByIdAndRemove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id,(err,categoriaDB)=>{

        if(err){

            return res.status(500).json({
                ok:true,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });


    });
});

module.exports = app;

