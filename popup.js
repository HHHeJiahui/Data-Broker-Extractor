const ip_port = '34.67.71.239:8080'
// const ip_port = '10.5.126.127:8080'
// const ip_port = '127.0.0.1:8080'


const Incogni_key_list = ["broker.title", "state", "broker.sensitivity", "broker.recurringTaskIntervalDays", "broker.avgResolutionTimeInDays", 
"broker.complianceScore", "broker.createdAt", "broker.updatedAt", "recurringDate", "recurringCycles", 
"createdAt", "updatedAt", "recurring"]

const DataSeal_key_list = ["brokerId", "brokerUrl", "createdAt", "submittedAt", "confirmedAt", "verifiedAt", "isStuck"]

const Optery_key_list = ["databroker.name", "databroker.exposure_confidence", "is_complete", 
"is_pending", "plan", "tier", "removal_status", "exposure", "updated_at"]

const Kanary_key_list = ["site.domain", "status", "created_at", "updated_at", "last_submitted_at", 
"latest_event.created_at", "latest_event.meta.failed", "latest_event.meta.reason", "google_search", "automated", "manually_added"]

const Mozilla_key_list = ['Company', 'Exposure type', 'Date of the exposure', 'Status']


var broker_data;
var stat_data;
var service;
var current_email;
var timestamp;
var fetch_data_time;
var valid_count;
var is_valid;
var subscription_data;
var send_data = {};
var error_data;



