const router = require("express").Router();
const Project = require("../models/Project");
// ルーティングでserver.jsへ繋ぐ

const Post = require("../models/Project");
const User = require("../models/User");

//create a project
router.post("/", async (req, res) => {
  const newProject = new Project(req.body);
  try {
    const savedProject = await newProject.save();
    res.status(200).json(savedProject);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a project
router.put("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Project.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("このプロジェクトは編集されました");
    } else {
      res.status(403).json("このプロジェクトを編集できます");
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

//delete a project
router.delete("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Project.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("このプロジェクトは削除されました");
    } else {
      res.status(403).json("自分のプロジェクトだけが削除できます");
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

//like/dislike a post 投稿のいいねとフォローは同じロジックで作成できる（違うのは、自分の投稿はいいねができる点）
router.put("/:id/like", async (req, res) => {
  // ここでは自分のプロジェクトかどうかの分岐は作成しなくてOK
  try {
    const project = await Project.findById(req.params.id);
    //まだ投稿にいいねが押されていなかったら
    if (!project.likes.includes(req.body.userId)) {
      await project.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("この投稿はいいねされました");
      //すでにいいねが押されていたら
    } else {
      //いいねしているユーザーを取り除く
      await project.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("この投稿はいいねを解除されました");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a specific project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all post one user
router.get("/profile/:username", async (req, res) => {
  try {
    // 自分のプロフィールに流れるタイムラインの内容なのでfindOneを利用する（oneの場合にはプロパティの設定が必要）
    const user = await User.findOne({ username: req.params.username });
    const projects = await Project.find({ userId: user._id });
    return res.status(200).json(projects);
  } catch (err) {
    return res.json(500).json(err);
  }
});

//get flow projects
// timelineのディレクトリは/timelineだけにすると/:idの一つとして選択される可能性が高いので、下のディレクトリ/:userIdをつけないといけない
router.get("/flow/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userProjects = await Project.find({ userId: currentUser._id });
    const friendProjects = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userProjects.concat(...friendProjects));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", (req, res) => {
  console.log("project page");
});

module.exports = router;