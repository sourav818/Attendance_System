import requests

url = "http://127.0.0.1:5000/api/register"
data = {
    "username": "Sourav",
    "password": "123@Sourav"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=data, headers=headers)

print(response.json())  # Print response from the server
