const {CommentScheme} = require("./comment.scheme");
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const InsertComment = commentObj =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("comment",CommentScheme)
 
        User(commentObj)
        .save()
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
};

const GetCommentsByUserId = userId =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Comment = await db.model("comment",CommentScheme)

        if((!userId)) return false;
        try{
            Comment.find({'receiverId':userId}, (error, data)=>{
                //console.log("DATA EN GETCOMMENTSBYUSERID", data)
            if(error){
                resolve(error);
            }
            resolve(data);
            })
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    InsertComment,
    GetCommentsByUserId
 };