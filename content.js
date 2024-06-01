
function get_session_id(ngInitValue) {
    let initValues = ngInitValue.split(',');
    if (initValues.length >= 3) {
        return initValues[1].trim();
    } else {
        return null; 
    }
}


async function get_session_info(sessionId) {
    try {
      let url = `https://naurok.com.ua/api2/test/sessions/${sessionId}`;
      let response = await fetch(url);
      if (response.ok) {
        let jsonResponse = await response.json();
        return jsonResponse;
      } else {
        console.error('Ошибка выполнения запроса:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Ошибка выполнения запроса:', error);
      return null;
    }
  }


  browser.runtime.onMessage.addListener(async (message, sender) => {
    console.log('Получено сообщение:', message);
    if (message.action !== 'start') {
        return{ status: false, msg: 'Некорректный тип действия.' };
    }
  
    let xpath = '/html/body/div[1]/div';
    let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!element) {
        return { status: false, msg: 'Не удалось найти элемент.' };
    }
  
    let sID = get_session_id(element.getAttribute('ng-init'));
    if (sID === null) {
        return { status: false, msg: 'Не удалось получить id сессии.' };
      
    }
    let sInfo = await get_session_info(sID);
    console.log(sInfo);
    if (sInfo === null) {
        return{ status: false, msg: 'Не удалось получить информацию о сессии.' };
    }

    return{ status: true, data: sInfo };
  });