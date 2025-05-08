
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    //DataSeal
    if (details.url.startsWith('https://api.dataseal.io/account/') && details.url.endsWith('/widgets/dashboard') && (details.type === 'xmlhttprequest' || details.type === 'fetch')) {
      
      service = "DataSeal"
      chrome.storage.local.set({ 'service_flag': service });

      update_time = new Date().toISOString();
      chrome.storage.local.set({ 'update_time': update_time });

      const userId = DataSeal_userId_extract(details.url)
      const subscribe_URL = "https://api.dataseal.io/me"
      const report_URL = "https://api.dataseal.io/account/" + userId + "/widgets/dashboard"
      const broker_URL = "https://api.dataseal.io/brokers?enabled=true"
      
      const req_headers = {};
      for (const header of details.requestHeaders) {
        req_headers[header.name] = header.value;
      }

      fetchData(subscribe_URL, req_headers).then(data => {
        if (data.body.hasOwnProperty("enrollment") && data.body.enrollment !== null) {
          chrome.storage.local.set({ 'is_subscribe': true });
        }
        else {
          chrome.storage.local.set({ 'is_subscribe': false });
        }
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(report_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'statData': data.body.overview });
        chrome.storage.local.set({ 'fetchData': data.body.records });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(broker_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'brokerData': data.body });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Kanary
    else if (details.url === "https://my.kanary.com/api/account/me/" && (details.type === 'xmlhttprequest' || details.type === 'fetch')) {
    
      service = "Kanary"
      chrome.storage.local.set({ 'service_flag': service });

      update_time = new Date().toISOString();
      chrome.storage.local.set({ 'update_time': update_time });

      const active_URL = "https://my.kanary.com/api/matches/summary/?page=1&match_status=3";
      const removed_URL = "https://my.kanary.com/api/matches/summary/?page=1&match_status=4";
      const blocked_URL = "https://my.kanary.com/api/matches/summary/?page=1&match_status=5";  
      const subscribe_URL = "https://my.kanary.com/api/account/me/";

      const req_headers = {};
      for (const header of details.requestHeaders) {
        req_headers[header.name] = header.value;
      }

      fetchData(subscribe_URL, req_headers).then(data => {
        if (data.hasOwnProperty("product") && data.product.price >= 1500) {
          chrome.storage.local.set({ 'is_subscribe': true });
        }
        else {
          chrome.storage.local.set({ 'is_subscribe': false });
        }
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(active_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'fetchData': data.matches });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(removed_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'removedData': data.matches });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(blocked_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'blockedData': data.matches });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

    }