document.addEventListener('DOMContentLoaded', function() {
  const userIdInput_1 = document.getElementById('email_1');
  const userIdInput_2 = document.getElementById('email_2');
  const errorElement_1 = document.getElementById('idError_1');
  const errorElement_2 = document.getElementById('idError_2');

  const verifyBotton = document.getElementById('verify');
  const verifyResult = document.getElementById('verify_result');

  const sendButton = document.getElementById('send');
  const reportErrorButton = document.getElementById('error');
  const sendErrorButton = document.getElementById('errorReport');

  const projectIntro = document.getElementById("projectIntro");
  const collBotton1 = document.getElementById("collBotton1");
  const collBotton2 = document.getElementById("collBotton2");
  const dataTableBotton = document.getElementById("dataTable");

  const processButton = document.getElementById('processButton');
  const inputField = document.getElementById('inputField');

  var random_code = null;

  window.onload = function() {
    // Set pre-input email address into input box
    userIdInput_1.value = localStorage.getItem('emailaddress') || '';
    userIdInput_2.value = localStorage.getItem('emailaddress') || '';

    current_email = localStorage.getItem('emailaddress') || '';

    errorElement_1.textContent = userIdInput_1.value !== '' ? '' : 'Please input correct Email address.';
    errorElement_2.textContent = userIdInput_2.value !== '' ? '' : 'Please input correct Email address.';

    verifyBotton.disabled = userIdInput_1.value !== '' ? false : true;
    sendButton.disabled = userIdInput_2.value !== '' ? false : true;
    reportErrorButton.disabled = userIdInput_2.value !== '' ? false : true;

    // Set task 1 state
    document.getElementById("task1_state").textContent = localStorage.getItem('task1_state') || '(To be verified)';
    document.getElementById("task1_state").style = localStorage.getItem('task1_state_style') || 'font-weight: bold; color: #f6db46;';

    // Set task 2 state

    const curr_send_times = localStorage.getItem('send_times') || '0';

    if (curr_send_times !== '0') {
      document.getElementById("task2_state").textContent = '(Send times: ' + curr_send_times + ')';
      document.getElementById("task2_state").style = localStorage.getItem('task2_state_style') || 'font-weight: bold; color: #f6db46;';
    }
    else {
      document.getElementById("task2_state").textContent = localStorage.getItem('task2_state') || '(To be send)';
      document.getElementById("task2_state").style = localStorage.getItem('task2_state_style') || 'font-weight: bold; color: #f6db46;';
    }
  };

  // Input Email in task 1 and verify
  userIdInput_1.addEventListener('input', function() {
    const userId = userIdInput_1.value.trim();
    userIdInput_2.value = userId
    current_email = userId;
    // const isValid = userId.length > 0;
    verifyBotton.disabled = userId.length > 0 ? false : true;
    errorElement_1.textContent = userId.length > 0 ? '' : 'Please input correct Email address.';
    errorElement_2.textContent = userId.length > 0 ? '' : 'Please input correct Email address.';
    localStorage.setItem('emailaddress', userId);
  });

  // Input Email in task 2 and verify
  userIdInput_2.addEventListener('input', function() {
    const userId = userIdInput_2.value.trim();
    userIdInput_1.value = userId
    current_email = userId;
    // const isValid = userId.length > 0;
    sendButton.disabled = userId.length > 0 ? false : true;
    reportErrorButton.disabled = userId.length > 0 ? false : true;
    errorElement_1.textContent = userId.length > 0 ? '' : 'Please input correct Email address.';
    errorElement_2.textContent = userId.length > 0 ? '' : 'Please input correct Email address.';
    localStorage.setItem('emailaddress', userId);
  });
  
  // collapse project intro
  projectIntro.addEventListener('click', function() {
    this.classList.toggle("active");
    var intro = document.getElementById("introContent");
    if (intro.style.display === "block") {
      intro.style.display = "none";
    } else {
      intro.style.display = "block";
    }
  });

  // collapse task 1
  collBotton1.addEventListener('click', function() {
    this.classList.toggle("active");
    var content1 = document.getElementById("task1Content");
    if (content1.style.display === "block") {
      content1.style.display = "none";
    } else {
      content1.style.display = "block";
    }
  });

  // collapse task 2
  collBotton2.addEventListener('click', function() {
    this.classList.toggle("active");
    var content2 = document.getElementById("task2Content");
    if (content2.style.display === "block") {
      content2.style.display = "none";
    } else {
      content2.style.display = "block";
    }
  });

  // data table
  dataTableBotton.addEventListener('click', function() {
    this.classList.toggle("active");
    var table = document.getElementById("dataTableContent");
    if (table.style.display === "block") {
      table.style.display = "none";
    } else {
      table.style.display = "block";
    }
  });

  // Check the subsription status
  verifyBotton.addEventListener('click', function() {
    chrome.storage.local.get(['is_subscribe'], (result) => {
      if (result.is_subscribe === true) {
        sendSubscription();
      }
      if (result.is_subscribe === false) {
        verifyResult.textContent = 'Failed to verify subscription.';
        verifyResult.style = 'color: #FF003C; font-size: 18px;'
      }
    });
  });

  // Send Data
  sendButton.addEventListener('click', function() {
    sendData();
  });

  reportErrorButton.addEventListener('click', function() {
    const div = document.getElementById('errorOption');
    if (div.style.display === 'block') {
      div.style.display = 'none'
    }
    else {
      div.style.display = 'block';
    }
    document.getElementById('completion_code_2').textContent = ''
    document.getElementById('result').textContent = ''
  });

  sendErrorButton.addEventListener('click', function() {
    sendErrorData();
  });

  inputField.addEventListener('input', function() {
    processButton.disabled = inputField.value === ''
  });

});

