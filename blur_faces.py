import cv2
import os
from PIL import Image, ImageFilter
import numpy as np

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

images_dir = 'images'
output_dir = 'images/blurred'
os.makedirs(output_dir, exist_ok=True)

to_process = [
    '20240518_113412.jpg', '20240929_141817.jpg', '20241101_124341_resized.jpg',
    '20250328_172829.jpg', '20250630_202741.jpg', '20250927_100433.jpg',
    '20251002_184830.jpg', '20251009_180715.jpg', '20251009_180937.jpg',
    '20251009_184852.jpg', '20251018_095427.jpg', '20251027_113442.jpg',
    '20251027_114835.jpg', '20251107_123022.jpg', '20251107_123038.jpg',
    '20260423_132833.jpg', '20260423_132843.jpg',
    '3681.jpg', '4115.jpg', '4127.jpg',
    '_DSC1861.JPG', 'image00014.jpeg', 'image00014(1).jpg',
    'IMG-20240508-WA0000.jpg', 'IMG-20250602-WA0015.jpg', 'IMG-20250621-WA0002.jpg',
    'IMG-20260303-WA0000.jpg', 'IMG-20260411-WA0000.jpg',
    'IMG_20260414_175521501.jpg', 'IMG_29341(1).jpg',
    'P1210087.JPG', 'P1210094.JPG',
    'Resized_20260124_113102.jpg',
    'Screenshot_20260302_175210_Gallery.jpg', 'Screenshot_20260324_150726_Gallery.jpg',
    'att.9jeBy-zUmymUdknIxywFh1OViGG7l1fFlrfAyvSB9-I.jpg.jpeg',
    'Business Suite_creation_963717796331041.jpeg',
    'Business Suite_creation_908752255174501.jpeg',
    'DSC_0961.JPG', 'DSC_0951.JPG',
]

def detect_faces(gray, scale):
    faces_front = face_cascade.detectMultiScale(
        gray, scaleFactor=scale, minNeighbors=3, minSize=(40, 40),
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    faces_profile = profile_cascade.detectMultiScale(
        gray, scaleFactor=scale, minNeighbors=3, minSize=(40, 40),
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    faces = []
    if len(faces_front) > 0:
        faces += list(faces_front)
    if len(faces_profile) > 0:
        faces += list(faces_profile)
    return faces

def merge_overlapping(boxes, overlap_thresh=0.3):
    if not boxes:
        return []
    boxes = np.array(boxes)
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 0] + boxes[:, 2]
    y2 = boxes[:, 1] + boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = areas.argsort()[::-1]
    keep = []
    while len(order) > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        inter = w * h
        iou = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(iou <= overlap_thresh)[0]
        order = order[inds + 1]
    return [boxes[i] for i in keep]

def blur_faces(img_path, out_path):
    img_cv = cv2.imread(img_path)
    if img_cv is None:
        print(f"  SKIP: {os.path.basename(img_path)}")
        return

    h, w = img_cv.shape[:2]
    # Resize for detection if too large
    max_dim = 1200
    scale_factor = 1.0
    if max(h, w) > max_dim:
        scale_factor = max_dim / max(h, w)
        small = cv2.resize(img_cv, None, fx=scale_factor, fy=scale_factor)
    else:
        small = img_cv

    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    all_faces = []
    for scale in [1.05, 1.1, 1.2]:
        all_faces += detect_faces(gray, scale)

    # Scale back to original dimensions
    if scale_factor != 1.0 and all_faces:
        all_faces = [(int(x/scale_factor), int(y/scale_factor),
                      int(fw/scale_factor), int(fh/scale_factor))
                     for (x, y, fw, fh) in all_faces]

    # Filter: max face size 60% of image (avoid full-image false positives)
    all_faces = [(x, y, fw, fh) for (x, y, fw, fh) in all_faces
                 if fw < w * 0.6 and fh < h * 0.6 and fw > 30 and fh > 30]

    merged = merge_overlapping(all_faces)

    img_pil = Image.open(img_path)
    n = 0
    for (x, y, fw, fh) in merged:
        pad = int(fh * 0.25)
        x1, y1 = max(0, int(x) - pad), max(0, int(y) - pad)
        x2, y2 = min(w, int(x + fw) + pad), min(h, int(y + fh) + pad)
        region = img_pil.crop((x1, y1, x2, y2))
        blurred = region.filter(ImageFilter.GaussianBlur(radius=25))
        img_pil.paste(blurred, (x1, y1))
        n += 1

    img_pil.save(out_path, quality=88)
    print(f"  {'OK' if n > 0 else 'NO FACE'} ({n} zone(s)): {os.path.basename(img_path)}")

print("Floutage des visages...")
for fname in to_process:
    src = os.path.join(images_dir, fname)
    if not os.path.exists(src):
        continue
    dst = os.path.join(output_dir, fname)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    blur_faces(src, dst)

print("\nTerminé.")
