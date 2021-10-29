from PIL import Image
import io
import numpy as np

from controller.mtcnn_model import create_model

Model_MTCCN = create_model()


def get_bytes_value(image):
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()


def process_crop_face_image(image):
    img = np.array(image)
    result = Model_MTCCN.detect_faces(img)
    box = result[0].get('box')
    x, y, width, height = box[0], box[1], box[2], box[3]
    image_crop = image.crop((x, y, x+width, y+height))
    return image_crop


def crop_face_image(file):
    image_bytes = file.file.read()
    decode = io.BytesIO(image_bytes)
    image = Image.open(decode)
    try:
        image = process_crop_face_image(image)
    except Exception as e:
        print("crop_face_image error: {}".format(e))
        return "crop face image fail"
    return get_bytes_value(image)