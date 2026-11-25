const mongoose = require('../node_modules/mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/employees-db';

async function migrate() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const orgsCollection = mongoose.connection.collection('organizations');
  let defaultOrg = await orgsCollection.findOne({ slug: 'maruti-enterprise' });

  if (!defaultOrg) {
    const newOrg = {
      name: 'Maruti Enterprise',
      slug: 'maruti-enterprise',
      email: 'harsh.admin@example.com',
      employeeCountRange: '50-200',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        maxEmployees: 1000,
        trialEndsAt: null,
        renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      settings: {
        currency: 'INR',
        timeZone: 'Asia/Kolkata',
        fiscalYearStart: 4,
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        defaultWorkStartTime: '09:30',
        defaultWorkEndTime: '18:30',
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await orgsCollection.insertOne(newOrg);
    defaultOrg = await orgsCollection.findOne({ _id: res.insertedId });
    console.log('Created Default Organization:', defaultOrg.name, defaultOrg._id);
  } else {
    console.log('Found existing Organization:', defaultOrg.name, defaultOrg._id);
  }

  const orgId = defaultOrg._id;

  // Update users without organization
  const userRes = await mongoose.connection.collection('users').updateMany(
    { $or: [{ organization: { $exists: false } }, { organization: null }] },
    { $set: { organization: orgId } }
  );
  console.log(`Updated ${userRes.modifiedCount} users with organization`);

  // Update employees without organization
  const empRes = await mongoose.connection.collection('employees').updateMany(
    { $or: [{ organization: { $exists: false } }, { organization: null }] },
    { $set: { organization: orgId } }
  );
  console.log(`Updated ${empRes.modifiedCount} employees with organization`);

  // Update departments without organization
  const deptRes = await mongoose.connection.collection('departments').updateMany(
    { $or: [{ organization: { $exists: false } }, { organization: null }] },
    { $set: { organization: orgId } }
  );
  console.log(`Updated ${deptRes.modifiedCount} departments with organization`);

  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrate().catch(console.error);
