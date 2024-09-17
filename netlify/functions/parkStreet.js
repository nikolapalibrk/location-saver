import { MongoClient } from 'mongodb';
const uri = process.env.MONGO_URI || 'mongodb+srv://palibrknikola:qfxEbjXCc8QXVGSE@cluster0.ftd2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const handler = async (event, context) => {
  const client = new MongoClient(uri);

  try {
    const { street, order } = JSON.parse(event.body || '{}');

    if (!street) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Street name is required' }) };
    }

    await client.connect();
    const database = client.db('parking_db');
    const streetsCollection = database.collection('streets');

    // Unmark all streets
    await streetsCollection.updateMany({}, { $set: { isParked: false } });
    console.log(street)
    // Mark the selected street as parked
    await streetsCollection.updateOne({ name: street }, { $set: { isParked: true, order }, $currentDate: { lastModified: true }   });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  } finally {
    await client.close();
  }
};

export { handler };
