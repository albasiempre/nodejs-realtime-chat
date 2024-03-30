const router = require("express").Router();
// ルーティングでserver.jsへ繋ぐ

const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post
router.put("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("この投稿は編集されました");
    } else {
      res.status(403).json("この投稿を編集できます");
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("この投稿は削除されました");
    } else {
      res.status(403).json("自分の投稿だけが削除できます");
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

//like/dislike a post 投稿のいいねとフォローは同じロジックで作成できる（違うのは、自分の投稿はいいねができる点）
router.put("/:id/like", async (req, res) => {
  // ここでは自分の投稿かどうかの分岐は作成しなくてOK
  try {
    const post = await Post.findById(req.params.id);
    //まだ投稿にいいねが押されていなかったら
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("この投稿はいいねされました");
      //すでにいいねが押されていたら
    } else {
      //いいねしているユーザーを取り除く
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("この投稿はいいねを解除されました");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a specific post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
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
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (err) {
    return res.json(500).json(err);
  }
});

//get timeline posts
// timelineのディレクトリは/timelineだけにすると/:idの一つとして選択される可能性が高いので、下のディレクトリ/:userIdをつけないといけない
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", (req, res) => {
  console.log("post page");
});

module.exports = router;