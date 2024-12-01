from flask import Flask, request, jsonify, render_template
from g4f.client import Client
from g4f.errors import (
    ProviderNotWorkingError,
    ModelNotAllowedError,
    ModelNotSupportedError,
    RateLimitError
)
app = Flask(__name__)

model="gpt-4"
client = Client()

def send_response(message: str):
	if message is None or message == '' or message == ' ':return
	
	response = client.chat.completions.create(
		model=model,
		messages=[
			{"role": "user", "content": message}
		]
	)
	gpt_response = response.choices[0].message.content
	gpt_response=gpt_response.replace("####", "").replace("*", "")
	temp = gpt_response.split("\n\n")
	message = '\n\n'.join(temp[1:] if len(temp)!=1 else temp)
	return message



@app.after_request
def add_headers(response):
    response.headers['Accept'] = 'application/json'
    response.headers['Accept-Language'] = 'en-US'
    response.headers['Content-Language'] = 'en'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response



@app.route('/api/chatgpt', methods=['POST', 'OPTIONS'])
def chatgpt():

    if request.method == 'OPTIONS':
        return jsonify({"msg": "OK"}), 200

    data = request.json
    question = data.get('question')
    while True:
        try:
            answer = send_response(
            question
            )
            break
        except (
            ProviderNotWorkingError,
            ModelNotAllowedError,
            ModelNotSupportedError,
        ): pass
        except RateLimitError:
            answer = "Сервис перегружен. попробуйте позже."
            break
        except Exception as e:
            answer = f"Серверная ошибка."
            break

    return jsonify({
        'answer': answer,
        'model': model
    }), 200




@app.route('/')
def home():
    return render_template('gpt_index.html')




if __name__ == '__main__':
    app.run(port=5000)
