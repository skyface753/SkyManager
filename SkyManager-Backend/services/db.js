const mysql = require('mysql2/promise');
const config = require('../config');

var retryCounter = 0;
async function query(sql, params) {
  try{
    if(process.env.MODE == "TEST"){
      console.log("SQL Query: " + sql)
      console.log("SQL Params: " + JSON.stringify(params))
      console.log("DB CONFIG: " + JSON.stringify(config.db))
    }
    const connection = await mysql.createConnection(config.db);
    const [results, ] = await connection.execute(sql, params);
    await connection.end();
    // if(process.env.MODE == "TEST"){
    //   console.log("Result:" + results);
    // }
    retryCounter = 0;
    return results;
  } catch(error){
    retryCounter++;
    if(retryCounter < 3){
      console.log("Retry: " + retryCounter)
      setTimeout(function(){
      return query(sql, params);
      }, 2000);
    }else{
      retryCounter = 0;
    console.log("Error in SQL Query " + error)
    return {"Result": error};
    }
  }
}

module.exports = {
  query
}



// // const mysql = require("mysql2/promise");
// const dbConfig = require('../config').db;
// var mysql = require('mysql');
// var pool  = mysql.createPool({
//   connectionLimit : 10,
//   host: dbConfig.host,
//   user: dbConfig.user,
//   password: dbConfig.password,
//   database: dbConfig.database,
//   debug: false,
//   multipleStatements: true,
//   waitForConnections: true

// });

// async function query(sql, params) {
//   try{
//     pool.query(sql, function (error, results, fields) {
//       if (error) throw error;
//       return results;
//     }
      
//     );
//   } catch(error){
//     console.log("Error in SQL Query")
//     return {"Result": error};
//   }
// }

// module.exports = {
//   query
// }