// Display remove data on extension
document.addEventListener('DOMContentLoaded', function() {
  const contentElement = document.getElementById('table-container');
  const stat = document.getElementById('remove_stat');
  const inputField = document.getElementById('inputField');
  const processButton = document.getElementById('processButton');
  const fetchDataTimeIndicator = document.getElementById('fetchDataTime');

  chrome.storage.local.get(['service_flag', 'statData', 'fetchData', 'brokerData', 'removedData', 'blockedData', 'update_time'], (result) => {


    // Incogni
    if (result.service_flag === "Incogni") {
      // Print stat data
      if (result.statData) {
        const temp_total_send = result.statData.progressSummary.sent;
        const temp_completed = result.statData.progressSummary.completed;
        const temp_inProgress = result.statData.progressSummary.inProgress;
        const temp_suppressed = result.statData.suppressedBrokers;
        const temp_savedminutes = result.statData.savedMinutes;
        const temp_hours = Math.floor(temp_savedminutes / 60);
        const temp_minutes = temp_savedminutes % 60;
        stat.textContent = "Total send: " + temp_total_send + ", Completed: " + temp_completed + 
        ", In progress: " + temp_inProgress + ", Suppressed: " + temp_suppressed + 
        ", Saved time: " + temp_hours + "hours " + temp_minutes + "minutes";
      } else {
        stat.textContent = 'No statistics available.';
      }

      // Print removal progress as table
      if (result.fetchData) {
        const flattenedData = result.fetchData.map(item => flattenObject(item));
        const filteredData = filterData(flattenedData, Incogni_key_list);
        contentElement.appendChild(createHtmlTable(filteredData, Incogni_key_list));
        
        broker_data = filteredData;
        stat_data = result.statData;
        service = "Incogni";
        fetch_data_time = result.update_time;
        valid_count = countValidObject(filteredData, 'broker.title');
        is_valid = countValidObject(filteredData, 'broker.title') > filteredData.length * 0.8

        const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
        fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      } else {
        contentElement.innerHTML = "<p>No data available. Please refresh the page.<p>";
        contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // DataSeal
    else if (result.service_flag === "DataSeal") {
      // Print stat data
      if (result.statData) {
        const temp_scan = result.statData.nScans;
        const temp_found = result.statData.nRecordsFound
        const temp_remove = result.statData.nRecordsRemoved
        stat.textContent = "Number of scans: " + temp_scan + ", Total records found: " + temp_found + 
        ", Total records removed: " + temp_remove;
      } else {
        stat.textContent = 'No statistics available.';
      }

      // Print removal progress as table
      if (result.fetchData && result.brokerData) {
        // Replace brokerId with broker name
        result.fetchData.forEach(record => {
          result.brokerData.forEach(brokerInfo => {
            if (brokerInfo.id === record.brokerId) {
              record.brokerId = brokerInfo.name
              record.brokerUrl = brokerInfo.url
            }
          });
        });
        const filteredData = filterData(result.fetchData, DataSeal_key_list);
        contentElement.appendChild(createHtmlTable(filteredData, DataSeal_key_list));

        broker_data = filteredData;
        stat_data = result.statData;
        service = "DataSeal";
        fetch_data_time = result.update_time;
        valid_count = countValidObject(filteredData, 'brokerId');
        is_valid = countValidObject(filteredData, 'brokerId') > filteredData.length * 0.8;

        const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
        fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      } else {
        contentElement.innerHTML = "<p>No data available. Please refresh the page.<p>";
        contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Optery
    else if (result.service_flag === "Optery") {
      if (result.statData) {
        const temp_broker = result.statData.db_covered;
        const temp_exposure = result.statData.exposure_matches;
        const temp_notfound = result.statData.exposure_notfound;
        const temp_removed = result.statData.protection_removed;
        const temp_inprogress = result.statData.protection_in_progress;
        const temp_pending = result.statData.protection_pending;
        stat.textContent = "Total data brokers: " + temp_broker + ", Exposure found: " + temp_exposure + 
        ", Exposure not found: " + temp_notfound + ", Removed: " + temp_removed + 
        ", In progress: " + temp_inprogress + ", Pending: " + temp_pending;
      } else {
        stat.textContent = 'No statistics available.';
      }

      // Print removal progress as table
      if (result.fetchData) {
        const flattenedData = result.fetchData.map(item => flattenObject(item));
        const filteredData = filterData(flattenedData, Optery_key_list);
        contentElement.appendChild(createHtmlTable(filteredData, Optery_key_list));

        broker_data = filteredData;
        stat_data = result.statData;
        service = "Optery";
        fetch_data_time = result.update_time;
        valid_count = countValidObject(filteredData, 'databroker.name');
        is_valid = countValidObject(filteredData, 'databroker.name') > filteredData.length * 0.8;

        const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
        fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      } else {
        contentElement.innerHTML = "<p>No data available. Please refresh the page.<p>";
        contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Kanary
    else if (result.service_flag === "Kanary") {
      if (result.fetchData && result.removedData && result.blockedData) {
        const temp_inprogress = result.fetchData.length;
        const temp_removed = result.removedData.length;
        const temp_blocked = result.blockedData.length;
        stat.textContent = "In progress: " + temp_inprogress + ", Removed: " + temp_removed + ", Blocked: " + temp_blocked;
      } else {
        stat.textContent = 'No statistics available.';
      }

      // Print removal progress as table
      if (result.fetchData) {
        const flattenedFetchData = result.fetchData.map(item => flattenObject(item));
        const flattenedRemovedData = result.removedData.map(item => flattenObject(item));
        const flattenedBlockedData = result.blockedData.map(item => flattenObject(item));
        const mergedData = flattenedFetchData.concat(flattenedRemovedData).concat(flattenedBlockedData);
        const filteredData = filterData(mergedData, Kanary_key_list);
        contentElement.appendChild(createHtmlTable(filteredData, Kanary_key_list));

        broker_data = filteredData;
        stat_data = {'inprogress': result.fetchData.length, 'removed': result.removedData.length, 'blocked': result.blockedData.length},
        service = "Kanary";
        fetch_data_time = result.update_time;
        valid_count = countValidObject(filteredData, 'site.domain');
        is_valid = countValidObject(filteredData, 'site.domain') > filteredData.length * 0.8;

        const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
        fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      } else {
        contentElement.innerHTML = "<p>No data available. Please refresh the page.<p>";
        contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Mozilla
    else if (result.service_flag === "Mozilla") {

      // Display block
      // document.getElementById('copyData').style.display = 'block';

      // When user clikc process button, then extract data and display in table
      // processButton.addEventListener('click', function() {

      //   // Extract data, and turn into json format
      //   const extractJson = extractInfoToJSON(inputField.value);
      //   inputField.value = ''
      //   console.log(extractJson);
      //   if (extractJson.hasOwnProperty("manuallyFixed") && extractJson.hasOwnProperty("autoRemoved") && extractJson.hasOwnProperty("inProgress")) {
      //     const temp_manually = extractJson.manuallyFixed;
      //     const temp_auto = extractJson.autoRemoved;
      //     const temp_inProgress = extractJson.inProgress;
      //     stat.textContent = "Auto removed: " + temp_auto + ", Manually fixed: " + temp_manually + ", In progress: " + temp_inProgress;
      //   } else {
      //     stat.textContent = 'No statistics available. Please try copy/paste again!';
      //   }
  
      //   // Print removal progress as table
      //   if (extractJson.hasOwnProperty("exposures") && extractJson.exposures.length > 0) {
      //     contentElement.innerHTML = "";
      //     contentElement.style = "";
      //     contentElement.appendChild(createHtmlTable(extractJson.exposures, ['dataBroker', 'status', 'dateOfExposure']));

      //     broker_data = extractJson.exposures;
      //     stat_data = {
      //       manuallyFixed: extractJson.manuallyFixed,
      //       autoRemoved: extractJson.autoRemoved,
      //       inProgress: extractJson.inProgress,
      //     },
      //     service = "Mozilla";
      //     fetch_data_time = result.update_time;
      //     valid_count = countValidObject(extractJson.exposures, 'dataBroker');
      //     is_valid = countValidObject(extractJson.exposures, 'dataBroker') > extractJson.exposures.length * 0.8;

      //     const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
      //   fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      //   } else {
      //     contentElement.innerHTML = "<p>No data available. Please try copy/paste again!<p>";
      //     contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      //   }
      // });

      
      if (result.statData) {
        const temp_manually = result.statData['Manually fixed'];
        const temp_removed = result.statData['Auto-removed'];
        const temp_inProgress = result.statData['In progress'];
        stat.textContent = "Manually fixed: " + temp_manually + ", Auto-removed: " + temp_removed + ", In progress: " + temp_inProgress;
      } else {
        stat.textContent = 'No statistics available.';
      }


      // Print removal progress as table
      if (result.fetchData) {
        // const flattenedData = result.fetchData.map(item => flattenObject(item));
        const filteredData = filterData(result.fetchData, Mozilla_key_list);
        contentElement.appendChild(createHtmlTable(filteredData, Mozilla_key_list));

        broker_data = filteredData;
        stat_data = result.statData;
        service = "Mozilla";
        fetch_data_time = result.update_time;
        valid_count = countValidObject(filteredData, 'Company');
        is_valid = countValidObject(filteredData, 'Company') > filteredData.length * 0.8;

        const curr_update_time = result.update_time.replace('T', ' ').slice(0, 10)
        fetchDataTimeIndicator.textContent = '(extracted at ' + curr_update_time + ')'
      } else {
        contentElement.innerHTML = "<p>No data available. Please refresh the page.<p>";
        contentElement.style = "font-weight: bold; text-align: center; font-size: 20px; color: #FF003C";
      }

    }
  });  
});

// For mozilla monitor, extract json data from copy text
function extractInfoToJSON(data) {
  const manuallyFixedRegex = /(\d+)(?:\r\n|\r|\n)Manually fixed/i;
  const autoRemovedRegex = /(\d+)(?:\r\n|\r|\n)Auto-removed/i;
  const inProgressRegex = /(\d+)(?:\r\n|\r|\n)In progress/i;
  
  const manuallyFixedMatch = data.match(manuallyFixedRegex);
  const autoRemovedMatch = data.match(autoRemovedRegex);
  const inProgressMatch = data.match(inProgressRegex);

  const manuallyFixed = manuallyFixedMatch ? parseInt(manuallyFixedMatch[1]) : 0;
  const autoRemoved = autoRemovedMatch ? parseInt(autoRemovedMatch[1]) : 0;
  const inProgress = inProgressMatch ? parseInt(inProgressMatch[1]) : 0;

  const companyRegex = /Company\s*[\r\n]+(?!Date found|logo|Exposure type)([^\n]+)/gi;
  const dateOfExposureRegex = /Date of the exposure\s*[\r\n]+([^\n]+)/gi;
  const statusRegex = /Status\s*[\r\n]+(?!Company logo)([^\n]+)/gi;

  let matches;
  let companies = [];
  let datesOfExposure = [];
  let statuses = [];

  while ((matches = companyRegex.exec(data)) !== null) {
    companies.push(matches[1].trim());
  }
  
  while ((matches = dateOfExposureRegex.exec(data)) !== null) {
    datesOfExposure.push(matches[1].trim());
  }
  
  while ((matches = statusRegex.exec(data)) !== null) {
    statuses.push(matches[1].trim());
  }
  
  const result = {
    manuallyFixed: manuallyFixed,
    autoRemoved: autoRemoved,
    inProgress: inProgress,
    exposures: companies.map((company, index) => ({
      dataBroker: company,
      dateOfExposure: datesOfExposure[index],
      status: statuses[index]
    }))
  };

  return result;
}

// Flatten json data
function flattenObject(ob, parentPrefix = '') {
  const toReturn = {};

  for (const i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      const prefix = parentPrefix.length ? parentPrefix + '.' : '';
      if ((typeof ob[i]) === 'object' && ob[i] !== null) {
          Object.assign(toReturn, flattenObject(ob[i], prefix + i));
      } else {
          toReturn[prefix + i] = ob[i];
      }
  }
  return toReturn;
}

// Filter the data by pre-define key list
function filterData(data, keys) {
  return data.map(item => {
    const newItem = {};
    keys.forEach(key => {
        if (item.hasOwnProperty(key)) {
            newItem[key] = item[key];
        }
    });
    return newItem;
  });
}

// Use filtered data to create HTML table
function createHtmlTable(data, keys) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');

  // Create table header, and filter the key
  keys.forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Create table body
  data.forEach(item => {
      const row = document.createElement('tr');
      keys.forEach(key => {
          const td = document.createElement('td');
          td.textContent = item.hasOwnProperty(key) ? item[key] : 'None';
          row.appendChild(td);
      });
      tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

// Count how may object is valid in extracted data
function countValidObject(data, key) {
  let validObject = 0;
  if (data.length === 0) {
    return validObject
  }
  if (data[0].hasOwnProperty(key)) {
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i][key] === 'string') {
        validObject++;
      }
    }
    return validObject;
  }
  else {
    return validObject;
  }
}


function sendSubscription() {
  subscription_data = {
    "email": current_email,
    'service': service,
    "timestamp": new Date().toISOString()
  }
  fetch('http://' + ip_port, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription_data)
  })
  .then(response => {
    if (response.ok) {
      document.getElementById('verify_result').innerHTML = 'Successfully verify your subscription.';
      document.getElementById('verify_result').style = 'color: #88C100; font-size: 18px;';

      document.getElementById("task1_state").textContent = '(Complete)';
      document.getElementById("task1_state").style = 'font-weight: bold; color: #88C100;';
      localStorage.setItem('task1_state', '(Complete)');
      localStorage.setItem('task1_state_style', 'font-weight: bold; color: #88C100;');

      return response.json();
    } else {
      throw new Error('Failed, please refresh the page and try again.');
    }
  })
  // .then(data => {
  //   document.getElementById('completion_code_1').textContent = data.completion_code;
  // })
  .catch(error => {
    document.getElementById('verify_result').textContent = 'Failed to verify subscription.' + error;
    document.getElementById('verify_result').style = 'color: #FF003C; font-size: 18px;';
  });
}

var random_code = null;

function sendData() {
  if (is_valid === false) {
    document.getElementById('result').textContent = 'Data invalid, please refresh the page and try again.';
    document.getElementById('result').style = 'color: #FF003C'
  }
  else {
    send_data = {
      "broker_data": broker_data,
      "stat_data": stat_data,
      "service": service,
      "email": current_email,
      "timestamp": new Date().toISOString(),
      "fetch_data_time": fetch_data_time,
      "valid_count": valid_count,
      "is_valid": is_valid
    };
    fetch('http://' + ip_port, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(send_data)
    })
    .then(response => {
      if (response.ok) {
        // document.getElementById('send').disabled = true;
        return response.json();
      } else {
        throw new Error('Service result send failed, please refresh the page and try again.');
      }
    })
    .then(data => {
      curr_count = data.count;
      // curr_more_than_week = data.more_than_week;
      // curr_completion_code = data.completion_code

      document.getElementById('result').innerHTML = 'Service result send successed!',
      document.getElementById('result').style = 'color: #88C100'

      document.getElementById("task2_state").textContent = '(Send times: ' + curr_count + ')';
      document.getElementById("task2_state").style = 'font-weight: bold; color: #f6db46;';
      localStorage.setItem('send_times', curr_count);
      localStorage.setItem('task2_state_style', 'font-weight: bold; color: #f6db46;');
    })
    .catch(error => {
      document.getElementById('result').textContent = error.message;
      document.getElementById('result').style = 'color: #FF003C'
    });
  }
}


function sendErrorData() {
  var radios = document.getElementsByName('option');
  var selectedValue;
  for (var radio of radios) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }
  if (selectedValue) {
    chrome.storage.local.get(['service_flag'], (result) => {
      error_data = {
        "error": selectedValue,
        "service": service,
        "email": current_email,
        "timestamp": new Date().toISOString(),
        "valid_count": valid_count,
        "is_valid": is_valid        
      }
      fetch('http://' + ip_port, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error_data)
      })
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          throw new Error('Error report send failed, please try again.');
        }
      })
      .then(data => {
        document.getElementById('result').textContent = 'Error report send successed, thank you for your feedback!';
        document.getElementById('result').style = 'color: #88C100'
      })
      .catch(error => {
        document.getElementById('result').textContent = 'Error report send failed: ' + error.message;
        document.getElementById('result').style = 'color: #FF003C'
      });

    });
    
  } else {
    document.getElementById('result').textContent = 'Please select at least one option.';
    document.getElementById('result').style = 'color: #FF003C'
  }
}