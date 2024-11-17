from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

app = Flask(__name__)

SERVICE_ACCOUNT_FILE = 'path/to/your/service_account_file.json'
SCOPES = ['https://www.googleapis.com/auth/drive.file']

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

drive_service = build('drive', 'v3', credentials=credentials)

@app.route('/upload', methods=['POST'])
def upload_to_drive():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    file_path = '/tmp/' + file.filename
    file.save(file_path)

    media = MediaFileUpload(file_path, mimetype=file.content_type)
    file_metadata = {'name': file.filename}

    uploaded_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    return jsonify({"file_id": uploaded_file.get('id')}), 200

if __name__ == '__main__':
    app.run(debug=True)
