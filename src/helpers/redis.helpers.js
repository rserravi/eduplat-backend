const redis = require("redis");
const { storeUserLastAccess, getUserLastAccess } = require("../model/user/user.model");
const client = redis.createClient({legacyMode: true},process.env.REDIS_URL);

const checkRedis = async() => {
    let ready = false;
    client.on("ready", function (error){
        ready = true;
        console.log("Redis is ready");
    })
    if (!ready){
        console.log("Attempting to connect redis")
        try {
            await client.connect();
            ready = true;
  
        } catch (error) {
            console.log("Redis already connected...");
            ready = true;
        }   
    }
    return ready;
 }
 
const setJWT = (key, value) =>{
    console.log("CREANDO ACCESSJWT EN REDIS", key, value)
    return new Promise(async(resolve, reject)=>{
  
        try {    
            await checkRedis(); 
            // BUG ALERT:!!!! Aqui peta
            console.log("REDIS ESTA FUNCIONANDO EN SETJWT", key, value)
            const lastAccess =  await getUserLastAccess(value)
            console.log("LASTACCESS", lastAccess)
            if (lastAccess){
                console.log("VAMOS A BORRAR LASTACCESS". lastAccess)
                try {
                    client.del(lastAccess, (err, res)=>{
                        if(err) reject(err)
                        else console.log("BORRADO ", lastAccess)
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            else {
                console.log("NO HABIA LAST ACCESS????????")
            }
            console.log("Y AHORA CREAMO UNO NUEVO")
            await storeUserLastAccess(value, key)
            client.set(key, value, (err, res)=>{
                console.log("Client set en setJWT")
                if(err){ 
                    console.log("ERROR EN EL SETJWT DE REDIS.HELPERS")
                    reject(err)
                }
                else {
                    console.log("SE HA CREADO KEY=",key, "CON VALUE", value, " Y RESPUESTA", res)
                    resolve(res)
                }
            });
            
        } catch (error) {
           console.log("ERROR EN SETJWT",error);
           reject(error);
       }
    })
 }
 
 const getJWT = (key) =>{
    return new Promise(async(resolve, reject)=>{
  
        try {
            await checkRedis()
            client.get(key, (err, res)=>{
                if(err) {reject(err);console.log("NO EXISTE LA CLAVE ", key, "EN REDIS.")}
                else{
                    if (res && res!==null){
                        resolve(res)
                        console.log("DATOS EN GETJWT", res)
                    }
                    else {
                        console.log("2. NO EXISTE LA CLAVE ", key, "EN REDIS.")
                        //reject();
                        resolve(res)
                        
                    }
                }
            });
        } catch (error) {
            
            reject(error);
        }
    })
 }
 
 const deleteJWT = async key => {
     return new Promise(async(resolve, reject)=>{
         try {
             await checkRedis();
             client.del(key, (err, res)=>{
                 if(err) reject(err)
                 resolve(res)
             });
         } catch (error) {
             console.log(error);
         }
     })
  }

  
 
module.exports = {
   setJWT,
   getJWT,
   deleteJWT
}
