// Ruta para mostrar las imagenes que estan en la carpeta uploads(la cuel esta oculta en nuestro servidor) en public cuando se requiera

const express = require('express');
const fs = require('fs');

const path = require('path');

const { verificarTokenImg } = require('../middelwares/authentication')

let app = express();


app.get('/imagen/:tipo/:img',verificarTokenImg,(req,res)=>{

    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImagen = path.resolve(__dirname,`../../uploads/${tipo}/${img}`)

    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    }else{
        let noImagePath = path.resolve(__dirname,'../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

    

    
});

module.exports = app;