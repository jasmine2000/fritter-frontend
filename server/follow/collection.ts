import type {HydratedDocument, Types} from 'mongoose';
import UserCollection from '../user/collection';
import type {Follow} from './model';
import FollowModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FollowCollection {
  /**
   * Create a follow
   *
   * @param {string} followerId - The id of the user following
   * @param {string} followedId - The id of the user being followed
   * @return {Promise<HydratedDocument<Follow>>} - The newly created follow
   */
  static async createFollow(followerId: Types.ObjectId | string, followedId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    const follow = new FollowModel({
      followerId,
      followedId
    });
    await follow.save();
    return follow;
  }

  /**
   * Find a follow by id
   *
   * @param {string} followId - The id of the follow to find
   * @return {Promise<HydratedDocument<Follow>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(followId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
    return FollowModel.findOne({_id: followId});
  }

  /**
   * Find a follow by follower/followed ids
   *
   * @param {string} followerId - The id of the user following
   * @param {string} followedId - The id of the user being followed
   * @return {Promise<HydratedDocument<Follow>>} - The newly created follow
   */
  static async findFollow(followerId: Types.ObjectId | string, followedId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    return FollowModel.findOne({followerId, followedId});
  }

  /**
   * Find a all user ids that username is following
   *
   * @param {string} username - The username to get all following for
   * @return {Promise<HydratedDocument<Follow>[]>} - The newly created follow
   */
  static async findFollowing(username: string): Promise<Array<HydratedDocument<Follow>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FollowModel.find({_id: {$in: user.following}});
  }

  /**
   * Find a all user ids that username is following
   *
   * @param {string} username - The username to get all following for
   * @return {Promise<HydratedDocument<Follow>[]>} - The newly created follow
   */
  static async findFollowers(username: string): Promise<Array<HydratedDocument<Follow>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FollowModel.find({_id: {$in: user.followers}});
  }

  /**
   * Find a like by postid and userid
   *
   * @param {string} postId - The id of the post to like
   * @param {string} userId - The id of the liker
   * @return {Promise<Boolean>} - true if the follow has been deleted, false otherwise
   */
  static async findAndDeleteOne(followerId: Types.ObjectId | string, followedId: Types.ObjectId | string): Promise<boolean> {
    const follow = await FollowModel.findOneAndDelete({followerId, followedId});
    return follow !== null;
  }

  /**
   * Delete all follows that include a user
   *
   * @param {string} userId - The id of the liker
   */
  static async deleteUser(userId: Types.ObjectId | string): Promise<void> {
    await FollowModel.deleteMany({followerId: userId});
    await FollowModel.deleteMany({followedId: userId});
  }
}

export default FollowCollection;