////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Optery
    else if (details.url === "https://api.optery.com/api/optout/dashboard" && (details.type === 'xmlhttprequest' || details.type === 'fetch')) {
    
      service = "Optery"
      chrome.storage.local.set({ 'service_flag': service });

      update_time = new Date().toISOString();
      chrome.storage.local.set({ 'update_time': update_time });

      const broker_URL = "https://api.optery.com/api/optout/dashboard";
      const stat_URL = "https://api.optery.com/api/optout/dashboard/charts";
      const subscribe_URL = "https://api.optery.com/api/user/me";

      const req_headers = {};
      for (const header of details.requestHeaders) {
        req_headers[header.name] = header.value;
      }

      fetchData(subscribe_URL, req_headers).then(data => {
        if (data.hasOwnProperty("plan") && data.plan.plan_price >= 24) {
          chrome.storage.local.set({ 'is_subscribe': true });
        }
        else {
          chrome.storage.local.set({ 'is_subscribe': false });
        }
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(broker_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'fetchData': data.sources });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(stat_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'statData': data });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Incogni
    else if (details.url.startsWith('https://api.incogni.com/api/users/') && details.url.endsWith('/data_removal_jobs/data_removal_tasks?page=1&itemsPerPage=15&pagination=true&group.broker=last_task') && (details.type === 'xmlhttprequest' || details.type === 'fetch')) {
      
      service = "Incogni"
      chrome.storage.local.set({ 'service_flag': service });

      update_time = new Date().toISOString();
      chrome.storage.local.set({ 'update_time': update_time });

      // Extract user id, and reformat url
      const userId = Incogni_userId_extract(details.url)
      const report_URL = "https://api.incogni.com/api/users/" + userId + "/data_removal_jobs/data_removal_tasks?page=1&itemsPerPage=300&pagination=true&group.broker=last_task";
      const stat_URL = "https://api.incogni.com/api/users/" + userId + "/data_removal_statistics";
      const subscribe_URL = "https://api.incogni.com/api/users/" + userId + "/user_payment_subscription";

      const req_headers = {};
      for (const header of details.requestHeaders) {
        req_headers[header.name] = header.value;
      }
      
      fetchData(subscribe_URL, req_headers).then(data => {
        if (data.isSubscriptionActive === true) {
          chrome.storage.local.set({ 'is_subscribe': true });
        } 
        else {
          chrome.storage.local.set({ 'is_subscribe': false });
        }
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(report_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'fetchData': data["hydra:member"] });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });

      fetchData(stat_URL, req_headers).then(data => {
        chrome.storage.local.set({ 'statData': data });
      }).catch(error => {
        console.error('Error during fetch:', error);
      });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Mozilla Monitor
    else if (details.url === "https://monitor.mozilla.org/api/auth/session") {
    
      service = "Mozilla"
      chrome.storage.local.set({ 'service_flag': service });

      update_time = new Date().toISOString();
      chrome.storage.local.set({ 'update_time': update_time });

      const broker_URL = "https://monitor.mozilla.org/user/dashboard";
      const subscribe_URL = "https://monitor.mozilla.org/api/auth/session";

      const req_headers = {};
      for (const header of details.requestHeaders) {
        req_headers[header.name] = header.value;
      }
      
      fetchData(subscribe_URL, req_headers).then(data => {
        if (data.user.hasOwnProperty("fxa") && data.user.fxa.hasOwnProperty("subscriptions") && data.user.fxa.subscriptions.length !== 0) {
          chrome.storage.local.set({ 'is_subscribe': true });
        }
        else {
          chrome.storage.local.set({ 'is_subscribe': false });
        }
      }).catch(error => {
        console.error('Error during fetch:', error);
      });


      // fetchData(broker_URL, req_headers).then(data => {
      //   chrome.storage.local.set({ 'fetchData': data });
      // }).catch(error => {
      //   console.error('Error during fetch:', error);
      // });

    }
    return { cancel: false }; 
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);


chrome.runtime.onMessage.addListener((message) => {
  const { site, data, stat } = message
  if (site === 'mozilla-monitor.org') {
    // Data here now contains all rows from the mozilla monitor dashboard,
    // as an array of objects with structure like this:
    // {
    //  'Company': "411.com"
    //  'Date of the exposure': "Apr 9, 2024"
    //  'Exposure type': "Info for sale"
    //  'Status': "In progress" 
    // }
    chrome.storage.local.set({ 'fetchData': data });
    chrome.storage.local.set({ 'statData': stat });
    console.log(stat)
  }
})



async function fetchData(url, header) {
  try {
      const response = await fetch(url, {method: 'GET', headers: header});
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (url === "https://monitor.mozilla.org/user/dashboard") {
        const html = await response.text()
        
        return html;
      }
      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Request failed', error);
  }
}



function DataSeal_userId_extract(url) {
  const regex = /\/account\/([^\/]+)\/widgets\/dashboard/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function Incogni_userId_extract(url) {
  const regex = /\/api\/users\/([^\/]+)\/data_removal_jobs\/data_removal_tasks/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function flattenJson(obj, parentKey = '', result = {}) {
  for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
          let propName = parentKey ? parentKey + '.' + key : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              flattenJson(obj[key], propName, result);
          } else {
              result[propName] = obj[key];
          }
      }
  }
  console.log(result);
  return result;
}