import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb+srv://palibrknikola:qfxEbjXCc8QXVGSE@cluster0.ftd2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const handler = async (event, context) => {
  console.log(uri)
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('parking_db');
    const streetsCollection = database.collection('streets');

    const streets = await streetsCollection.find({}).toArray();
    const lastParked = await streetsCollection.findOne({ isParked: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        streets: streets.map(street => ({ name: street.name, order: street.order })),
        lastParked: lastParked?.name || null,
        date: lastParked?.lastModified || null
      }),
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
