import type {HydratedDocument, Types} from 'mongoose';
import type {User} from './model';
import UserModel from './model';
import CollectionCollection from '../collection/collection';
import FollowCollection from '../follow/collection';
import LikeCollection from '../like/collection';

/**
 * This file contains a class with functionality to interact with users stored
 * in MongoDB, including adding, finding, updating, and deleting. Feel free to add
 * additional operations in this file.
 *
 * Note: HydratedDocument<User> is the output of the UserModel() constructor,
 * and contains all the information in User. https://mongoosejs.com/docs/typescript.html
 */
class UserCollection {
  /**
   * Add a new user
   *
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Promise<HydratedDocument<User>>} - The newly created user
   */
  static async addOne(username: string, password: string): Promise<HydratedDocument<User>> {
    const dateJoined = new Date();

    const user = new UserModel({username, password, dateJoined});
    await user.save(); // Saves user to MongoDB
    await CollectionCollection.create('Likes', user._id);
    return user.populate(['followers', 'following', 'collections']);
  }

  /**
   * Find a user by userId.
   *
   * @param {string} userId - The userId of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({_id: userId}).populate(['followers', 'following', 'collections']);
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsername(username: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({username: new RegExp(`^${username.trim()}$`, 'i')}).populate(['followers', 'following', 'collections']);
  }

  /**
   * Find a user by username (case insensitive).
   *
   * @param {string} username - The username of the user to find
   * @param {string} password - The password of the user to find
   * @return {Promise<HydratedDocument<User>> | Promise<null>} - The user with the given username, if any
   */
  static async findOneByUsernameAndPassword(username: string, password: string): Promise<HydratedDocument<User>> {
    return UserModel.findOne({
      username: new RegExp(`^${username.trim()}$`, 'i'),
      password
    }).populate(['followers', 'following', 'collections']);
  }

  /**
   * Find a all user ids that username is following
   *
   * @param {string} username - The username to get all following for
   * @return {Promise<HydratedDocument<User>[]>} - The newly created follow
   */
  static async findFollowing(username: string): Promise<Array<HydratedDocument<User>>> {
    const following = await FollowCollection.findFollowing(username);
    const followUsers = Promise.all(following.map(async follow => UserModel.findOne({_id: follow.followedId})));
    return followUsers;
  }

  /**
   * Find a all user ids that username is following
   *
   * @param {string} username - The username to get all following for
   * @return {Promise<HydratedDocument<Follow>[]>} - The newly created follow
   */
  static async findFollowers(username: string): Promise<Array<HydratedDocument<User>>> {
    const followers = await FollowCollection.findFollowers(username);
    const followUsers = Promise.all(followers.map(async follow => UserModel.findOne({_id: follow.followerId})));
    return followUsers;
  }

  /**
   * Update user's information
   *
   * @param {string} userId - The userId of the user to update
   * @param {Object} userDetails - An object with the user's updated credentials
   * @return {Promise<HydratedDocument<User>>} - The updated user
   */
  static async updateOne(userId: Types.ObjectId | string, userDetails: {password?: string; username?: string}): Promise<HydratedDocument<User>> {
    const user = await UserModel.findOne({_id: userId});
    if (userDetails.password) {
      user.password = userDetails.password;
    }

    if (userDetails.username) {
      user.username = userDetails.username;
    }

    await user.save();
    return user.populate(['followers', 'following', 'collections']);
  }

  /**
   * Delete a user from the collection.
   *
   * @param {string} userId - The userId of user to delete
   * @return {Promise<Boolean>} - true if the user has been deleted, false otherwise
   */
  static async deleteOne(userId: Types.ObjectId | string): Promise<boolean> {
    const user = await UserModel.deleteOne({_id: userId});
    await FollowCollection.deleteUser(userId);
    await CollectionCollection.deleteUser(userId);
    await LikeCollection.deleteUser(userId);
    return user !== null;
  }
}

export default UserCollection;
