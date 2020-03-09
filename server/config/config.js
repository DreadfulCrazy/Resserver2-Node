//======================
// PUERTo
//======================

process.env.PORT = process.env.PORT || 3000;

//======================
// VENCIMIENTO DEL TOKEN    
//======================
//60 SEGUNDOS
//60 MINUTOS
//24 HORAS
//30 DIAS
process.env.CADUCIDAD_TOKEN = '48h';


//======================
// SEED
//======================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//======================
// ENTORNO
//======================

process.env.NODE_ENV = process.env.NODE_ENV ||'dev';

//======================
// BASE DE DATOS
//======================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.urlDB =urlDB;


//======================
// GOOGLE CLIENT ID                               
//======================

process.env.CLIENT_ID = process.env.CLIENT_ID || '698906896143-mkfposf89ej6367hmimqr0j2d0a9v4g8.apps.googleusercontent.com';
