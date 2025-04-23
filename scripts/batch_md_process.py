import os
import random
from datetime import datetime, timedelta
import glob

# DIR
folder_path = r"c:\\Users\\19236\\Desktop\\！！！！\\unaLoo.github.io\\_algorithm"

# glob
file_paths = glob.glob(os.path.join(folder_path, '*.md'))

# Date
def random_date(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

start_date = datetime(2025, 3, 1)
end_date = datetime(2025, 4, 30)


for file_path in file_paths:
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
    
    original_basename = os.path.basename(file_path)
    title = os.path.splitext(original_basename)[0]

    date_obj = random_date(start_date, end_date)
    date_str = date_obj.strftime("%Y-%m-%d")

    jekyll_prefix = f"""---
title: "{title}"
collection: algorithm
type: algorithm
date: {date_str}
location: 中国南京
---
"""
    # 添加前缀到文件内容
    new_content = jekyll_prefix + content
    
    # 构建新的文件名
    new_filename = f"{date_str}-{original_basename}"
    new_file_path = os.path.join(folder_path, new_filename)

    # 写入新文件
    with open(new_file_path, "w", encoding="utf-8") as file:
        file.write(new_content)

    # 删除原始文件
    os.remove(file_path)


print("所有文件已成功添加 Jekyll 前缀并重命名！")