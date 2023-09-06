const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');


const handleStatusCodes = (rows) => {
  console.log("API Calls by Status Codes: ")
  let errorCodes = {}

  rows.forEach((row) => {
    if (row.includes("HTTP")) {
        let index = row.indexOf("HTTP") + 10
        let errorCode = row.substring(index, index + 3)
        if (errorCode in errorCodes) errorCodes[errorCode]++
        else if (errorCode.length == 3 && errorCode != "- -") errorCodes[errorCode] = 1
    }
  });
  console.table(errorCodes)
  console.log("\n\n")
}

const handleAPIEndpoints = (rows) => {
  console.log("API Calls by Endpoints: ")
  let endpoints = {}

  rows.every((row, index) => {
    if (row.includes("POST ")) {
        let index = row.indexOf("POST ") + 5
        let endpoint = row.substring(row.indexOf('/', index), row.indexOf(' ', index+1))

        if (endpoint.includes("/api/v2/follow")) endpoint = "/api/v2/follow/:id"
        if (endpoint.includes("/api/v2/unfollow")) endpoint = "/api/v2/unfollow/:id"
        if (endpoint.includes("/api/member/request/")) endpoint = "/api/member/request/:id/un-follow"
        if (endpoint.includes("/api/post/")) endpoint = "/api/post/:id/comment"
        if (endpoint.includes("/api/message/")) {
          let temp = endpoint.split("/")
          endpoint = "/api/message/:id/" + temp[temp.length - 1]
        }
        if (endpoint[endpoint.length - 1] === '?') endpoint = endpoint.substring(0, endpoint.length - 1)
        if (endpoint.includes("jobrole")) endpoint = "/api/job/:id/jobrole"
        if (endpoint.includes("/api/auth/verifyotp/")) endpoint = "/api/auth/verifyotp/:id"

        endpoint = "POST " + endpoint
        if (endpoint in endpoints) endpoints[endpoint]++
        else endpoints[endpoint] = 1
    }

    if (row.includes("PUT ")) {
      let index = row.indexOf("PUT ") + 4
      let endpoint = row.substring(row.indexOf('/', index), row.indexOf(' ', index+1))

      if (endpoint.includes("/api/notification") || endpoint.includes("/api//notification")) endpoint = "/api/notification/:id"
      if (endpoint.includes("/api/user/experience/")) endpoint = "/api/user/experience/:id"
      if (endpoint.includes("/api/user/education/")) endpoint = "/api/user/education/:id"
      if (endpoint.includes("/api/user/award/")) endpoint = "/api/user/award/:id"
      if (endpoint.includes("/api/business/job/")) endpoint = "/api/business/job/:id"
      if (endpoint.includes("/api/post") || endpoint.includes("/api//post")) endpoint = "/api/post/:id/saved"
      if (endpoint.includes("/api/user/certificate")) endpoint = "/api/user/certificate/:id"
      if (endpoint.includes("/api/job")) endpoint = "/api/job/:id/usersaved"
      if (endpoint.includes("/api/auth/resetpassword")) endpoint = "/api/auth/resetpassword/:id"

      endpoint = "PUT " + endpoint
      if (endpoint in endpoints) endpoints[endpoint]++
      else endpoints[endpoint] = 1
    }

    if (row.includes("DELETE ")) {
    let index = row.indexOf("DELETE ") + 7
    let endpoint = row.substring(row.indexOf('/', index), row.indexOf(' ', index+1))

    if (endpoint.includes("/api//post") || endpoint.includes("/api/post")) endpoint = "/api/post/:id"
    if (endpoint.includes("/api/user/experience/")) endpoint = "/api/user/experience/:id"
    if (endpoint.includes("/api/notification") || endpoint.includes("/api//notification")) endpoint = "/api/notification/:id"
    if (endpoint.includes("/api/user/education/")) endpoint = "/api/user/education/:id"
    if (endpoint.includes("/api/user/certificate")) endpoint = "/api/user/certificate/:id"
    if (endpoint.includes("/api/user/project")) endpoint = "/api/user/project/:id"

    endpoint = "DELETE " + endpoint
    if (endpoint in endpoints) endpoints[endpoint]++
    else endpoints[endpoint] = 1
    }

    if (row.includes("GET ")) {
  let index = row.indexOf("GET ") + 4
  let endpoint = row.substring(row.indexOf('/', index), row.indexOf(' ', index))

  if (endpoint.includes("+")) return
  if (endpoint.includes("?")) endpoint = endpoint.substring(0, endpoint.indexOf("?"))

  let temp = endpoint.split("/")
  let modified = ""
  temp.map((segment) => {
    if (segment.includes(".") || /\d/.test(segment)) modified = modified + ":id/"
    else if (segment != undefined && segment != "") modified = modified + segment + "/"
  })

  endpoint = modified
  if (endpoint == "") endpoint = "/"

  endpoint = "GET " + endpoint
  if (endpoint in endpoints) endpoints[endpoint]++
  else endpoints[endpoint] = 1
    }
    
    //limiting so that the entire output is visible (this can be removed to view the whole data)
    if (index > 50000) return false 
    else return true

  });


  console.table(endpoints)
  console.log("\n\n")

}

const handleAPICallsByMinute = (rows) => {
  console.log("API calls per minute: ")
  let timestamps = {}
  let i = 0

  rows.every((row, index) => {

    let timestamp = row.substring(0, row.indexOf("+"))
    
    if (timestamp in timestamps) timestamps[timestamp]++
    else if (timestamp.length <= 17) timestamps[timestamp] = 1

    //limiting so that the entire output is readable (this can be removed to view the whole data)
    if (index > 500) return false
    else return true
  })

  console.table(timestamps)
}

const readCSVFile = (filePath) => {
    const rows = [];
    const fileStream = fs.createReadStream(filePath, 'utf8');
  
    fileStream.on('data', (chunk) => {
      // Split the chunk into rows based on newline characters
      const lines = chunk.split('\n');
  
      // Add each line (row) to the rows array
      lines.forEach((line) => {
        rows.push(line);
      });
    });
  
    fileStream.on('end', () => {
      handleStatusCodes(rows)
      handleAPIEndpoints(rows)
      handleAPICallsByMinute(rows)
    });
  
    fileStream.on('error', (error) => {
      console.error('Error reading the CSV file:', error);
    });
  };
  

const run = async () => {
  console.log("\n\n")
  const csvFilePath = "data.csv"
  readCSVFile(csvFilePath)
};

run();
