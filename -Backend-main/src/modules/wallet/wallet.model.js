const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.db");

const Wallet = sequelize.define("Wallet", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    totalDeposit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    totalWithdraw: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    frozenBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    }
}, {
    tableName: "wallets",
    timestamps: true
});

module.exports = Wallet;
