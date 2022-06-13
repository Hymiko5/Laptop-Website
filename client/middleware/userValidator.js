
module.exports = function userValidator(req, res, next) {
    const user = req.body;
    const userNameRegex = /^.{5,20}$/;
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneNumberRegex = /^\d{8,11}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if(!(userNameRegex.test(user['user-name']) || emailRegex.test(user.email) || phoneNumberRegex.test(user['phone-number'])|| passwordRegex.test(user.password) || user.password == user['repeat-password']))
    {
        res.redirect('/auth/failed');
        return;
    }
    next();
}