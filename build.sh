docker build -t volume-updater .
docker run \
  --volume sudoku:/data \
  --rm \
  volume-updater \
  bash -c 'cp -r /web/build/* /data/.'
