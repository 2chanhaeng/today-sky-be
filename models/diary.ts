import { DataTypes, Sequelize, Model } from "sequelize";
import { Diary } from "@/types/models";

export default function diary(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
) {
  return sequelize.define<Model<Diary, Diary>, Diary>(
    "diary",
    {
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
      year: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      month: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      date: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      emotion_id: {
        type: dataTypes.INTEGER,
        references: {
          model: "emotion",
          key: "id",
        },
        allowNull: true,
      },
      user_id: {
        type: dataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      tableName: "diary",
      timestamps: false,
      freezeTableName: true,
    }
  );
}
