const jwt = require('jsonwebtoken');
const { findCurrentUserById } = require('../queries/users.queries');
const { createJwt } = require('../utils/jwt.utils');
const { jwtConfig } = require('../configs/jwt.config');
const { findPostById } = require('../queries/posts.queries');

// Middleware to ensure that the user is properly connected and add the user to the request object if he is connected
exports.ensureAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.clearCookie('jwt');
      return res.status(401).json({ message: `Utilisateur non connecté` });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findCurrentUserById(decodedToken.userId);
    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({ message: `Utilisateur non connecté` });
    }
    req.signin(user.id);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.ensureUserIsPostOwner = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const postId = Number(req.params.id);
    console.log('USER ID : ', currentUserId, 'POST ID : ', postId);
    const post = await findPostById(postId);
    if (!post) return res.status(404).json({ message: `Impossible de trouver le post` });
    if (currentUserId !== post.userId)
      return res.status(403).json({ message: `Vous n'êtes pas l'auteur de ce post` });
    req.post = post;
    return next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Middleware to add signin and signout functions to req object
exports.addAuthFeatures = (req, res, next) => {
  req.signin = (userId) => {
    const token = createJwt(userId);
    res.cookie('jwt', token, {
      // secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: jwtConfig.maxAge * 1000
    });
  };
  req.signout = () => res.clearCookie('jwt');
  next();
};
