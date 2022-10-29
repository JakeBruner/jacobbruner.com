for file in ~/Documents/Github/jacobbruner.com/static/images/kili/*
do
  cwebp -q 50 "$file" -o "${file%.*}.webp"
done
