const nodemailer = require("nodemailer");
 
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
    await transporter.sendMail(message, (error, info) => {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return process.exit(1);
        }
  
        console.log('Message sent successfully!');
        console.log(nodemailer.getTestMessageUrl(info));
  
        // only needed when using pooled connections
        //transporter.close();
        console.log(info);
        return info;
    });
}
 
const emailProcessor = (email, pin, type, verificationLink)=>{
    let info = ""
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
            return retorno;
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
            return retorno;
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
            return retorno;
            break;
     
        default:
            break;
    }
 }
 
 
module.exports = {
    emailProcessor,
 }
 