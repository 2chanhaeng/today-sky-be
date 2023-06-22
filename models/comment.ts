import { DataTypes, Sequelize, Model } from "sequelize";
import { Comment } from "@/types/models";

export default function comment(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
) {
  return sequelize.define<
    Model<Comment, Omit<Comment, "id" | "emotion_id">>,
    Comment
  >(
    "comment",
    {
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      content: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
      todo_id: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "todo",
          key: "id",
        },
      },
      emotion_id: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "emotion",
          key: "id",
        },
      },
    },
    {
      tableName: "comment",
      freezeTableName: true,
      timestamps: false,
    }
  );
}
