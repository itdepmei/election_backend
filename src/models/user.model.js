const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  second_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_image: {
    type: DataTypes.TEXT,
    allowNull:true
  },
  identity_image: {
    type: DataTypes.TEXT,
    allowNull:true
  },
  voting_card_image :{
    type: DataTypes.TEXT,
    allowNull:true
  },
  election_center_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'election_centers',
      key: 'id',
    },
  },
  governorate_id : {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'governorates',
      key: 'id',
  }
},
district_id : {
    type: DataTypes.INTEGER,
    allowNull:true,
    references: {
      model: 'districts',
      key: 'id',
  }
},
subdistrict_id :{
  type: DataTypes.INTEGER,
  allowNull:true,
  references: {
    model: 'subdistricts',
    key: 'id',
  }
},

  birth_year : {
    type: DataTypes.INTEGER,
    allowNull:true
  },
  added_by :{
    type:DataTypes.INTEGER,
    allowNull : true
  },
  can_vote: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,

  },
  has_updated_card: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  campaign_id :{
    type: DataTypes.INTEGER,
    allowNull:true,
    references:{
      model: 'campaigns',
      key: 'id',
    }
  },
  registration_type: {
    type: DataTypes.ENUM('self_registered', 'admin_added'),
    defaultValue: 'self_registered',
  },
  role: {
    type: DataTypes.ENUM(
      'voter',
      'observer',
      'coordinator',
      'center_manager',
      'district_manager',
      'finance_auditor',
      'system_admin', 
      "owner"
    ),
    allowNull: false,
    defaultValue: 'voter',
  },
  has_voted: {
    type: DataTypes.BOOLEAN,
    allowNull:true,
    defaultValue: false,
  },
  confirmed_voting :{
    type: DataTypes.BOOLEAN,
    allowNull:true,
    defaultValue:false

  },
  is_active :{
    type: DataTypes.BOOLEAN,
    allowNull:true,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  underscored: true,
  timestamps: true, 
});

module.exports = User;
