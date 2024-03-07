const { MongoClient, ServerApiVersion } = require('mongodb');

function getConnectionString (database) {
  console.log(`==> getConnectionString wordt aangeroepen`)
  // Allow the connection string builder to be overridden by an environment variable
  // We replace '{database}' in this connection string with the database we are looking for
  if (process.env.MONGO_DB_CONNECTION_STRING) {
    return process.env.MONGO_DB_CONNECTION_STRING.replace('{database}', database);
  }
  
  const host = process.env.MONGO_DB_HOST || 'localhost';
  const port = process.env.MONGODB_PORT_27017_TCP_PORT || process.env.MONGO_DB_PORT || 27017;
  const user = process.env.MONGO_DB_USER || '';
  const password = process.env.MONGO_DB_PASSWORD || '';
  const authSource = process.env.MONGO_DB_AUTHSOURCE || '';
  
  const useAuth = user && password;

  console.log(`==> connectionString: mongodb://${useAuth ? `${user}:<PASSWORD>@` : ''}${host}:${port}/${database ? database : ''}${authSource ? `?authSource=${authSource}` : ''}`)
  
  return `mongodb://${useAuth ? `${user}:${password}@` : ''}${host}:${port}/${database ? database : ''}${authSource ? `?authSource=${authSource}` : ''}`;
}

exports.getConnectionString = getConnectionString;

exports.copyMongoDb = (oldDbName, newDbName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(getConnectionString(), function(err, db) {
      if (err) {
        reject(err);
      } else {
        var mongoCommand = {
          copydb: 1,
          fromhost: "localhost",
          fromdb: oldDbName,
          todb: newDbName
        };
        var admin = db.admin();

        admin.command(mongoCommand, function(commandErr, data) {
          if (!commandErr) {
            resolve(data)
          } else {
            reject(commandErr.errmsg);
          }
          db.close();
        });
      }
    });
  });
}

exports.dbExists = (dbName) => {
  console.log(`==> Frontend gaat checken of de volgende database bestaat: ${dbName}`)
  return async (resolve, reject) => {
    console.log(`==> MongoClient.connect gaat aangeroepen worden. MongoClient: ${MongoClient}`)
    try {
      const mongoClient = new MongoClient(getConnectionString(), {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true
        }
      })
      console.log(`==> mongoClient: ${mongoClient}`)
      await mongoClient.connect((err, client) => {
        console.log(`==> Callback van de MongoClient.connect functie. client is: ${client}`)
        if (err) {
          console.log(`==> Er is een error: ${err}`)
          reject(err);
        } else {
          console.log(`==> Er is geen error. client.db().admin() gaat aangeroepen worden. client: ${client}`)
          var adminDb = client.db().admin();
          console.log(`==> adminDb: ${adminDb}`)
          // List all the available databases
          adminDb.listDatabases(function(err, dbs) {
            console.log('---> err', err);
            console.log('---> dbs.dbName', dbName);
            console.log('---> dbs.databases', dbs.databases);
            
            const found = dbs.databases.find(dbObject => dbName === dbObject.name);
            console.log(`==> found: ${found}`)
            client.close();
            resolve(!!found)
          });
        }
      });
    } catch (err) {
      console.log(`==> Error afgevangen: ${err}`)
    }
  };
}
