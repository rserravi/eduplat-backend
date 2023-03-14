const stripPrivateData = user => {
    console.log("EN STRIP DATA", user);
    const newUser= {
        "userName" : user.userName,
        "firstname": user.firstname,
        "lastname" : user.lastname,
        "picture": user.picture,
        "emails": user.emails,
        "phones": user.phones,
        "social": user.social,
        "valorations": user.valorations
    }

    console.log(newUser)

    return newUser;
}