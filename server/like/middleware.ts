import type {Request, Response, NextFunction} from 'express';
import FreetCollection from '../freet/collection';
import {Types} from 'mongoose';
import LikeCollection from './collection';

/**
 * Makes sure post exists
 */
const isPostExistsBody = async (req: Request, res: Response, next: NextFunction) => {
  const exists = await isPostExists(req.body.postId);
  if (!exists) {
    res.status(404).json({
      error: {
        postNotFound: 'Post with given ID does not exist.'
      }
    });
    return;
  }

  next();
};

/**
 * Makes sure post exists
 */
const isPostExistsParams = async (req: Request, res: Response, next: NextFunction) => {
  const exists = await isPostExists(req.params.postId);
  if (!exists) {
    res.status(404).json({
      error: {
        postNotFound: 'Post with given ID does not exist.'
      }
    });
    return;
  }

  next();
};

const isPostExists = async (postId: string): Promise<boolean> => {
  const validFormat = Types.ObjectId.isValid(postId);
  const post = validFormat ? await FreetCollection.findOne(postId) : '';
  return post !== null;
};

/**
 * Makes sure like does not exist yet
 */
const canCreateLike = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findLike(req.body.postId, req.session.userId);
  if (like) {
    res.status(409).json({
      error: {
        likeFound: 'User has already liked this Post.'
      }
    });
    return;
  }

  next();
};

/**
 * Makes sure like exists
 */
const likeExist = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findLike(req.params.postId, req.session.userId);
  if (!like) {
    res.status(404).json({
      error: {
        likeFound: 'User has not liked this Post.'
      }
    });
    return;
  }

  next();
};

export {
  isPostExistsBody,
  isPostExistsParams,
  canCreateLike,
  likeExist
};
