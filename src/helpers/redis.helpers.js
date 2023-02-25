const redis = require("redis");
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
            //console.log("REDIS ESTA FUNCIONANDO")
            client.set(key, value, (err, res)=>{
                if(err){ 
                    //console.log("ERROR EN EL SETJWT DE REDIS.HELPERS")
                    reject(err)
                }
                else {
                    //console.log("SE HA CREADO KEY=",key, "CON VALUE", value, " Y RESPUESTA", res)
                    resolve(res)
                }
            });
            
        } catch (error) {
            reject(error);
        }
    })
 }
 
 const getJWT = (key) =>{
    return new Promise(async(resolve, reject)=>{
  
        try {
            await checkRedis()
            client.get(key, (err, res)=>{
                if(err) {reject(err);console.log("NO EXISTE LA CLAVE ", key, "EN REDIS. ERROR:", err)}
                else{
                    resolve(res)
                    //console.log("DATOS EN GETJWT", res)
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
