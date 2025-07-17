const User = require("../models/user.model");
const ElectionCenter = require("../models/ElectionCenter.model");
const bcrypt = require("bcrypt");
const { stripPassword } = require("../utils/stripPassword");
const sequelize = require("../config/database");
const DistrictManagerElectionCenter = require("../models/DistrictManagerElectionCenter");
const DistrictManager = require("../models/DistrictManager.model")



exports.addDistrictManager = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      email,
      phone_number,
      password,
      first_name,
      second_name,
      last_name,
      role = "district_manager",
      is_active,
      birth_year,
      election_center_id,
      district_id,
      governorate_id,
      subdistrict_id,
      has_voted,
      confirmed_voting,
      has_updated_card,
      can_vote,
      profile_image,
      identity_image,
      voting_card_image,
      election_centers_id = [],
    } = req.body;

    // Print raw incoming data
    // Handle file uploads if using multer
    const profileImageFile = req.files?.profile_image?.[0]?.filename || null;
    const identityImageFile = req.files?.identity_image?.[0]?.filename || null;
    const cardImageFile = req.files?.voting_card_image?.[0]?.filename || null;

    // Required fields
    if (!phone_number || !password) {
      await transaction.rollback();
      return res.status(400).json({ message: "رقم الهاتف وكلمة المرور مطلوبة" });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      where: { phone_number },
      transaction,
    });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ message: "رقم الهاتف موجود بالفعل" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Create user
    const newUser = await User.create(
      {
        email,
        phone_number,
        password_hash: hashedPassword,
        first_name,
        second_name,
        last_name,
        birth_year,
        role,
        election_center_id: election_center_id || null,
        profile_image: profileImageFile || profile_image || null,
        identity_image: identityImageFile || identity_image || null,
        voting_card_image: cardImageFile || voting_card_image || null,
        governorate_id: governorate_id || null,
        district_id: district_id || null,
        subdistrict_id: subdistrict_id || null,
        has_voted: has_voted === "true" || has_voted === true,
        confirmed_voting: confirmed_voting === "true" || confirmed_voting === true,
        has_updated_card: has_updated_card === "true" || has_updated_card === true,
        can_vote: can_vote === "true" || can_vote === true,
        is_active: is_active !== undefined ? is_active : true,
        registration_type: "admin_added",
      },
      { transaction }
    );

    const district_manager = await DistrictManager.create(
      { user_id: newUser.id },
      { transaction }
    );

    // Handle election center IDs
    let centers = [];

    if (Array.isArray(election_centers_id)) {
      centers = election_centers_id;
    } else if (typeof election_centers_id === "string") {
      try {
        // Try to parse JSON string like "[1,2]"
        centers = JSON.parse(election_centers_id);
      } catch {
        // Fallback to splitting comma-separated string
        centers = election_centers_id.split(",");
      }
    } else if (election_centers_id) {
      centers = [election_centers_id];
    }

    // Clean IDs: convert to numbers & filter invalid ones
    centers = centers.map((id) => Number(id)).filter(Boolean);


    // Insert election center links
    for (const centerId of centers) {
      const center = await ElectionCenter.findByPk(centerId, { transaction });

      if (!center) {
        await transaction.rollback();
        return res.status(404).json({ message: `المركز الانتخابي غير موجود: ${centerId}` });
      }

      try {
        await DistrictManagerElectionCenter.create(
          {
            district_manager_id: district_manager.id,
            election_center_id: centerId,
          },
          { transaction , validate: false },
          
        );
      } catch (linkErr) {
        console.error("❌ Error linking district manager to center:", linkErr.message);
        await transaction.rollback();
        return res.status(500).json({
          message: "فشل في ربط المرتكز بالمركز الانتخابي",
          error: linkErr.message,
        });
      }
    }

    // All good — commit!
    await transaction.commit();

    return res.status(201).json({
      data:{ ...stripPassword(newUser), district_manager_id : district_manager.id}
      
    });
  } catch (err) {
    console.error("💥 Failed to add :", err);
    await transaction.rollback();
    return res.status(500).json({
      message: "فشل في إضافة مدير قضاء",
      error: err.message,
    });
  }
};


