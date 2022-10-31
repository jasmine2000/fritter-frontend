import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FollowCollection from './collection';

/**
 * Makes sure other user exists
 */
const followedExists = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserCollection.findOneByUsername(req.params.username);
  if (!user) {
    res.status(404).json({
      error: {
        userNotFound: 'Trying to follow nonexistent User.'
      }
    });
    return;
  }

  next();
};

/**
 * Makes sure follow does not exist for follower/followed combo
 */
const followObjNotExist = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserCollection.findOneByUsername(req.params.username);
  const follow = await FollowCollection.findFollow(req.session.userId, user._id);
  if (follow) {
    res.status(409).json({
      error: {
        followFound: 'You are already following this user.'
      }
    });
    return;
  }

  next();
};

/**
 * Makes sure follow exists
 */
const followObjExist = async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserCollection.findOneByUsername(req.params.username);
  const follow = await FollowCollection.findFollow(req.session.userId, user._id);
  if (!follow) {
    res.status(404).json({
      error: {
        followNotFound: 'You cannot unfollow user you are not following.'
      }
    });
    return;
  }

  next();
};

export {
  followedExists,
  followObjNotExist,
  followObjExist
};
