const nodemailer = require("nodemailer");
const { getUserbyUserName } = require("../model/user/user.model");
 
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS,
   },
});
 
const send = async (message) =>{
    return new Promise(async (resolve, reject)=>{ 
        await transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log('Error occurred');
                console.log(error.message);
                reject (process.exit(1));
            }
    
            console.log('Message sent successfully!');
            console.log(nodemailer.getTestMessageUrl(info));
    
            // only needed when using pooled connections
            //transporter.close();
            console.log("THIS IS INFO IN SEND",info);
            resolve(info);
        });
    }) 
}
 
const emailProcessor = (email, pin, type, verificationLink)=>{
    let info = ""
    console.log ("EN EMAIL PROCESSOR");
    switch (type) {
        case "request new password":
            info = {
                from: process.env.EMAIL_SENDER_ADDRESS, // sender address
                to: email + "", // list of receivers
                subject: "Password reset pin ✔", // Subject line
                text: "Here is your password reset pin: " + pin + ". This pin will expire in 1 day. Please, follow the link to introduce your new password" + verificationLink , // plain text body
                html: `<b>Hello</b>
                    Here is your password reset pin
                    <b>${pin}</b>
                    <p>This pin will expire in 1 day"</p>
                    <p>Please, follow the <b>link</b> to introduce your new password</p>
                    <p><a href=${verificationLink}>${verificationLink}</a></p>
                    `, //html body
            }
      
            retorno = send(info);
           
            break;
       
        case "password update success":
            info = {
                from: process.env.EMAIL_SENDER_ADDRESS, // sender address
                to: email + "", // list of receivers
                subject: "Password updated ✔", // Subject line
                text: "Your password has been updated. You can login now", // plain text body
                html: `<b>Hello</b>
                    <p>Your <b>password</b> has been updated.</p>
                    <p>You can Log In now.</p>
                    `, //html body
            }
            retorno = send(info);
            break;

        case "new user confirmation":
            info = {
                from: process.env.EMAIL_SENDER_ADDRESS, // sender address
                to: email + "", // list of receivers
                subject: "User created. Verify new user ✔", // Subject line
                text: "Please, follow the link to confirm that you are you", // plain text body
                html: `<b>Please confirm your email</b>
                    <p>Pleas, follow the <b>link</b> to confirm that you are really <b>you</b></p>
                    <p><a href=${verificationLink}>${verificationLink}</a></p>
                    `, //html body
            }
            retorno = send(info);
            break;
     
        default:
            console.log("NO SE HA DEFINIDO 'TYPE' CORRECTAMENTE EN emailProcessor")
            break;
    }

    return retorno;
 }

const customMail = (toEmail, subject, html)=>{
    console.log("EN CUSTOM MAIL")

}

const supportMail = async (sender, subject, message) =>{
    const user = await getUserbyUserName(sender)
    console.log("USER EN SUPPORT MAIL")
    if (user){
        info = {
            from: process.env.EMAIL_SENDER_ADDRESS, // sender address
            to: process.env.EMAIL_SENDER_ADDRESS, // sender address
            subject: "Support mail sended by "+sender,
            text: message,
            html: `<h2>Support Request Email sended from: `+sender+` to SupportTeam</h2>
                <p><strong>Subject</strong>: `+ subject+`</p>
                <p><strong>Date</strong>:`+ Date.now().toLocaleString('ES')+`</p>
                <p><strong>Message</strong>:`+ message+`.</p>
                <p><strong>Sender Data</strong>:</p>
                <ul>
                <li><strong>User name</strong>: `+ sender+`</li>
                <li><strong>Real name</strong>: `+ user.firstname+` `+ user.lastname+`</li>
                <li><strong>Email</strong>: `+ user.emails[0].emailUrl +`</li>
                </ul>
                <p>Remember to answer as soon as possible.</p>
        <p>&nbsp;</p>
            
            `, //html body
        }
        const retorno= await send(info);
        console.log("THIS IS RETORNO", retorno)
        return retorno;
    }

   
}
 
 
module.exports = {
    emailProcessor,
    supportMail
 }
 