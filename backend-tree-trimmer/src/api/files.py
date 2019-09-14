from json import loads
import os
from http import HTTPStatus
from pathlib import Path
import pickle

from flask import current_app, request
from flask_restplus import Namespace, Resource, fields, marshal, abort
from werkzeug.utils import secure_filename

from ..core.data_preprocessor import DataPreprocessor

# from api import data_dict

files = Namespace(
    name='Files',
    description='API for file management',
    path='/files'
)

file_upload_response = files.model('file_upload_response', {
    'message': fields.String
})


@files.route('')
class FileManager(Resource):

    def __init__(self, *args, **kwargs):
        self.UPLOAD_FOLDER = current_app.config['UPLOAD_FOLDER']
        super().__init__(*args, **kwargs)

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

    @files.response(HTTPStatus.CREATED, 'File successfully loaded', file_upload_response)
    @files.response(HTTPStatus.FORBIDDEN, 'Only .csv files currently accepted', file_upload_response)
    def post(self):

        app_path = Path(__file__).parents[1]

        with open(os.path.join(app_path, self.UPLOAD_FOLDER + 'data-dict.pickle'), 'rb') as f:
            data_dict = pickle.load(f)

        print(request.headers)
        print(request.form)
        print(request.files)

        file = request.files['file']
        print(file)
        target_index = loads((request.form['target_index']))
        print(target_index)

        if not os.path.isdir(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)

        if file and self.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(self.UPLOAD_FOLDER, filename)
            file.save(file_path)

            dpp = DataPreprocessor()
            numpy_dict = dpp.file_to_numpy(file_path, target_index)
            data_dict.update(numpy_dict)

            with open(self.UPLOAD_FOLDER + 'data-dict.pickle', 'wb') as f:
                pickle.dump(data_dict, f, protocol=pickle.HIGHEST_PROTOCOL)

            return marshal(dict(message='File successfully loaded'), file_upload_response), HTTPStatus.CREATED

        else:
            abort(HTTPStatus.FORBIDDEN, 'Only .csv files currently accepted')


@files.route('/test')
class FileTestManager(Resource):
    def post(self):
        print('File Upload Test Post')
        print(request)
        print(request.headers)
        print(request.form)
        print(request.files)
        # file = request.files['file']
        # target_index = loads((request.form['target_index']))
        # print('file, ', file)
        # print('target_index, ', target_index)
        return marshal(dict(message='File successfully loaded'), file_upload_response), HTTPStatus.CREATED
