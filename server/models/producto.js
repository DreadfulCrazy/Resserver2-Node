const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let productoSchema = new Schema({

    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre es obligatorio']
    },
    precioUni:{
        type: Number,
        required: [true,'El precio es obligatorio']
    },
    descripcion:{
        type: String,
        required:true,
        required: false
    },
    img:{
        type: String,
        required:true,
        required: false
    },
    disponible:{
        type: Boolean,
        default:true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required:true
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Producto',productoSchema);