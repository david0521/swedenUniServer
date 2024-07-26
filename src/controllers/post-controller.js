const router = require("express").Router();

const { PostSchema, ProgramPost, UniversityPost } = require("../schemas/post.js");
const User = require("../schemas/user.js");

const authenticateJWT = require('../middlewares/jwtAuth.middle.js')
const { authorizeUser, authorizeAdmin } = require('../middlewares/authorize.middle.js')

/**
 * Get /uniPost/{uniName}
 * @summary Returns all posts belonging to the same university
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/uniPost", async (req, res) => {
    try {
        const uniName = req.query.uniName;

        const content = await UniversityPost.find({ uniName: uniName }).select("title timeStamp likes _id contentCategory");

        if (content.length === 0) {
            return res.status(404).json({ error: "아직 업로드 된 게시물이 없습니다." });
        }

        return res.status(200).json({ 
            post: content,
            message: "성공적으로 불러왔습니다."
        });
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /programPost/{programName}
 * @summary Returns all posts belonging to the same program
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/programPost", async (req, res) => {
    try {
        const programName = req.query.programName;

        const content = await ProgramPost.find({ programName: programName }).select("title timeStamp likes _id contentCategory");

        if (content.length === 0) {
            return res.status(404).json({ error: "아직 업로드 된 게시물이 없습니다." });
        }

        return res.status(200).json({ 
            post: content,
            message: "성공적으로 불러왔습니다."
        });
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /userId/{userId}
 * @summary Returns all contents belonging to a certain user
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/userId/:userId", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const contentType = req.query.type;
        const user = req.params.userId;

        const contents = await PostSchema.find({ author: user, __t: contentType });

        console.log(contents)

        if (contents.length === 0) {
            return res.status(200).json({
                message: "작성하신 게시물이 없습니다."
            })
        }
        
        return res.status(200).json({
            contents: contents,
            message: "성공적으로 불러왔습니다."
        }) 
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Get /contentId/{id}
 * @summary Returns a specific content based on the mongoose id
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.get("/contentId/:id", async (req, res) => {
    try {
        const contentId = req.params.id;

        const content = await PostSchema.findById(contentId);

        if (!content) {
            return res.status(404).json({ error: "존재하지 않는 게시물입니다." });
        }

        return res.status(200).json({ 
            post: content,
            message: "성공적으로 불러왔습니다."
        });
        
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

/**
 * Post /contentType/{contentType}
 * @summary Post new content to the server
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.post("/contentType/:contentType/userId/:userId", authenticateJWT, authorizeUser, async (req, res, next) => {
    try {
        const contentType = req.params.contentType;
        const userID = req.params.userId;
        const body = req.body;

        if (!['universityReview', 'programReview'].includes(contentType)) {
            return res.status(400).json({
                error: "게시물의 종류는 다음 중 하나여야합니다: administration, review, question"
            });
        }

        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({
                error: "존재하지 않는 회원입니다"
            })
        }

        if (!body.title || !user || !body.content) {
            return res.status(400).json({
                error: "게시물을 작성하기 위해서 다음 정보가 모두 필요합니다: title, author, content"
            })
        }
        
        let newContent;

        switch (contentType) {
            case 'universityReview':
                newContent = new UniversityPost({
                    title: body.title,
                    author: user._id,
                    timeStamp: Date.now(),
                    content: body.content,
                    uniName: body.uniName,
                    contentCategory: body.category
                });
                break;
            case 'programReview': 
                newContent = new ProgramPost({
                    title: body.title,
                    author: user._id,
                    timeStamp: Date.now(),
                    content: body.content,
                    programName: body.programName,
                    contentCategory: body.category
                })
                break;
        }

        await newContent.save()

        return res.status(200).json({
            message: "성공적으로 등록하였습니다.",
            id: newContent._id
        })
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
})

/**
 * Post /adminContent/userId/{userId}
 * @summary Post new admin content to the server
 * @tags post
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.post("/adminContent/userId/:userId", authenticateJWT, authorizeAdmin, async (req, res, next) => {
    try {
        const userID = req.params.userId;
        const body = req.body;

        const user = await User.findById(userID);

        if (!body.title || !user || !body.content) {
            return res.status(400).json({
                error: "게시물을 작성하기 위해서 다음 정보가 모두 필요합니다: title, author, contentType, content"
            })
        }

        const newContent = new Post({
            title: body.title,
            author: user._id,
            timeStamp: Date.now(),
            content: body.content
        })

        await newContent.save()

        return res.status(200).json({
            message: "성공적으로 등록하였습니다.",
            id: newContent._id
        })
    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
})


/**
 * Delete /contentId/{id}
 * @summary Deletes the relevant record
 * @tags records
 * @return {object} 200 - Success response
 * @return {object} 404 - No consent forms registered
 */
router.delete("/contentId/:id", authenticateJWT, authorizeUser, async (req, res) => {
    try {
        const contentId = req.params.id;

        const content = await PostSchema.findById(contentId);

        if (!content) {
            return res.status(404).json({
                error: "존재하지 않는 게시물입니다."
            })
        }

        await PostSchema.deleteOne(content);
        return res.status(200).json({
            message: "성공적으로 삭제하였습니다."
        })


    } catch (err) {
        console.log(err);
        // Translation: An internal server error has occured
        return res.status(500).send("시스템상 오류가 발생하였습니다.")

    }
});

module.exports = router;