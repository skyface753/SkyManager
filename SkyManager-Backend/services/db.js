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
      return {"Result": "Error"};
    }
  }
}

module.exports = {
  query
}


