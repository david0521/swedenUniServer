// Authorize if the requester is user himself or if an admin
const authorizeUser = (req, res, next) => {
    const userId = req.params.id;
    const currentUser = req.user;

    if (currentUser.id === userId || currentUser.admin === true) {
        next();
    } else {
        return res.status(403).json({
            error: "이 작업을 수행할 권한이 없습니다."
        })
    }
}

// Authorize if the requester is an admin
const authorizeAdmin = (req, res, next) => {
    const currentUser = req.user;

    if(currentUser.admin === true) {
        next();
    } else {
        return res.status(403).json({
            error: "관리자만 이 권한을 수행할 수 있습니다."
        })
    }
}

module.exports = {
    authorizeUser,
    authorizeAdmin
}