const User = require("../models/user.model")
const Campaign  = require('../models/Campain.model')

exports.createCampaign = async (req, res) => {
  try {
    // نستخرج المعلومات من الـ request
    const { name, description } = req.body;
    const user = req.user;

    // تحقق أن المستخدم فعلاً Campaign Manager
    if (user.role !== 'owner') {
      return res.status(403).json({ message: 'غير مصرح لك بإنشاء حملة' });
    }

    // إنشئ الحملة
    const campaign = await Campaign.create({
      name,
      description,
      created_by: user.id,
    });

    // اربط المستخدم بهاي الحملة (إذا بعده ما مرتبط)
    await User.update(
      { campaign_id: campaign.id },
      { where: { id: user.id } }
    );

    res.status(201).json({
      data: campaign,
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحملة:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحملة', error });
  }
};



exports.getAllCampaigns = async (req, res) => {
  try {
    const user = req.user;

    // تحقق أن المستخدم Admin
    if (user.role !== 'system_admin') {
      return res.status(403).json({ message: 'غير مصرح لك بعرض الحملات' });
    }

    const campaigns = await Campaign.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'first_name' , 'last_name', 'phone_number'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'تم جلب الحملات بنجاح',
      data: campaigns,
    });
  } catch (error) {
    console.error('خطأ في جلب الحملات:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الحملات', error });
  }
};
