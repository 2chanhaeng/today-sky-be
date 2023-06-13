import { DataTypes, Sequelize, Model } from "sequelize";
import { Emotion } from "@/types/models";

export default function emotion(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
) {
  return sequelize.define<Model<Emotion, Emotion>, Emotion>(
    "emotion",
    {
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      feel: {
        type: dataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "emotion",
      freezeTableName: true,
      timestamps: false,
    }
  );
}
