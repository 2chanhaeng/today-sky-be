import { Sequelize, DataTypes } from "sequelize";
import process from "process";
import dotenv from "dotenv";
import configs from "@/config";
import User from "./user";
import Todo from "./todo";
import Comment from "./comment";
import Emotion from "./emotion";
import Diary from "./diary";

dotenv.config();
const env = process.env.NODE_ENV || "development";
const { database, username, password, ...config } = configs[env];
const sequelize = new Sequelize(database, username, password, config);

const user = User(sequelize, DataTypes);
const todo = Todo(sequelize, DataTypes);
const comment = Comment(sequelize, DataTypes);
const emotion = Emotion(sequelize, DataTypes);
const diary = Diary(sequelize, DataTypes);

export default {
  sequelize,
  Sequelize,
  user,
  todo,
  comment,
  emotion,
  diary,
};
