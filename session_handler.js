

function get_gpt_answer(question, num) {
  const apiUrl = 'http://127.0.0.1:5000/api/chatgpt';
  const data = {
      question: question,
  };

  fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    //console.log(data)
      if (data.error) {
        console.error(data.error)
        answer_msg = `Ошибка: ${error}`
        return
      }
      answer_msg = `Model: ${data.model})<br>${data.answer}`
      
      const gptAnswerElement = document.getElementById(`gpt-answer-${num}`);
      if (gptAnswerElement) {
        gptAnswerElement.innerHTML = answer_msg;
      }
  }).catch(error =>{
    const gptAnswerElement = document.getElementById(`gpt-answer-${num}`);
    if (gptAnswerElement) {
      gptAnswerElement.innerHTML = "Ошибка загрузки ответа.";
    }
    console.log(error)
  })


}

function show_question(num, question) {
  const questionTypeText = question.type === 'multiquiz' ? "Несколько вариантов ответа" : "Один вариант ответа";
  let htmlContent = `<div style="margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; padding: 15px;">`;

  if (question.content) {
      get_gpt_answer(question.content, num);

      if (question.image) {
        htmlContent += `<div style="margin-bottom: 10px;"><img src="${question.image}" alt="Изображение вопроса" style="max-width: 100%; height: auto;"></div>`;
      }    
      htmlContent += `<div><h3 style="color: grey;">${num}. ${question.content}</h3><p style="color: grey; margin-bottom: 10px;">${questionTypeText}</p><ul style="list-style-type: none; padding-left: 0;">`;
      for (const opt of question.options) {
          htmlContent += `<li style='padding: 10px; background-color: #f4f4f4; border-radius: 5px; margin-bottom: 5px;'>`;
          if (opt.image) {
              htmlContent += ` <img src='${opt.image}' alt='Изображение варианта ответа' style='max-width: 100px; height: auto;'>`;
          } else if (opt.value) {
              htmlContent += `${opt.value}`;
          }
          htmlContent += `</li>`;
      }
      htmlContent += `</ul><p style="margin-top: 10px;"><strong>Ответ чата ГПТ:</strong><br><div id="gpt-answer-${num}">Загрузка...</div></p></div><div style="margin-top: 10px;"><a href="https://www.google.com/search?q=${encodeURIComponent(question.content)}" target="_blank" style="text-decoration: none;"><button style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Поиск в Google</button></a></div></div>`;
  } else {
      htmlContent += `<div><h3 style="color: grey;">${num}. Текст пуст.</h3></div></div>`;
  }

  return htmlContent;
}







function updateContent(jsonData) {
  const dataElement = document.getElementById('data');
  if (dataElement && Object.keys(jsonData).length > 0) {
    const data = jsonData.data
    
    let html = `
      <a href="${jsonData.sourse_url}" class="btn" target="_blank">Вернутся</a>
      <div id="test_info">
      <p style='margin-top: 1px;'>Вопросов: ${data.document.questions} | ${data.settings.name}</p>
      <br>
      <a href="https://naurok.com.ua/test?q=${encodeURIComponent(data.settings.name)}" class="btn" target="_blank">Найти оригинал теста</a>
			<div style="margin-bottom: 15px;">
      <!-- <p style="font-style: italic; color: #999;">Это может занять некоторое время</p>  -->
			</div>
      </div>
    `;
    //console.log(data)

    data.questions.forEach((question, index) => {
      html+=show_question(index+1, question);
    });

    dataElement.innerHTML = html;
  } else {
    dataElement.innerHTML = '<p>No data available.</p>';
  }
}







browser.runtime.onMessage.addListener(message => {
  if (message.action === 'updateData') {
    updateContent(message.data);
  }
});
document.addEventListener('DOMContentLoaded', function () {
  browser.runtime.sendMessage({ action: 'getData' });
});
