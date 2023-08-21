
const jwt = require('jsonwebtoken');


const partnerAuth =(req,res,next)=>{
    try {
        console.log("ooo");
        const tokenWithBearer= req.headers['authorization']
        console.log(tokenWithBearer,";;;;;");
        const token=tokenWithBearer.split(" ")[1]
        console.log(token,'JJJJJJ');
        jwt.verify(token,process.env.PARTNER_JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                console.log("wrong");
                return res.status(401).send({message:"Auth failed",success:false})
            }else{
                console.log("olll");
                req.id=encoded.id
                next()
            }
        })
    } catch (error) {   
    }
}

module.exports={
    partnerAuth
}
