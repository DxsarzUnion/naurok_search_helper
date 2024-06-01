async function getCurrentTabUrl() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    return currentTab.url;
  } catch (error) {
    console.error(`Ошибка при получении URL текущей вкладки: ${error}`);
    return null;
  }
}

function checkPage(currentUrl) {
  if (currentUrl && currentUrl.startsWith("https://naurok.com.ua")) {
    if (currentUrl.includes("/test/testing/")) {
      return true;
    }
  }
  return false;
}

function errorCurrentTab() {
  browser.notifications.create({
    "type": "basic",
    "title": "TabError",
    "message": "Текущая страница не является запущенным тестом сайта naurok.ua"
  });
}

function error(msg){
  browser.notifications.create({
    type: 'basic',
    title: 'Error',
    message: msg
  });
}



function sendDataToPage(tabId, data) {
  const scriptCode = `
    var jsonData = ${JSON.stringify(data)};
    browser.runtime.sendMessage({ action: 'updateData', data: jsonData });
  `;

  browser.tabs.executeScript(tabId, { code: scriptCode }).then(() => {
    //console.log('Данные успешно отправлены на страницу');
  }).catch((error) => {
    console.error('Ошибка отправки данных на страницу:', error);
  });
}
function resultTab(url) {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    let activeTab = tabs[0];
    if (activeTab) {
      //console.log('Отправка сообщения в контентный скрипт', activeTab.id);
      browser.tabs.sendMessage(activeTab.id, { action: 'start', url: url })
        .then((response) => {
          //console.log('Ответ получен:', response.status);
          if (response && response.status === false) {
            error(response.msg);
            return;
          }
          browser.tabs.create({ url: 'result.html' }).then((tab) => {
            //console.log('Новая вкладка создана:', tab.id);
            browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
              if (tabId === tab.id && changeInfo.status === 'complete') {
                //console.log('Страница загружена:', updatedTab.id);
                sendDataToPage(tabId, {sourse_url: url, data: response.data});
                browser.tabs.onUpdated.removeListener(listener);
              }
            });
          });
        })
        .catch((error) => {
          error('Ошибка отправки сообщения в контентный скрипт:', error);
        });
    } else {
      error('Не удалось найти активную вкладку.');
    }
  }).catch((error) => {
    error('Ошибка при выполнении запроса вкладок:', error);
  });
}


browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    const url = await getCurrentTabUrl();
    const isTest = checkPage(url);
    if (isTest == true) {
      resultTab(url);
    } else {
      errorCurrentTab();
    }
  } catch (error) {
    console.error('Ошибка при обработке нажатия на кнопку:', error);
  }
});
