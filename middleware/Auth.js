
const jwt = require('jsonwebtoken');

const partnerAuth =(req,res,next)=>{
    try {
        const tokenWithBearer = req.headers['authorization'];
        const token=tokenWithBearer.split(" ")[1]
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                return res.status(401).send({message:"Auth failed",success:false})
            }else if (encoded.role === 'partner') {
          req.id = encoded.id;
          next();
        }
        })
    } catch (error) {   
      console.log(error.message);
    }
}
const userAuth = async (req, res, next) => {
    try {
      const tokenWithBearer = req.headers['authorization'];
      if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or invalid', success: false });
      }
  
      const token = tokenWithBearer.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, encoded) => {
        if (err) {
          console.log('wrongToken', err.message);
          return res.status(401).json({ message: 'Auth failed', success: false });
        } else if (encoded.role === 'user') {
          console.log(encoded.role, 'userhhh');
          console.log('olll', encoded);
          req.id = encoded.id;
          next();
        }
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal Server Error', success: false });
    }
  };
  

module.exports={
    partnerAuth,
    userAuth
}
