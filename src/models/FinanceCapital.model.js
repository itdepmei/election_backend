const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const FinanceCapital = sequelize.define("FinancialCapital" , {
    ammount : {
        type: DataTypes.INTEGER,
        allowNull:true
    },
    description : {
        type:DataTypes.STRING,
        allowNull:true 
    },
    added_by :{
        type:DataTypes.INTEGER,
        allowNull:true,
        references :{
            model:'users',
            key:'id'
        }
    }, 
   
}, {
    tableName : 'financial_capitals',
    timestamps : true
})

module.exports = FinanceCapital