exports.getAllDistrictManagers = async (req, res) => {
  try {
    const district_managers = await DistrictManager.findAll({
      attributes: { exclude: ['user_id'] },
      include: [
        {
          model: User,
          // راح نستخدم stripPassword بعدين
        },
        {
          model: ElectionCenter,
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!district_managers || district_managers.length === 0) {
      return res.status(404).json({ message: "لم يتم العثور على مدراء اقضية" });
    }

    // نطبق stripPassword فقط على كل Coordinator.User
    const clean_district_managers = district_managers.map((item) => {
      const district_managerJSON = item.toJSON(); // نحول لكائن عادي
      if (district_managerJSON.User) {
        district_managerJSON.User = stripPassword(district_managerJSON.User);
      }
      return district_managerJSON;
    });

    res.status(200).json({ data: clean_district_managers });
  } catch (error) {
    console.error("خطأ في جلب مدراء اقضية:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب ", error: error.message });
  }
};


exports.GetDistrictManagersbyId = async (req, res) => {
  const { id}  = req.params
  try {
    const district_manager = await DistrictManager.findByPk( id , {
      attributes: { exclude: ['user_id'] },
      include: [
        {
          model: User,
          // راح نستخدم stripPassword بعدين
        },
        {
          model: ElectionCenter,
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!district_manager || district_manager.length === 0) {
      return res.status(404).json({ message: "لم يتم العثور على مدراء اقضية" });
    }

    // نطبق stripPassword فقط على كل Coordinator.User
    const  district_managerJSON = stripPassword(district_manager.User);
      
    res.status(200).json({ data: district_managerJSON });
  } catch (error) {
    console.error("خطأ في جلب مدراء اقضية:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب ", error: error.message });
  }
};

exports.updateDistrictManager = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      email,
      phone_number,
      password,
      first_name,
      second_name,
      last_name,
      birth_year,
      election_center_id,
      district_id,
      governorate_id,
      subdistrict_id,
      has_voted,
      confirmed_voting,
      has_updated_card,
      can_vote,
      is_active,
      election_centers_id,
    } = req.body;

    // الصور
    const profileImageFile = req.files?.profile_image?.[0]?.filename || null;
    const identityImageFile = req.files?.identity_image?.[0]?.filename || null;
    const cardImageFile = req.files?.voting_card_image?.[0]?.filename || null;

    // جلب المرتكز
    const district_manager = await DistrictManager.findByPk(id, {
      include: [User],
      transaction,
    });

    if (!district_manager || !district_manager.User) {
      await transaction.rollback();
      return res.status(404).json({ message: "مدير قضاء غير موجود" });
    }

    // تعديل الحقول فقط إذا تم إرسالها
    const updatedFields = {
      ...(email !== undefined && { email }),
      ...(phone_number !== undefined && { phone_number }),
      ...(first_name !== undefined && { first_name }),
      ...(second_name !== undefined && { second_name }),
      ...(last_name !== undefined && { last_name }),
      ...(birth_year !== undefined && { birth_year }),
      ...(election_center_id !== undefined && { election_center_id }),
      ...(governorate_id !== undefined && { governorate_id }),
      ...(district_id !== undefined && { district_id }),
      ...(subdistrict_id !== undefined && { subdistrict_id }),
      ...(has_voted !== undefined && { has_voted: has_voted === "true" || has_voted === true }),
      ...(confirmed_voting !== undefined && { confirmed_voting: confirmed_voting === "true" || confirmed_voting === true }),
      ...(has_updated_card !== undefined && { has_updated_card: has_updated_card === "true" || has_updated_card === true }),
      ...(can_vote !== undefined && { can_vote: can_vote === "true" || can_vote === true }),
      ...(is_active !== undefined && { is_active }),
      ...(password && { password_hash: await bcrypt.hash(password, 10) }),
      ...(profileImageFile && { profile_image: profileImageFile }),
      ...(identityImageFile && { identity_image: identityImageFile }),
      ...(cardImageFile && { voting_card_image: cardImageFile }),
    };

    await district_manager.User.update(updatedFields, { transaction });

    // فقط إذا تم إرسال election_centers_id، حدث العلاقة
    if (req.body.election_centers_id !== undefined) {
      let centers = [];
      if (Array.isArray(election_centers_id)) {
        centers = election_centers_id;
      } else if (typeof election_centers_id === "string") {
        try {
          centers = JSON.parse(election_centers_id);
        } catch {
          centers = election_centers_id.split(",");
        }
      }

      centers = centers.map((id) => Number(id)).filter(Boolean);

      await district_manager.setElectionCenters([], { transaction });
      const validCenters = await ElectionCenter.findAll({
        where: { id: centers },
        transaction,
      });
      await district_manager.addElectionCenters(validCenters, { transaction });
    }

    await transaction.commit();

    // إرجاع البيانات بعد التعديل
    const district_manager_data = await DistrictManager.findByPk(id, {
      attributes: { exclude: ['user_id'] },
      include: [
        {
          model: User,
          attributes: { exclude: ['password_hash'] },
        },
        {
          model: ElectionCenter,
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({ data: district_manager_data });
  } catch (err) {
    await transaction.rollback();
    console.error("Failed to update coordinator:", err);
    res.status(500).json({
      message: "فشل في تعديل مدير القضاء",
      error: err.message,
    });
  }
};

// exports.deleteAllCoordinators = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     // جلب كل المرتكزين مع المستخدمين
//     const coordinators = await Coordinator.findAll({
//       include: [User],
//       transaction,
//     });

//     // حذف روابط المراكز الانتخابية لكل مرتكز
//     for (const coordinator of coordinators) {
//       await coordinator.setElectionCenters([], { transaction });
//     }

//     // حذف المرتكزين
//     await Coordinator.destroy({ where: {}, transaction });

//     // حذف كل المستخدمين المرتبطين (نفترض أن المرتكز يربط مع المستخدم مباشرة)
//     for (const coordinator of coordinators) {
//       if (coordinator.User) {
//         await coordinator.User.destroy({ transaction });
//       }
//     }

//     await transaction.commit();

//     return res.status(200).json({ message: "تم حذف كل المرتكزين بنجاح" });
//   } catch (err) {
//     await transaction.rollback();
//     console.error("فشل في حذف المرتكزين:", err);
//     return res.status(500).json({ message: "فشل في حذف المرتكزين", error: err.message });
//   }
// };


exports.deletedDistrictManager = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // جلب المرتكز مع المستخدم
    const district_manager = await DistrictManager.findByPk(id, {
      include: [User],
      transaction,
    });

    if (!district_manager) {
      await transaction.rollback();
      return res.status(404).json({ message: "مدير قضاء غير موجود" });
    }

    // حذف روابط المراكز الانتخابية أولاً (إلا إذا عندك ON DELETE CASCADE)
    await district_manager.setElectionCenters([], { transaction });

    // حذف المرتكز نفسه
    await district_manager.destroy({ transaction });

    // حذف المستخدم المرتبط
    if (district_manager.User) {
      await coordinator.User.destroy({ transaction });
    }

    await transaction.commit();

    return res.status(200).json({ message: "تم حذف مدير القضاء بنجاح" });
  } catch (err) {
    await transaction.rollback();
    console.error("فشل في حذف :", err);
    return res.status(500).json({ message: "فشل في حذف ", error: err.message });
  }
};


