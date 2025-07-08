const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const FinanceCapital = sequelize.define("FinancialCapital" , {
    amount : {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    title : {
        type :DataTypes.STRING,
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
      campaign_id :{
    type: DataTypes.INTEGER,
    allowNull:true,
    references:{
      model: 'campaigns',
      key: 'id',
    } },
    
   
}, {
    tableName : 'financial_capitals',
    timestamps : true
})

module.exports = FinanceCapital
